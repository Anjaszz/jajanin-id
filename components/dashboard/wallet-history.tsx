"use client"

import { useState, useMemo } from 'react'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock,
  XCircle,
  Calendar,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import { 
  Card 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
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
} from "@/components/ui/dialog"
import { AlertCircle, Info } from "lucide-react"

interface WalletHistoryProps {
  initialTransactions: any[]
}

export function WalletHistory({ initialTransactions }: WalletHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemsPerPage = 10

  const dateFilter = date ? format(date, "yyyy-MM-dd") : ""

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...initialTransactions]

    if (searchTerm) {
      result = result.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (dateFilter) {
      result = result.filter(tx => {
        const txDate = new Date(tx.created_at).toISOString().split('T')[0]
        return txDate === dateFilter
      })
    }

    if (typeFilter !== 'all') {
      if (typeFilter === 'deposit') {
        result = result.filter(tx => Number(tx.amount) > 0)
      } else {
        result = result.filter(tx => Number(tx.amount) < 0)
      }
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [initialTransactions, searchTerm, dateFilter, typeFilter, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentTransactions = filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage)

  const getTransactionLabel = (type: string) => {
    switch(type) {
      case 'sales_revenue': return 'Penjualan POS'
      case 'deposit': return 'Deposit / Masuk'
      case 'withdrawal': return 'Penarikan Dana'
      case 'refund': return 'Pengembalian (Refund)'
      case 'platform_fee': return 'Biaya Platform'
      case 'payment': return 'Pembayaran'
      default: return type
    }
  }

  const TransactionTypeBadge = ({ type }: { type: string }) => {
    const config: Record<string, { label: string, className: string }> = {
      sales_revenue: { label: 'Sales', className: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/50' },
      deposit: { label: 'Deposit', className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' },
      withdrawal: { label: 'Withdraw', className: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50' },
      refund: { label: 'Refund', className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' },
      platform_fee: { label: 'Fee', className: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50' },
      payment: { label: 'Payment', className: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700' },
    }
    const item = config[type] || { label: type, className: 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500' }
    return <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-tighter", item.className)}>{item.label}</span>
  }

  const openDetails = (tx: any) => {
    setSelectedTx(tx)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search & Custom Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Cari deskripsi atau ID..." 
            className="pl-9 h-10 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-blue-400 text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 w-full sm:w-[180px] justify-start text-left font-bold text-xs rounded-2xl border-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all px-3 shrink-0",
                  !date && "text-slate-500 dark:text-slate-400",
                  date && "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                {date ? format(date, "PPP", { locale: id }) : "Pilih Tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setCurrentPage(1)
                }}
                initialFocus
                className="bg-white dark:bg-slate-900"
              />
              {date && (
                <div className="p-2 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDate(undefined)}
                    className="text-[9px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Reset Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto shrink-0">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
               className={cn(
                 "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                 typeFilter === 'all' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
               )}
            >
              Semua
            </button>
            <button
              onClick={() => { setTypeFilter('deposit'); setCurrentPage(1); }}
               className={cn(
                 "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                 typeFilter === 'deposit' ? "bg-white dark:bg-slate-700 text-green-600 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
               )}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTypeFilter('withdrawal'); setCurrentPage(1); }}
               className={cn(
                 "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                 typeFilter === 'withdrawal' ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
               )}
            >
              Keluar
            </button>
          </div>

           <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />

           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => { setSortOrder('desc'); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                  sortOrder === 'desc' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
            >
              Terbaru
            </button>
            <button
              onClick={() => { setSortOrder('asc'); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                  sortOrder === 'asc' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
            >
              Terlama
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="grid gap-2">
        {currentTransactions.length > 0 ? (
          currentTransactions.map((tx) => (
             <Card key={tx.id} className="overflow-hidden border-none shadow-xs hover:shadow-sm transition-all group bg-white dark:bg-slate-900">
               <div className="p-3 flex flex-col sm:flex-row sm:items-center bg-card dark:bg-slate-900 gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl group-hover:scale-105 transition-transform shrink-0",
                    Number(tx.amount) >= 0 ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                  )}>
                    {Number(tx.amount) >= 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                        {tx.type === 'refund' && tx.description?.includes('penarikan dana ditolak') 
                          ? `Refund Penarikan Ditolak (No Ref : ${tx.reference_id?.slice(0, 8) || '-'})` 
                          : (tx.description || getTransactionLabel(tx.type))}
                      </p>
                      <TransactionTypeBadge type={tx.type} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                      <span>{new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {tx.reference_id && (
                        <>
                           <span className="opacity-30">•</span>
                           <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1 py-0.2 rounded uppercase border dark:border-slate-700">Ref: {tx.reference_id.slice(0, 8)}</span>
                         </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                  <p className={cn(
                    "text-xl font-black leading-tight",
                    Number(tx.amount) >= 0 ? "text-green-600" : "text-red-500"
                  )}>
                    {Number(tx.amount) >= 0 ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {tx.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Berhasil
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-yellow-600 uppercase">
                        <Clock className="h-2.5 w-2.5" /> Diproses
                      </span>
                    ) : tx.status === 'rejected' ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-red-600 uppercase">
                        <XCircle className="h-2.5 w-2.5" /> Ditolak
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-black text-destructive uppercase">
                        <XCircle className="h-2.5 w-2.5" /> Gagal
                      </span>
                    )}
                  </div>
                  </div>

                   <div className="pl-4 border-l border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <Button 
                     variant="ghost" 
                     size="sm" 
                     className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => openDetails(tx)}
                   >
                     <Info className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            </div>
          </Card>
          ))
        ) : (
           <Card className="border-dashed py-20 flex flex-col items-center justify-center bg-muted/20 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-3xl text-center">
            <Filter className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground dark:text-slate-500 font-black text-lg">Tidak ada transaksi ditemukan</p>
            {(searchTerm || date || typeFilter !== 'all') && (
              <Button variant="link" className="mt-2 text-blue-600 dark:text-blue-400" onClick={() => { setSearchTerm(''); setDate(undefined); setTypeFilter('all'); }}>
                Reset Filter
              </Button>
            )}
           </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <p className="text-xs text-muted-foreground font-medium">
            Halaman <span className="font-bold text-foreground">{currentPage}</span> dari <span className="font-bold text-foreground">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="h-10 w-10 p-0 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => prev + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="h-10 w-10 p-0 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl max-w-md bg-white dark:bg-slate-900">
          <DialogHeader className="pb-4 border-b dark:border-slate-800">
            <DialogTitle className="text-xl font-black flex items-center gap-3 dark:text-white">
              <div className={cn(
                "p-2 rounded-xl",
                Number(selectedTx?.amount) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {Number(selectedTx?.amount) >= 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
              </div>
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>

           {selectedTx && (
            <div className="space-y-6 pt-4">
              <div className="text-center space-y-1 py-4 bg-slate-50 dark:bg-slate-950 rounded-3xl">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nominal Transaksi</p>
                <p className={cn(
                  "text-3xl font-black",
                  Number(selectedTx.amount) >= 0 ? "text-green-600" : "text-red-500"
                )}>
                  {Number(selectedTx.amount) >= 0 ? '+' : '-'} {formatCurrency(Math.abs(selectedTx.amount))}
                </p>
                <div className="flex justify-center mt-2">
                   <TransactionTypeBadge type={selectedTx.type} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status</p>
                  <div className="mt-1">
                    {selectedTx.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400 uppercase bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Berhasil
                      </span>
                    ) : selectedTx.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full">
                        <Clock className="h-3 w-3" /> Diproses
                      </span>
                    ) : selectedTx.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 dark:text-red-400 uppercase bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-destructive uppercase bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Gagal
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Tanggal</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{new Date(selectedTx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>

                 <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Keterangan</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedTx.type === 'refund' && selectedTx.description?.includes('penarikan dana ditolak') 
                      ? `Refund Penarikan Ditolak (${selectedTx.reference_id?.slice(0, 8) || '-'})` 
                      : (selectedTx.description || getTransactionLabel(selectedTx.type))}
                  </p>
                </div>

                 {selectedTx.withdrawal_details && (
                  <>
                    <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Detail Penarikan</p>
                      <div className="mt-2 space-y-2 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-2xl">
                         <div className="flex justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Bank</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedTx.withdrawal_details.bank_name}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">No. Rekening</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedTx.withdrawal_details.account_number}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Atas Nama</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedTx.withdrawal_details.account_holder}</span>
                         </div>
                      </div>
                    </div>
                    
                    {selectedTx.withdrawal_details.admin_note && (
                      <div className="col-span-2">
                         <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div>
                               <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase mb-1">Alasan Penolakan</p>
                               <p className="text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">{selectedTx.withdrawal_details.admin_note}</p>
                            </div>
                         </div>
                      </div>
                    )}
                  </>
                )}

                 {selectedTx.reference_id && (
                  <div className="col-span-2 pt-4">
                    <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                       <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase px-1">Ref ID</span>
                       <span className="font-mono text-[10px] text-slate-900 dark:text-white font-bold">{selectedTx.reference_id}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
