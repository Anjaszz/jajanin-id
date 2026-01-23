
import { isAdmin } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Banknote, 
  Users, 
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Tag,
  ShoppingBag,
  Package
} from 'lucide-react'

import { signOutSeller } from '@/app/actions/auth'
import { ModeToggle } from '@/components/mode-toggle'
import { AdminNavItem } from '@/components/admin/nav-item'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-slate-900 text-white px-4 py-8 md:flex">
        <div className="mb-10 flex items-center gap-2 px-2 font-heading font-bold text-2xl tracking-tight">
          <ShieldCheck className="h-8 w-8 text-blue-400" />
          <span>Admin Panel</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <AdminNavItem href="/admin" icon={<LayoutDashboard className="h-5 w-5" />}>
            Statistik Utama
          </AdminNavItem>
          <AdminNavItem href="/admin/withdrawals" icon={<Banknote className="h-5 w-5" />}>
            Penarikan Dana
          </AdminNavItem>
          <AdminNavItem href="/admin/balance" icon={<Activity className="h-5 w-5" />}>
            Arus Kas
          </AdminNavItem>
          <AdminNavItem href="/admin/users" icon={<Users className="h-5 w-5" />}>
            Kelola Pengguna
          </AdminNavItem>
          <AdminNavItem href="/admin/categories" icon={<Tag className="h-5 w-5" />}>
            Master Kategori
          </AdminNavItem>
          <AdminNavItem href="/admin/orders" icon={<ShoppingBag className="h-5 w-5" />}>
            Master Pesanan
          </AdminNavItem>
          <AdminNavItem href="/admin/products" icon={<Package className="h-5 w-5" />}>
            Master Produk
          </AdminNavItem>
          <AdminNavItem href="/admin/settings" icon={<Settings className="h-5 w-5" />}>
            Pengaturan
          </AdminNavItem>
        </nav>

        <form action={signOutSeller as any}>
           <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <LogOut className="h-5 w-5" />
              Keluar Admin
           </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Dashboard</span>
           </div>
           
           <div className="flex items-center gap-4">
              <ModeToggle />
           </div>
        </header>

        <div className="flex-1 p-8">
            {children}
        </div>
      </main>
    </div>
  )
}
