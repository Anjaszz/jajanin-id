"use client"

import { useState } from 'react'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  Calendar,
  Wallet
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GlobalTransactionsTableProps {
  initialTransactions: any[]
}

export function GlobalTransactionsTable({ initialTransactions }: GlobalTransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 15

  const filteredTransactions = initialTransactions.filter(tx => 
    tx.wallet?.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <ArrowUpCircle className="h-4 w-4 text-green-500" />
    return <ArrowDownCircle className="h-4 w-4 text-red-500" />
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'income':
        return <Badge className="bg-green-100 text-green-700 border-none px-2 py-0.5 text-[8px] uppercase font-black tracking-widest">Digital</Badge>
      case 'withdrawal':
        return <Badge className="bg-blue-50 text-blue-700 border-none px-2 py-0.5 text-[8px] uppercase font-black tracking-widest">Tarik Dana</Badge>
      case 'platform_fee':
        return <Badge className="bg-red-50 text-red-600 border-none px-2 py-0.5 text-[8px] uppercase font-black tracking-widest">Fee</Badge>
      case 'refund':
        return <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[8px] uppercase font-black tracking-widest">Refund</Badge>
      case 'sales_revenue':
        return <Badge className="bg-amber-50 text-amber-700 border-none px-2 py-0.5 text-[8px] uppercase font-black tracking-widest">Tunai</Badge>
      default:
        return <Badge className="bg-slate-50 text-slate-500 border-none px-2 py-0.5 text-[8px] uppercase font-black tracking-widest">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <span className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-1.5 py-0.5 rounded">Berhasil</span>
      case 'pending':
        return <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
      case 'rejected':
        return <span className="text-[9px] font-black text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">Ditolak</span>
      case 'failed':
        return <span className="text-[9px] font-black text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">Gagal</span>
      default:
        return <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded">{status}</span>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Cari toko atau deskripsi transaksi..." 
          className="pl-10 rounded-xl border-slate-200 h-10 text-sm focus-visible:ring-blue-600"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Waktu</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Toko</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Tipe & Deskripsi</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          <span>{new Date(tx.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium ml-4.5">
                          {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-slate-400" />
                        {tx.wallet?.shop?.name || 'Sistem / Umum'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           {getTypeBadge(tx.type)}
                           {getStatusBadge(tx.status)}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{tx.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={tx.amount > 0 ? 'text-green-600 font-black' : 'text-red-600 font-black'}>
                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                        {getTransactionIcon(tx.type, tx.amount)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet className="h-10 w-10 text-slate-200" />
                      <p className="text-base font-black text-slate-900">Tidak ada riwayat transaksi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-bold text-slate-900">{currentPage}</span> dari <span className="font-bold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="h-8 w-8 p-0 rounded-lg border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="h-8 w-8 p-0 rounded-lg border-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
