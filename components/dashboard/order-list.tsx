"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2, 
  Calendar as CalendarIcon, 
  ArrowUpDown,
  Filter,
  CreditCard,
  Banknote,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { CompleteOrderButton } from "@/components/complete-order-button"
import { getSellerOrders, updateOrderStatus, deletePosOrder } from "@/app/actions/seller-orders"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"

interface OrderListProps {
    initialOrders: any[]
    tab: string
}

function BadgeItem({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) {
    const classes = {
        default: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        destructive: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
    }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${(classes as any)[variant]}`}>{children}</span>
}

export function OrderList({ initialOrders, tab }: OrderListProps) {
    const [orders, setOrders] = useState(initialOrders)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialOrders.length === 10)
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
    const [date, setDate] = useState<Date | undefined>(undefined)

    const observer = useRef<IntersectionObserver | null>(null)
    const lastOrderElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore()
            }
        })
        if (node) observer.current.observe(node)
    }, [loading, hasMore])

    // Local filtering & sorting logic
    const filteredAndSortedOrders = React.useMemo(() => {
        let result = [...orders]

        // Search Filter (ID or Name)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase()
            result = result.filter(o => 
                (o.id as string).toLowerCase().includes(lowerSearch) ||
                (o.guest_info?.name || '').toLowerCase().includes(lowerSearch)
            )
        }

        // Date Filter
        if (date) {
            const filterDateStr = format(date, 'yyyy-MM-dd')
            result = result.filter(o => 
                format(new Date(o.created_at), 'yyyy-MM-dd') === filterDateStr
            )
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
        })

        return result
    }, [orders, searchTerm, sortOrder, date])

    // Reset list when tab changes
    useEffect(() => {
        setOrders(initialOrders)
        setPage(1)
        setHasMore(initialOrders.length === 10)
        // Keep search/sort/date state? User usually expects them to persist across tabs
    }, [initialOrders, tab])

    const loadMore = async () => {
        if (loading || !hasMore) return
        setLoading(true)
        const nextPage = page + 1
        const newOrders = await getSellerOrders(nextPage, 10, tab)
        
        if (newOrders.length < 10) {
            setHasMore(false)
        }
        
        setOrders(prev => [...prev, ...newOrders])
        setPage(nextPage)
        setLoading(false)
    }

    const handleStatusUpdate = async (orderId: string, status: string) => {
        const result = await updateOrderStatus(orderId, status)
        if (result.success) {
            toast.success("Status pesanan diperbarui")
            // Refresh list for the current tab (re-fetch current visible items)
            const updated = await getSellerOrders(1, page * 10, tab)
            setOrders(updated)
        } else {
            toast.error(result.error || "Gagal memperbarui status")
        }
    }


const CountdownTimer = ({ createdAt, onExpire, orderId }: { createdAt: string, onExpire?: () => void, orderId: string }) => {
    // Assume 1 hour expiry for POS/Digital transactions urgency
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [isExpired, setIsExpired] = useState(false)
    
    useEffect(() => {
        const expiryTime = new Date(createdAt).getTime() + 60 * 60 * 1000 

        const updateTimer = () => {
            const now = new Date().getTime()
            const distance = expiryTime - now

            if (distance < 0) {
                if (!isExpired) {
                    setIsExpired(true)
                    setTimeLeft("Expired")
                    // Trigger auto delete
                    if (onExpire) onExpire()
                    else {
                        // Default behavior if no callback provided, try to delete directly
                        deletePosOrder(orderId).then((res) => {
                             if(res.success) {
                                toast.error("Pesanan Kadaluarsa & Dihapus")
                                window.location.reload() // Simple reload to refresh list
                             }
                        })
                    }
                }
                return
            }

            const maxDuration = 60 * 60 * 1000
            const effectiveDistance = distance > maxDuration ? maxDuration : distance

            const minutes = Math.floor(effectiveDistance / (1000 * 60))
            const seconds = Math.floor((effectiveDistance % (1000 * 60)) / 1000)

            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }

        updateTimer() // Initial call
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [createdAt, isExpired, onExpire, orderId])

    if (isExpired) return <BadgeItem variant="destructive">Expired</BadgeItem>

    return (
        <div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-black font-mono">{timeLeft}</span>
        </div>
    )
}

    const getStatusBadge = (order: any) => {
        const status = order.status
        switch (status) {
            case 'pending_payment': 
                return (
                    <div className="flex items-center">
                        <BadgeItem variant="warning">Bayar</BadgeItem>
                        <CountdownTimer 
                            createdAt={order.created_at} 
                            orderId={order.id}
                            onExpire={async () => {
                                const res = await deletePosOrder(order.id)
                                if (res.success) {
                                    toast.info("Pesanan kadaluarsa otomatis dihapus", { icon: <Clock className="h-4 w-4" /> })
                                    // Remove from local list
                                    setOrders(prev => prev.filter(o => o.id !== order.id))
                                }
                            }}
                        />
                    </div>
                )
            case 'pending_confirmation': return <BadgeItem variant="info">Konfirmasi</BadgeItem>
            case 'paid': return <BadgeItem variant="success">Lunas</BadgeItem>
            case 'accepted': return <BadgeItem variant="info">Diterima</BadgeItem>
            case 'processing': return <BadgeItem variant="warning">Proses</BadgeItem>
            case 'ready': return <BadgeItem variant="success">Siap</BadgeItem>
            case 'completed': return <BadgeItem variant="success">Selesai</BadgeItem>
            case 'rejected': return <BadgeItem variant="destructive">Ditolak</BadgeItem>
            default: return <BadgeItem>{status}</BadgeItem>
        }
    }

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-col gap-3">
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-hidden transition-all shadow-xs"
                        placeholder="Cari ID Pesanan atau Nama Pelanggan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="outline" 
                                className={cn(
                                    "rounded-xl h-10 px-3 bg-white border-slate-200 text-xs font-bold hover:bg-slate-50 transition-all",
                                    date && "text-primary border-primary/20 bg-primary/5"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                {date ? format(date, "d MMMM yyyy", { locale: id }) : "Pilih Tanggal"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={id}
                            />
                            {date && (
                                <div className="p-2 border-t bg-slate-50 flex justify-end">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50"
                                        onClick={() => setDate(undefined)}
                                    >
                                        Hapus Filter
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    {/* Sort Order Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-xs border border-white">
                        <Button 
                            variant={sortOrder === 'desc' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setSortOrder('desc')}
                            className={cn(
                                "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                                sortOrder === 'desc' ? "bg-white text-primary shadow-xs hover:bg-white" : "text-slate-500"
                            )}
                        >
                            Terbaru
                        </Button>
                        <Button 
                            variant={sortOrder === 'asc' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setSortOrder('asc')}
                            className={cn(
                                "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                                sortOrder === 'asc' ? "bg-white text-primary shadow-xs hover:bg-white" : "text-slate-500"
                            )}
                        >
                            Terlama
                        </Button>
                    </div>

                    {(searchTerm || date) && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                setSearchTerm('')
                                setDate(undefined)
                            }}
                            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            Reset Filter
                        </Button>
                    )}
                </div>
            </div>

            {/* Orders List */}
            <div className="grid gap-3">
                {filteredAndSortedOrders.length > 0 ? (
                    filteredAndSortedOrders.map((order: any, index: number) => (
                        <Card 
                            key={order.id} 
                            ref={index === filteredAndSortedOrders.length - 1 ? lastOrderElementRef : null}
                            className="overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all group bg-white rounded-2xl"
                        >
                            <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                                {/* Left Section: ID, Name, Time */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[9px] font-black text-slate-400">#{(order.id as string).slice(0, 8)}</span>
                                        {getStatusBadge(order)}
                                    </div>
                                    <h3 className="font-black text-base text-slate-900 truncate">
                                        {order.guest_info?.name || 'Pelanggan'}
                                    </h3>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Dibuat: {format(new Date(order.created_at), 'HH:mm', { locale: id })}
                                            </span>
                                        </div>
                                        {order.scheduled_for && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100 w-fit">
                                                <CalendarIcon className="h-3 w-3 text-amber-600" />
                                                <span className="text-[10px] font-black text-amber-700 uppercase">
                                                    Jadwal: {format(new Date(order.scheduled_for), 'dd MMM, HH:mm', { locale: id })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Middle Section: List Pesanan (Simple) */}
                                <div className="flex-2 py-2 md:py-0 border-y md:border-y-0 md:border-x border-slate-50 px-0 md:px-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Daftar Pesanan</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                                        {order.order_items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-1.5 py-0.5 px-2 bg-slate-50 rounded-lg border border-slate-100/50">
                                                <span className="font-black text-[11px] text-primary">{item.quantity}x</span>
                                                <span className="font-bold text-[11px] text-slate-700">{item.products?.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Section: Total & Main Actions */}
                                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Total Pesanan</p>
                                        <p className="font-black text-lg text-slate-900 tracking-tight">
                                            {formatCurrency(Number(order.total_amount))}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        {['pending_confirmation', 'paid'].includes(order.status) && (
                                            <div className="flex gap-1.5">
                                                <Button 
                                                    onClick={() => handleStatusUpdate(order.id, 'accepted')}
                                                    size="sm"
                                                    className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Terima
                                                </Button>
                                                <Button 
                                                    onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                                    variant="outline" 
                                                    size="sm"
                                                    className="h-9 px-4 text-destructive border-red-100 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Tolak
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {order.status === 'accepted' && tab !== 'scheduled' && (
                                            <Button 
                                                onClick={() => handleStatusUpdate(order.id, 'ready')}
                                                size="sm"
                                                className="h-9 px-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Siap
                                            </Button>
                                        )}

                                        {order.status === 'ready' && (
                                            <CompleteOrderButton 
                                                orderId={order.id} 
                                                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl" 
                                                onSuccess={async () => {
                                                    const updated = await getSellerOrders(1, page * 10, tab)
                                                    setOrders(updated)
                                                }}
                                            />
                                        )}
                                        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-md border text-slate-400 hover:text-primary hover:bg-primary/5">
                                            <Link href={`/dashboard/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed shadow-xs">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">Hasil tidak ditemukan</h3>
                        <p className="text-muted-foreground text-sm mt-1">Coba kata kunci atau filter tanggal lain.</p>
                        <Button 
                            variant="link" 
                            className="mt-4 text-primary font-black uppercase text-[10px]"
                            onClick={() => {
                                setSearchTerm('')
                                setDate(undefined)
                            }}
                        >
                            Reset Semua Filter
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                )}
                
                {!hasMore && filteredAndSortedOrders.length > 5 && (
                    <div className="text-center py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Semua pesanan telah dimuat
                    </div>
                )}
            </div>
        </div>
    )
}
