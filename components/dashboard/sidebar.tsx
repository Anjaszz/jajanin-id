"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  TrendingUp, 
  Wallet, 
  Settings,
  ShoppingBag,
  LogOut,
  Store,
  Grid2X2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutSeller } from '@/app/actions/auth'

interface SidebarProps {
  shopName: string
}

export function Sidebar({ shopName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-card px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2 font-heading font-bold text-xl tracking-tight">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <span className="truncate">{shopName}</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        <SidebarNavItem href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} active={pathname === '/dashboard'}>
          Ringkasan
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/products" icon={<Package className="h-5 w-5" />} active={pathname.startsWith('/dashboard/products')}>
          Produk
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/orders" icon={<FileText className="h-5 w-5" />} active={pathname.startsWith('/dashboard/orders')}>
          Pesanan
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/pos" icon={<Store className="h-5 w-5" />} active={pathname.startsWith('/dashboard/pos')}>
          Kasir (POS)
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/income" icon={<TrendingUp className="h-5 w-5" />} active={pathname.startsWith('/dashboard/income')}>
          Pemasukan
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/wallet" icon={<Wallet className="h-5 w-5" />} active={pathname.startsWith('/dashboard/wallet')}>
          Dompet
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />} active={pathname.startsWith('/dashboard/settings')}>
          Pengaturan Toko
        </SidebarNavItem>
      </nav>

      <form action={signOutSeller as any} className="mt-auto">
        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50">
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </form>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg flex justify-around items-center p-2 pb-6 z-50">
      <MobileNavItem href="/dashboard" icon={<LayoutDashboard className="h-6 w-6" />} label="Beranda" active={pathname === '/dashboard'} />
      <MobileNavItem href="/dashboard/orders" icon={<FileText className="h-6 w-6" />} label="Pesanan" active={pathname.startsWith('/dashboard/orders')} />
      <MobileNavItem href="/dashboard/menu" icon={<Grid2X2 className="h-6 w-6" />} label="Menu" active={pathname === '/dashboard/menu'} />
    </nav>
  )
}

function SidebarNavItem({ href, icon, children, active }: { href: string; icon: React.ReactNode; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
        active 
          ? "bg-green-50 text-green-600 shadow-xs shadow-green-100/50" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <div className={cn(
        "transition-colors",
        active ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
      )}>
        {icon}
      </div>
      {children}
    </Link>
  )
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-1 transition-all",
        active ? "text-green-600 scale-110" : "text-slate-400"
      )}
    >
      <div className={cn(
        "h-6 w-6 transition-transform",
        active ? "opacity-100" : "opacity-70"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-black tracking-tighter uppercase",
        active ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
      )}>
        {label}
      </span>
    </Link>
  )
}
