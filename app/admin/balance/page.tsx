import { getAdminGlobalBalance, getAdminGlobalTransactions } from '@/app/actions/admin'
import { GlobalTransactionsTable } from '@/components/admin/global-transactions-table'
import { formatCurrency } from '@/lib/utils'
import { 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Calendar
} from 'lucide-react'

export default async function AdminBalancePage() {
  const totalBalance = await getAdminGlobalBalance()
  const transactions = await getAdminGlobalTransactions()

  // Calculate some simple stats from transactions
  const totalIn = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0)
    
  const totalOut = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  // Calculate Today stats
  const today = new Date().toLocaleDateString('id-ID')
  
  const todayIn = transactions
    .filter(tx => tx.amount > 0 && new Date(tx.created_at).toLocaleDateString('id-ID') === today)
    .reduce((sum, tx) => sum + tx.amount, 0)
    
  const todayOut = transactions
    .filter(tx => tx.amount < 0 && new Date(tx.created_at).toLocaleDateString('id-ID') === today)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 border-none">
                 Arus <span className="text-blue-600">Kas</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium">Pantau total saldo dan seluruh riwayat transaksi platform.</p>
           </div>
        </div>
      </div>

      {/* Today Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Calendar className="h-4 w-4 text-blue-600" />
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Statistik Hari Ini</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Pemasukan Hari Ini</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black">{formatCurrency(todayIn)}</p>
              <TrendingUp className="h-5 w-5 text-blue-200" />
            </div>
            <p className="text-[10px] font-medium text-blue-100 italic">* Khusus transaksi masuk per tanggal {today}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pengeluaran Hari Ini</p>
            <div className="flex items-baseline gap-2 text-red-600">
              <p className="text-3xl font-black">{formatCurrency(todayOut)}</p>
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-medium text-slate-400 italic">* Khusus penarikan & refund per tanggal {today}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Saldo Aktif</p>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{formatCurrency(totalBalance)}</p>
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Dana mengendap di seluruh dompet seller</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pemasukan</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-green-600">{formatCurrency(totalIn)}</p>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total uang masuk ke sistem</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pengeluaran</p>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-red-600">{formatCurrency(totalOut)}</p>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </div>
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total penarikan & refund dana</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <h2 className="text-lg font-black text-slate-900">Riwayat Transaksi Global</h2>
           <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">SEMUA TOKO</span>
        </div>
        <GlobalTransactionsTable initialTransactions={transactions} />
      </div>
    </div>
  )
}
