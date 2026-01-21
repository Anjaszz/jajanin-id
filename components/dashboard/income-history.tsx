"use client"

import * as React from 'react'
import { useState, useMemo } from 'react'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDownLeft, 
  Calendar,
  Filter,
  ArrowUpDown,
  History
} from 'lucide-react'
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
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

interface IncomeHistoryProps {
  initialTransactions: any[]
}

export function IncomeHistory({ initialTransactions }: IncomeHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'gateway' | 'cash'>('all')
  const [date, setDate] = useState<Date | undefined>(undefined)

  const dateFilter = date ? format(date, "yyyy-MM-dd") : ""

  // Filtering & Sorting Logic
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...initialTransactions]

    // Search
    if (searchTerm) {
      result = result.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date Filter
    if (dateFilter) {
      result = result.filter(tx => {
        const txDate = new Date(tx.created_at).toISOString().split('T')[0]
        return txDate === dateFilter
      })
    }

    // Payment Method Filter
    if (paymentFilter !== 'all') {
      result = result.filter(tx => tx.payment_method === paymentFilter)
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [initialTransactions, searchTerm, dateFilter, paymentFilter, sortOrder])

  return (
    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-green-600" />
              Detail Transaksi
            </CardTitle>
            <CardDescription className="text-xs font-medium">Riwayat lengkap pemasukan toko</CardDescription>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <Button 
                variant={sortOrder === 'desc' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setSortOrder('desc')}
                className={cn(
                    "h-8 px-3 rounded-lg text-[9px] font-black uppercase transition-all",
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
                    "h-8 px-3 rounded-lg text-[9px] font-black uppercase transition-all",
                    sortOrder === 'asc' ? "bg-white text-primary shadow-xs hover:bg-white" : "text-slate-500"
                )}
            >
                Terlama
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Compact Filters bar */}
        <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              placeholder="Cari transaksi..." 
              className="w-full pl-9 h-10 rounded-xl text-xs bg-white border-none shadow-xs outline-hidden focus:ring-2 focus:ring-green-400/20 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 w-full sm:w-[150px] justify-start text-left font-bold text-[10px] rounded-xl border-none bg-white shadow-xs px-3",
                  !date && "text-slate-500",
                  date && "text-green-700 bg-green-50"
                )}
              >
                <Calendar className="mr-2 h-3.5 w-3.5 text-green-600" />
                {date ? format(date, "d MMM yyyy", { locale: id }) : "Semua Tgl"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="end">
              <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus locale={id} className="bg-white" />
              {date && (
                <div className="p-2 border-t bg-slate-50 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setDate(undefined)} className="text-[9px] font-black uppercase text-red-500">Reset</Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className="flex bg-white shadow-xs p-1 rounded-xl w-full sm:w-auto">
            {['all', 'gateway', 'cash'].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentFilter(m as any)}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
                  paymentFilter === m ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {m === 'all' ? 'Semua' : m === 'gateway' ? 'Digital' : 'Tunai'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-50 p-2 space-y-2">
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map((tx) => (
              <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors rounded-2xl group border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-50 text-green-600 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-[13px] text-slate-900">{tx.description || 'Pendapatan'}</p>
                      <span className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase",
                        tx.payment_method === 'gateway' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-orange-50 text-orange-600 border border-orange-100"
                      )}>
                        {tx.payment_method === 'gateway' ? 'Digital' : 'Tunai'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-bold">
                      <span>{new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="opacity-30">•</span>
                      <span className="font-mono text-[9px]">#{(tx.reference_id || tx.id).slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-green-600">+{formatCurrency(tx.amount)}</p>
                  {tx.platform_fee > 0 && (
                    <p className="text-[9px] font-bold text-slate-400">-{formatCurrency(tx.platform_fee)} fee</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaksi tidak ditemukan</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
