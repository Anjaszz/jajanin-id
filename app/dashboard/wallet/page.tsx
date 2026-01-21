import { getWalletData, requestWithdrawal } from "@/app/actions/wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from "lucide-react"
import { SyncWalletButton } from "@/components/sync-wallet-button"
import { WithdrawalForm } from "@/components/withdrawal-form"

export default async function WalletPage() {
  const data = await getWalletData()

  if (!data || !data.shop) return <div className="p-8 text-center text-muted-foreground italic">Toko belum tersedia. Mohon buat toko terlebih dahulu di dashboard.</div>

  if (!data.wallet) return (
    <div className="p-12 text-center space-y-4">
      <Wallet className="h-12 w-12 text-muted-foreground opacity-20 mx-auto" />
      <h3 className="text-xl font-bold">Dompet Sedang Disiapkan</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">Kami sedang menyiapkan sistem keuangan untuk toko Anda. Silakan coba muat ulang halaman dalam beberapa saat.</p>
      <Button onClick={() => window.location.reload()}>Muat Ulang Halaman</Button>
    </div>
  )

  const { wallet, transactions, shop } = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dompet Toko</h1>
          <p className="text-muted-foreground mt-1">Kelola pendapatan dan penarikan dana Anda.</p>
        </div>
        <SyncWalletButton />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Balace Card */}
        <Card className="md:col-span-1 bg-primary text-primary-foreground shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[200px]">
           <CardHeader>
              <CardTitle className="text-primary-foreground/80 text-sm font-medium uppercase tracking-widest">Saldo Tersedia</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-4xl font-black mb-1">{formatCurrency((wallet as any).balance)}</div>
              <p className="text-xs text-primary-foreground/60 italic">*Dapat ditarik kapan saja ke rekening terdaftar</p>
           </CardContent>
           <div className="absolute -right-6 -bottom-6 opacity-10">
              <Wallet className="h-32 w-32" />
           </div>
        </Card>

        {/* Withdrawal Form */}
        <Card className="md:col-span-2 shadow-lg border-none bg-linear-to-br from-muted/50 to-background">
           <CardHeader>
              <CardTitle>Tarik Dana</CardTitle>
              <CardDescription>Saldo akan dikirimkan ke rekening yang terdaftar di pengaturan.</CardDescription>
           </CardHeader>
            <CardContent>
               <WithdrawalForm 
                  balance={(wallet as any).balance}
                  bankName={(shop as any).bank_name || ''}
                  bankAccount={(shop as any).bank_account || ''}
                  isActive={shop.is_active !== false}
               />
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
         <h3 className="font-bold text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Riwayat Penarikan
         </h3>
         
         <div className="grid gap-4">
            {transactions.length > 0 ? (
               transactions.map((tx: any) => (
                  <Card key={tx.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                     <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                              "p-3 rounded-2xl",
                              tx.type === 'deposit' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                           )}>
                              {tx.type === 'deposit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                           </div>
                           <div>
                              <p className="font-bold">{tx.description || (tx.type === 'deposit' ? 'Penjualan Keuntungan' : 'Penarikan Dana')}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                 <span>{new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                 <span>•</span>
                                 <span className="font-mono">{tx.reference_id}</span>
                              </div>
                           </div>
                        </div>

                        <div className="text-right">
                           <p className={cn(
                              "text-lg font-black",
                              tx.type === 'deposit' ? "text-green-600" : "text-blue-600"
                           )}>
                              {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount)}
                           </p>
                           <div className="flex items-center justify-end gap-1 mt-1">
                              {tx.status === 'completed' ? (
                                 <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                                    <CheckCircle2 className="h-3 w-3" /> Berhasil
                                 </span>
                              ) : tx.status === 'pending' ? (
                                 <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 uppercase">
                                    <Clock className="h-3 w-3" /> Diproses
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase">
                                    <XCircle className="h-3 w-3" /> Gagal
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                  </Card>
               ))
            ) : (
               <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-muted/20">
                  <Clock className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground font-medium">Belum ada riwayat transaksi</p>
               </Card>
            )}
         </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
