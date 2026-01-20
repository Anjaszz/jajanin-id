import { getIncomeData } from "@/app/actions/finance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ArrowDownLeft, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function IncomePage() {
  const data = await getIncomeData()

  if (!data) return <div className="p-8 text-center text-muted-foreground italic">Toko belum tersedia.</div>

  const { transactions, totalIncome } = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading font-bold tracking-tight bg-linear-to-r from-green-600 to-green-400 bg-clip-text text-transparent flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-green-500" />
          Riwayat Pemasukan
        </h1>
        <p className="text-muted-foreground mt-1">Pantau semua dana yang masuk ke toko Anda.</p>
      </div>

      <Card className="bg-green-600 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[160px] border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-100 text-sm font-medium uppercase tracking-widest">Total Pemasukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-black mb-1">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-green-100/60 italic">*Akumulasi dari semua transaksi pendapatan</p>
        </CardContent>
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <TrendingUp className="h-32 w-32" />
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-xl flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Detail Pemasukan
        </h3>
        
        <div className="grid gap-4">
          {transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <Card key={tx.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                <div className="p-4 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-green-100 text-green-700 group-hover:scale-110 transition-transform">
                      <ArrowDownLeft className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{tx.description || 'Pendapatan Penjualan'}</p>
                        {tx.payment_method && (
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                            tx.payment_method === 'gateway' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                          )}>
                            {tx.payment_method === 'gateway' ? 'Digital' : 'Tunai'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        {tx.reference_id && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">{tx.reference_id.slice(0, 8)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">
                      + {formatCurrency(tx.amount)}
                    </p>
                    {tx.platform_fee > 0 && (
                      <div className="text-[10px] text-muted-foreground flex flex-col items-end">
                        <span>Harga: {formatCurrency(tx.gross_amount)}</span>
                        <span className="text-red-400">Biaya Platform: -{formatCurrency(tx.platform_fee)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Berhasil
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-muted/20">
              <Clock className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium">Belum ada riwayat pemasukan</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
