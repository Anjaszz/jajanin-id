import { getWalletData } from "@/app/actions/wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Clock, Activity, TrendingUp } from "lucide-react"
import { SyncWalletButton } from "@/components/sync-wallet-button"
import { WithdrawalForm } from "@/components/withdrawal-form"
import { WalletHistory } from "@/components/dashboard/wallet-history"
import { formatCurrency } from "@/lib/utils"

export default async function WalletPage() {
  const data = await getWalletData()

  if (!data || !data.shop) return <div className="p-8 text-center text-muted-foreground italic">Toko belum tersedia. Mohon buat toko terlebih dahulu di dashboard.</div>

  if (!data.wallet) return (
    <div className="p-12 text-center space-y-4">
      <Wallet className="h-12 w-12 text-muted-foreground opacity-20 mx-auto" />
      <h3 className="text-xl font-bold">Dompet Sedang Disiapkan</h3>
      <p className="text-muted-foreground max-w-xs mx-auto text-sm">Kami sedang menyiapkan sistem keuangan untuk toko Anda.</p>
    </div>
  )

  const { wallet, transactions, shop } = data

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                 Dompet <span className="text-blue-600">Toko</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium">Kelola saldo dan penarikan dana ke rekening Anda.</p>
           </div>
        </div>
        <SyncWalletButton />
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Balance Card */}
        <Card className="md:col-span-5 bg-blue-600 text-white shadow-lg shadow-blue-200 relative overflow-hidden flex flex-col justify-center min-h-[160px] border-none rounded-3xl">
           <CardContent className="pt-6 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">Saldo Tersedia</p>
              <div className="text-4xl font-black">{formatCurrency((wallet as any).balance)}</div>
              <p className="text-[10px] text-blue-100/60 mt-2 font-medium italic">* Saldo bersih dari hasil penjualan Anda</p>
           </CardContent>
           <div className="absolute -right-4 -bottom-4 opacity-10">
              <Wallet className="h-28 w-28" />
           </div>
           <div className="absolute top-4 right-4 h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
           </div>
        </Card>

        {/* Withdrawal Form Card */}
        <Card className="md:col-span-7 shadow-xs border-none bg-white rounded-3xl overflow-hidden">
           <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Tarik Saldo</CardTitle>
           </CardHeader>
           <CardContent className="pb-5">
              <WithdrawalForm 
                balance={(wallet as any).balance}
                bankName={(shop as any).bank_name || ''}
                bankAccount={(shop as any).bank_account || ''}
                bankHolderName={(shop as any).bank_holder_name || ''}
                isActive={shop.is_active !== false}
              />
           </CardContent>
        </Card>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4 pt-2">
         <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
               <Clock className="h-5 w-5 text-blue-600" />
               Riwayat Transaksi
            </h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">HISTORY</span>
         </div>
         
         <WalletHistory initialTransactions={transactions} />
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
