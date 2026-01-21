"use client"

import { useState } from 'react'
import { 
  User, 
  Calendar,
  Building,
  CreditCard,
  History,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WithdrawalActions } from '@/components/admin/withdrawal-actions'
import { CopyButton } from '@/components/ui/copy-button'
import { formatCurrency } from '@/lib/utils'

interface WithdrawalsTableProps {
  initialWithdrawals: any[]
}

export function WithdrawalsTable({ initialWithdrawals }: WithdrawalsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(initialWithdrawals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentWithdrawals = initialWithdrawals.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': 
        return (
          <Badge className="bg-green-50 text-green-700 border-none hover:bg-green-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md">
            Berhasil
          </Badge>
        )
      case 'rejected': 
        return (
          <Badge className="bg-red-50 text-red-700 border-none hover:bg-red-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md">
            Ditolak
          </Badge>
        )
      default: 
        return (
          <Badge className="bg-blue-50 text-blue-700 border-none hover:bg-blue-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md">
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Waktu</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Toko & Penerima</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Bank</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Nominal</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentWithdrawals.length > 0 ? (
                currentWithdrawals.map((wd) => (
                  <tr key={wd.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          <span>{new Date(wd.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium ml-4.5">
                          {new Date(wd.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm group">
                          <Building className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                          <span className="line-clamp-1">{wd.wallet?.shop?.name || 'Toko'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 ml-5">
                          <User className="h-3 w-3" />
                          <span>{wd.account_holder}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tight text-slate-500">
                          <CreditCard className="h-3 w-3" />
                          <span>{wd.bank_name}</span>
                        </div>
                        <div className="flex items-center ml-4.5">
                          <p className="font-mono text-[11px] text-blue-700 font-bold">
                            {wd.account_number}
                          </p>
                          <CopyButton value={wd.account_number} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-black text-slate-900">
                        {formatCurrency(Number(wd.amount))}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                       {getStatusBadge(wd.status)}
                    </td>
                    <td className="px-5 py-4 text-center">
                       {wd.status === 'pending' ? (
                         <WithdrawalActions 
                            withdrawalId={wd.id} 
                            amount={Number(wd.amount)} 
                            shopName={wd.wallet?.shop?.name || 'Toko'} 
                         />
                       ) : (
                         <div className="flex items-center justify-center opacity-30">
                            {wd.status === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                         </div>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <History className="h-10 w-10 text-slate-200" />
                        <div className="space-y-1">
                           <p className="text-base font-black text-slate-900">Belum Ada Pengajuan</p>
                           <p className="text-xs text-slate-400">Permintaan penarikan akan muncul di sini.</p>
                        </div>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-900">{startIndex + 1}</span> - <span className="font-bold text-slate-900">{Math.min(startIndex + itemsPerPage, initialWithdrawals.length)}</span> dari <span className="font-bold text-slate-900">{initialWithdrawals.length}</span> data
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
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-8 w-8 p-0 rounded-lg ${currentPage === i + 1 ? "bg-blue-600 hover:bg-blue-700" : "border-slate-200"}`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
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
