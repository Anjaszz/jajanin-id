import { getAllWithdrawals } from '@/app/actions/admin'
import { History } from 'lucide-react'
import { WithdrawalsTable } from '@/components/admin/withdrawals-table'

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getAllWithdrawals()

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <History className="h-5 w-5 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 border-none">
                 Kelola <span className="text-blue-600">Penarikan</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium">Lacak dan proses permintaan pencairan dana penjual.</p>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-center min-w-[120px]">
              <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Total</p>
              <p className="text-lg font-black text-slate-900">{withdrawals.length}</p>
           </div>
           <div className="bg-blue-600 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <p className="text-[9px] uppercase font-black tracking-widest text-white/70">Pending</p>
              <p className="text-lg font-black text-white">{withdrawals.filter(w => w.status === 'pending').length}</p>
           </div>
        </div>
      </div>

      {/* Main Content Table */}
      <WithdrawalsTable initialWithdrawals={withdrawals} />
    </div>
  )
}
