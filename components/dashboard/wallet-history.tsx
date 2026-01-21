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

interface WalletHistoryProps {
  initialTransactions: any[]
}

export function WalletHistory({ initialTransactions }: WalletHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
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
      result = result.filter(tx => tx.type === typeFilter)
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

  return (
    <div className="space-y-4">
      {/* Search & Custom Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Cari deskripsi atau ID..." 
            className="pl-9 h-10 rounded-2xl text-xs bg-slate-50 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-blue-400"
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
                  "h-10 w-full sm:w-[180px] justify-start text-left font-bold text-xs rounded-2xl border-none bg-slate-100 hover:bg-slate-200 transition-all px-3 shrink-0",
                  !date && "text-slate-500",
                  date && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                {date ? format(date, "PPP", { locale: id }) : "Pilih Tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setCurrentPage(1)
                }}
                initialFocus
                className="bg-white"
              />
              {date && (
                <div className="p-2 border-t bg-slate-50 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDate(undefined)}
                    className="text-[9px] font-black uppercase text-red-500 hover:bg-red-50"
                  >
                    Reset Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto shrink-0">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                typeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Semua
            </button>
            <button
              onClick={() => { setTypeFilter('deposit'); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                typeFilter === 'deposit' ? "bg-white text-green-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTypeFilter('withdrawal'); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                typeFilter === 'withdrawal' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Keluar
            </button>
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => { setSortOrder('desc'); setCurrentPage(1); }}
              className={cn(
                "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                sortOrder === 'desc' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Terbaru
            </button>
            <button
              onClick={() => { setSortOrder('asc'); setCurrentPage(1); }}
              className={cn(
                "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                sortOrder === 'asc' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
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
            <Card key={tx.id} className="overflow-hidden border-none shadow-xs hover:shadow-sm transition-all group">
              <div className="p-3 flex flex-col md:flex-row md:items-center justify-between bg-card gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl group-hover:scale-105 transition-transform shrink-0",
                    tx.type === 'deposit' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{tx.description || (tx.type === 'deposit' ? 'Penjualan' : 'Penarikan')}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 font-medium">
                      <span>{new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {tx.reference_id && (
                        <>
                          <span className="opacity-30">•</span>
                          <span className="font-mono text-[9px] bg-muted px-1 py-0.5 rounded uppercase">{tx.reference_id.slice(0, 8)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className={cn(
                    "text-xl font-black leading-tight",
                    tx.type === 'deposit' ? "text-green-600" : "text-blue-600"
                  )}>
                    {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                  </p>
                  <div className="flex items-center md:justify-end gap-1 mt-0.5">
                    {tx.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Berhasil
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-yellow-600 uppercase">
                        <Clock className="h-2.5 w-2.5" /> Diproses
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-black text-destructive uppercase">
                        <XCircle className="h-2.5 w-2.5" /> Gagal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-dashed py-20 flex flex-col items-center justify-center bg-muted/20 rounded-3xl">
            <Filter className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-black text-lg">Tidak ada transaksi ditemukan</p>
            {(searchTerm || date || typeFilter !== 'all') && (
              <Button variant="link" className="mt-2 text-blue-600" onClick={() => { setSearchTerm(''); setDate(undefined); setTypeFilter('all'); }}>
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
    </div>
  )
}
