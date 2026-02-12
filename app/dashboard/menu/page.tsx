import { getDashboardStats } from '@/app/actions/dashboard-stats'
import Link from 'next/link'
import { 
  Package, 
  TrendingUp, 
  Wallet, 
  Settings,
  Store,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Headset,
  Trophy,
  Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { signOutSeller } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function MobileMenuPage() {
  const stats = await getDashboardStats()
  
  if (!stats) {
    redirect('/dashboard/create-shop')
  }

  const waMessage = encodeURIComponent(`Halo Admin YukJajan, saya pemilik toko *${stats.shopName}* ingin bertanya mengenai layanan pelapak...`)

  const menuItems = [
    {
      title: 'Dompet Pelapak',
      desc: 'Tarik saldo & riwayat penarikan',
      href: '/dashboard/wallet',
      icon: <Wallet className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Kasir (POS)',
      desc: 'Input pesanan secara manual',
      href: '/dashboard/pos',
      icon: <Store className="h-6 w-6" />,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Manajemen Produk',
      desc: 'Tambah, edit, & hapus menu jualan',
      href: '/dashboard/products',
      icon: <Package className="h-6 w-6" />,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Laporan Pemasukan',
      desc: 'Pantau omzet & statistik harian',
      href: '/dashboard/income',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Produk Terlaris',
      desc: 'Daftar produk dengan penjualan terbanyak',
      href: '/dashboard/best-selling',
      icon: <Trophy className="h-6 w-6" />,
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Ulasan Pelanggan',
      desc: 'Penilaian & masukan dari pembeli',
      href: '/dashboard/ratings',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Pengaturan Toko',
      desc: 'Profil toko, jam buka & alamat',
      href: '/dashboard/settings',
      icon: <Settings className="h-6 w-6" />,
      color: 'bg-slate-50 text-slate-600'
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Menu Utama</h1>
          <p className="text-sm text-muted-foreground font-medium">Layanan pelapak dalam satu genggaman.</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl">
           <ShoppingBag className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="grid gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href} className="active:scale-[0.98] transition-transform">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="pt-8 space-y-4">
         <div className="px-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Akun & Sistem</h4>
         </div>
         
         <div className="grid gap-3">
            <a 
                href={`https://wa.me/628123456789?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-2xl font-black text-sm active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <Headset className="h-5 w-5 text-green-600" />
                    </div>
                    Pusat Bantuan (WA)
                </div>
                <ChevronRight className="h-5 w-5 opacity-30" />
            </a>

            <form action={signOutSeller as any}>
                <button 
                type="submit" 
                className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm active:scale-[0.98] transition-all"
                >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-xl">
                    <LogOut className="h-5 w-5" />
                    </div>
                    Keluar Akun
                </div>
                <ChevronRight className="h-5 w-5 opacity-30" />
                </button>
            </form>
         </div>
      </div>

      <div className="pt-12 pb-8 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">YukJajan Pelapak v1.0.0</p>
      </div>
    </div>
  )
}
