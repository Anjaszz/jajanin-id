'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { 
  Package, 
  Store, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Timer, 
  PackageCheck, 
  AlertCircle, 
  ShoppingBag, 
  ChevronRight 
} from "lucide-react"
import { getBuyerOrders } from '@/app/actions/buyer'

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState(false)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_payment': 
        return { label: 'Menunggu Pembayaran', color: 'bg-amber-500', icon: Clock }
      case 'pending_confirmation': 
        return { label: 'Menunggu Konfirmasi', color: 'bg-blue-500', icon: Clock }
      case 'paid': 
        return { label: 'Sudah Dibayar', color: 'bg-emerald-500', icon: CheckCircle2 }
      case 'accepted': 
        return { label: 'Sedang Diproses', color: 'bg-sky-500', icon: Timer }
      case 'processing': 
        return { label: 'Sedang Diproses', color: 'bg-indigo-500', icon: Timer }
      case 'ready': 
        return { label: 'Siap Diambil', color: 'bg-orange-500', icon: PackageCheck }
      case 'completed': 
        return { label: 'Selesai', color: 'bg-emerald-600', icon: CheckCircle2 }
      case 'rejected': 
        return { label: 'Pesanan Ditolak', color: 'bg-rose-500', icon: AlertCircle }
      case 'cancelled_by_seller':
      case 'cancelled_by_buyer': 
        return { label: 'Dibatalkan', color: 'bg-slate-500', icon: AlertCircle }
      default: 
        return { label: status.replace('_', ' '), color: 'bg-muted text-muted-foreground', icon: Package }
    }
  }

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
        setOrders(initialOrders)
        return
    }

    const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
    if (guestOrders.length > 0) {
      setLoading(true)
      const orderIds = guestOrders.map((o: any) => o.id)
      
      getBuyerOrders(orderIds).then(data => {
        setOrders(data || [])
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [initialOrders])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-lg">Memuat Pesanan</p>
          <p className="text-muted-foreground text-sm">Menghubungkan ke dapur jajan...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
           <Package className="h-12 w-12 text-primary opacity-40" />
        </div>
        <h3 className="font-heading font-black text-2xl text-center">Belum ada jajan nih!</h3>
        <p className="text-muted-foreground mt-3 text-center max-w-xs leading-relaxed">
           Riwayat pesanan Anda masih kosong. Yuk cari jajanan favoritmu sekarang!
        </p>
        <div className="flex flex-col w-full max-w-xs gap-3 mt-10">
           <Button asChild className="rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20">
              <Link href="/">Mulai Belanja</Link>
           </Button>
           <Button variant="outline" asChild className="rounded-2xl h-12 font-bold">
              <Link href="/buyer/login">Masuk ke Akun</Link>
           </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
         <h1 className="text-2xl font-heading font-black">Pesanan Saya</h1>
         <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-primary border-primary/20 bg-primary/5">
            {orders.length} Pesanan
         </Badge>
      </div>

      {orders.map((order: any) => {
        const status = getStatusConfig(order.status)
        const StatusIcon = status.icon
        
        return (
          <Card key={order.id} className="overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-3xl group active:scale-[0.98] transition-all">
            <CardHeader className="bg-muted/30 p-4 border-b border-dashed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                     <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Order ID</p>
                    <p className="font-mono text-xs font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-none shadow-sm text-white",
                    status.color
                  )}
                >
                  <StatusIcon className="h-3 w-3 mr-1.5 inline-block" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
               <Link href={`/orders/${order.id}`} className="flex items-center gap-4 group/shop">
                  <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden border-2 border-white shadow-md shrink-0">
                      {order.shop?.logo_url ? (
                        <img src={order.shop.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Store className="h-6 w-6 text-primary/40" />
                        </div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-lg md:text-xl truncate group-hover/shop:text-primary transition-colors">{order.shop?.name}</h4>
                      <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "short", 
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover/shop:bg-primary group-hover/shop:text-white transition-all">
                     <ChevronRight className="h-5 w-5" />
                  </div>
               </Link>
               
               <div className="pt-4 border-t border-muted/50 flex items-end justify-between">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Bayar</p>
                     <p className="font-heading font-black text-2xl text-primary leading-none tracking-tight">
                        {formatCurrency(Number(order.total_amount) + Number(order.gateway_fee || 0))}
                     </p>
                  </div>
                  <div className="text-right">
                     <div className="flex -space-x-2 overflow-hidden mb-2 justify-end">
                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-slate-100 overflow-hidden shadow-sm relative">
                             <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                {item.quantity}x
                             </div>
                          </div>
                        ))}
                     </div>
                     <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full inline-block">
                        {order.items?.length || 0} Menu jajan
                     </p>
                  </div>
               </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
