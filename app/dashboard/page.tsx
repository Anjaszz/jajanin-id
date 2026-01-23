
import { getDashboardStats } from '@/app/actions/dashboard-stats'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Wallet, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard
} from "lucide-react"
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ShareShop from '@/components/share-shop'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  if (!stats) {
    redirect('/dashboard/create-shop')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Menunggu Bayar'
      case 'pending_confirmation': return 'Perlu Konfirmasi'
      case 'paid': return 'Sudah Dibayar'
      case 'accepted': return 'Diterima'
      case 'processing': return 'Sedang Proses'
      case 'ready': return 'Siap Diambil'
      case 'completed': return 'Selesai'
      case 'rejected': return 'Ditolak'
      case 'cancelled_by_seller':
      case 'cancelled_by_buyer': return 'Dibatalkan'
      default: return status.replace('_', ' ')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Ringkasan Bisnis
        </h1>
        <p className="text-muted-foreground">Monitor performa toko Anda hari ini.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/income" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="relative overflow-hidden group border-none shadow-lg bg-linear-to-br from-primary/10 to-transparent h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 text-primary">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-70">Penjualan Hari Ini</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-50" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-black ">{formatCurrency((stats as any).todaySales)}</div>
              
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <p className="text-[10px] font-bold text-slate-500">Tunai: <span className="text-slate-700">{formatCurrency((stats as any).todayCashSales)}</span></p>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <p className="text-[10px] font-bold text-blue-500">Digital: <span className="text-blue-700">{formatCurrency((stats as any).todayDigitalSales)}</span></p>
                </div>
              </div>
            </CardContent>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <TrendingUp className="h-24 w-24" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/orders" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="relative overflow-hidden group border-none shadow-lg bg-linear-to-br from-blue-500/10 to-transparent h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pesanan Berhasil Hari Ini</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any).todayOrdersCount} Pesanan</div>
              <p className="text-xs text-muted-foreground mt-1">Total pesanan selesai hari ini</p>
            </CardContent>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShoppingCart className="h-24 w-24 text-blue-600" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/products" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="relative overflow-hidden group border-none shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Produk Aktif</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Varian produk di katalog</p>
            </CardContent>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Package className="h-24 w-24" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/wallet" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="relative overflow-hidden group border-none shadow-lg bg-linear-to-br from-green-500/10 to-transparent h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Saldo Dompet</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">Dana tersedia untuk ditarik</p>
            </CardContent>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Wallet className="h-24 w-24 text-green-600" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
         {/* Recent Orders List */}
        <Card className="lg:col-span-4 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <div>
               <CardTitle>Pesanan Terbaru</CardTitle>
               <p className="text-xs text-muted-foreground">Aktifitas pesanan terakhir Anda.</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
               <Link href="/dashboard/orders" className="flex items-center gap-1">
                 Lihat Semua <ArrowUpRight className="h-3 w-3" />
               </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
               {stats.recentOrders.length > 0 ? (
                 stats.recentOrders.map((order: any) => (
                   <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                           {getStatusIcon(order.status)}
                        </div>
                        <div>
                           <p className="font-medium text-sm">{(order.guest_info as any)?.name || 'Pelanggan'}</p>
                           <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(order.total_amount)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{getStatusLabel(order.status)}</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="p-8 text-center text-muted-foreground">
                    Belum ada aktifitas pesanan.
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Integration Status */}
        <Card className="lg:col-span-3 shadow-md">
            <CardHeader>
              <CardTitle>Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
               <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/dashboard/products/create">
                    <Package className="mr-2 h-4 w-4" />
                    Tambah Produk Baru
                  </Link>
               </Button>
               <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/dashboard/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Kelola Pesanan
                  </Link>
               </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/dashboard/wallet">
                    <Wallet className="mr-2 h-4 w-4" />
                    Dompet & Penarikan
                  </Link>
               </Button>
               <Button variant="outline" className="w-full justify-start h-12 border-green-200 hover:bg-green-50 hover:text-green-700" asChild>
                  <Link href="/dashboard/income">
                    <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                    Riwayat Pemasukan
                  </Link>
               </Button>
               
               <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Midtrans Snap Aktif
                  </h4>
                  <p className="text-xs text-muted-foreground">Toko Anda sudah dapat menerima pembayaran QRIS dan Transfer Bank.</p>
               </div>
            </CardContent>
        </Card>

        <div className="lg:col-span-7">
           <ShareShop shopName={stats.shopName} shopSlug={stats.shopSlug} />
        </div>
      </div>
    </div>
  )
}
