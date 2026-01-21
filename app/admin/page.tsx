
import { getPendingWithdrawals, processWithdrawal, getAdminStats } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Banknote, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Building,
  Info,
  Store,
  Package,
  Wallet,
  ArrowRight,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'

// Local components for the admin view
const WithdrawalCard = ({ withdrawal }: { withdrawal: any }) => {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
      <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Menunggu Persetujuan</span>
        </div>
        <span className="text-xs text-muted-foreground">{new Date(withdrawal.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
      </div>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Pemilik Rekening</Label>
                <div className="flex items-center gap-2 font-bold text-lg">
                  <User className="h-4 w-4 text-blue-500" />
                  {withdrawal.account_holder}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Nama Bank</Label>
                    <p className="font-medium">{withdrawal.bank_name}</p>
                 </div>
                 <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Nomor Rekening</Label>
                    <p className="font-mono bg-muted inline-block px-1.5 rounded">{withdrawal.account_number}</p>
                 </div>
              </div>
              <div>
                 <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Toko</Label>
                 <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{withdrawal.wallet?.shop?.name || 'Unknown Shop'}</span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-blue-100">
              <Label className="text-[10px] uppercase font-bold text-blue-600 mb-2 block">Total Penarikan</Label>
              <div className="text-4xl font-bold tracking-tighter text-blue-700">
                Rp {Number(withdrawal.amount).toLocaleString('id-ID')}
              </div>
              
              <div className="flex gap-2 mt-8 w-full">
                 <form action={(async (formData: FormData) => {
                   'use server'
                   await processWithdrawal(withdrawal.id, 'rejected', formData.get('reason') as string)
                 }) as any} className="flex-1 flex gap-2">
                    <Input name="reason" placeholder="Alasan tolak..." className="text-xs bg-white h-9" />
                    <Button variant="outline" size="sm" className="bg-white border-red-200 text-red-600 hover:bg-red-50 h-9" title="Tolak">
                      <XCircle className="h-4 w-4" />
                    </Button>
                 </form>
                 <form action={(async () => {
                   'use server'
                   await processWithdrawal(withdrawal.id, 'approved')
                 }) as any}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9">
                      <CheckCircle className="mr-2 h-4 w-4" /> Setujui
                    </Button>
                 </form>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Label = ({ children, className }: any) => <span className={`text-sm font-medium leading-none ${className}`}>{children}</span>
const Input = ({ ...props }: any) => <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />

export default async function AdminDashboard() {
  const pendingRequests = await getPendingWithdrawals()
  const stats = await getAdminStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 capitalize">
           Statistik <span className="text-blue-600">Platform</span>
        </h1>
        <p className="text-muted-foreground text-lg">Gambaran menyeluruh performa YukJajan hari ini.</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users" className="block outline-none group">
            <Card className="border-none shadow-md bg-white transition-all hover:shadow-xl hover:-translate-y-1 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total User</CardTitle>
                <User className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userCount} Orang</div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pembeli: <span className="text-slate-900">{stats.userCount - stats.shopCount}</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Toko: <span className="text-blue-600">{stats.shopCount}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="border-none shadow-md bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pesanan</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orderCount} Transaksi</div>
              <div className="h-[15px] mt-1" /> {/* Spacer to match Total User height */}
            </CardContent>
          </Card>

          <Link href="/admin/balance" className="block outline-none group text-left">
            <Card className="border-none shadow-md bg-white transition-all hover:shadow-xl hover:-translate-y-1 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo Sistem</CardTitle>
                <Wallet className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBalance)}</div>
                <div className="h-[15px] mt-1" /> {/* Spacer to match Total User height */}
              </CardContent>
            </Card>
          </Link>

          <Card className="border-none shadow-md bg-white border-l-4 border-l-orange-500 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productCount} Item</div>
              <div className="h-[15px] mt-1" /> {/* Spacer to match Total User height */}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            Permintaan Penarikan Dana
          </h2>
          {pendingRequests.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold">
              {pendingRequests.length} PERLU PROSES
            </span>
          )}
        </div>

        <div className="grid gap-6">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <WithdrawalCard key={req.id} withdrawal={req} />
            ))
          ) : (
            <div className="bg-white border border-dashed rounded-3xl p-16 text-center shadow-sm">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Banknote className="h-8 w-8 text-slate-300" />
               </div>
               <h3 className="text-2xl font-bold mb-2 text-slate-400">Semua Beres!</h3>
               <p className="text-muted-foreground max-w-sm mx-auto">Tidak ada permintaan penarikan dana yang perlu diproses saat ini.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/admin/users">
          <Card className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Kelola Pengguna</h3>
                  <p className="text-sm text-muted-foreground">Atur hak akses dan profil user.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Pengaturan Global</h3>
                  <p className="text-sm text-muted-foreground">Biaya platform, PPN, dan lainnya.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function Settings({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
