
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut, 
  PlusCircle,
  CreditCard,
  FileText,
  Wallet,
  TrendingUp,
  ShieldOff
} from 'lucide-react'
import { getShop } from '@/app/actions/shop'
import { signOutSeller } from '@/app/actions/auth'
import { ModeToggle } from '@/components/mode-toggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/seller/login')
  }

  const shop = await getShop()
  
  const showSidebar = !!shop;
  const isDeactivated = shop?.is_active === false;

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar - Only show if shop exists */}
      {showSidebar && (
        <aside className="hidden w-64 flex-col border-r bg-card px-4 py-6 md:flex">
          <div className="mb-8 flex items-center gap-2 px-2 font-heading font-bold text-xl tracking-tight">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>{shop.name}</span>
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />}>
              Ringkasan
            </NavItem>
            <NavItem href="/dashboard/products" icon={<Package className="h-5 w-5" />}>
              Produk
            </NavItem>
            <NavItem href="/dashboard/orders" icon={<FileText className="h-5 w-5" />}>
              Pesanan
            </NavItem>
            <NavItem href="/dashboard/income" icon={<TrendingUp className="h-5 w-5" />}>
              Pemasukan
            </NavItem>
             <NavItem href="/dashboard/wallet" icon={<Wallet className="h-5 w-5" />}>
              Dompet
            </NavItem>
            <NavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>
              Pengaturan Toko
            </NavItem>
          </nav>

          <form action={signOutSeller as any} className="mt-auto">
             <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
                <LogOut className="h-5 w-5" />
                Keluar
             </button>
          </form>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
        {/* Desktop Header for Theme Toggle */}
        <header className="hidden md:flex h-16 items-center justify-end px-8 border-b bg-card shrink-0">
          <ModeToggle />
        </header>

        {/* Mobile Header (Simplified) */}
        {!showSidebar && (
           <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:hidden">
              <Link href="/" className="font-bold">YukJajan.</Link>
              <ModeToggle />
           </header>
        )}

        {/* Deactivation Banner */}
        {isDeactivated && (
          <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-100 animate-in slide-in-from-top duration-500 shadow-xl">
             <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl">
                   <ShieldOff className="h-6 w-6" />
                </div>
                <div>
                   <h4 className="font-bold text-lg leading-none">Akun Toko Dinonaktifkan</h4>
                   <p className="text-red-100 text-sm mt-1">Toko Anda ditutup sementara oleh sistem. Beberapa fitur pengelolaan dibatasi.</p>
                </div>
             </div>
             <a 
              href="https://wa.me/628123456789" 
              target="_blank" 
              className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors whitespace-nowrap shadow-lg shadow-black/10"
             >
                Hubungi CS
             </a>
          </div>
        )}
        
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 relative">
            {children}
        </div>

        {/* Mobile Bottom Navigation */}
        {showSidebar && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg flex justify-around items-center p-2 pb-6 z-50">
            <MobileNavItem href="/dashboard" icon={<LayoutDashboard className="h-6 w-6" />} label="Ringkasan" />
            <MobileNavItem href="/dashboard/products" icon={<Package className="h-6 w-6" />} label="Produk" />
            <MobileNavItem href="/dashboard/orders" icon={<FileText className="h-6 w-6" />} label="Pesanan" />
            <MobileNavItem href="/dashboard/income" icon={<TrendingUp className="h-6 w-6" />} label="Masuk" />
            <MobileNavItem href="/dashboard/settings" icon={<Settings className="h-6 w-6" />} label="Profil" />
            <div className="flex flex-col items-center justify-center px-3">
              <ModeToggle />
              <span className="text-[10px] font-bold text-muted-foreground">Mode</span>
            </div>
          </nav>
        )}
      </main>
    </div>
  )
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  )
}

function NavItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
    >
      {icon}
      {children}
    </Link>
  )
}
