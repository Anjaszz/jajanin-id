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
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  Grid2X2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutSeller } from '@/app/actions/auth'
import { useSidebarStore } from '@/lib/store/use-sidebar-store'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface SidebarProps {
  shopName: string
}

export function Sidebar({ shopName }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebarStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <aside className="hidden w-64 flex-col border-r bg-card px-4 py-6 md:flex transition-all duration-300" />
  )

  return (
    <aside className={cn(
      "hidden flex-col border-r bg-card py-6 md:flex transition-all duration-300 relative group",
      isCollapsed ? "w-20 px-3" : "w-64 px-4"
    )}>
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm z-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={cn(
        "mb-8 flex items-center gap-3 px-2 font-heading font-bold tracking-tight transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "px-2"
      )}>
        <div className="bg-primary/10 p-2 rounded-xl">
          <ShoppingBag className="h-6 w-6 text-primary shrink-0" />
        </div>
        {!isCollapsed && <span className="truncate text-xl">{shopName}</span>}
      </div>
      
      <nav className="flex-1 space-y-2">
        <SidebarNavItem 
          href="/dashboard" 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          active={pathname === '/dashboard'}
          isCollapsed={isCollapsed}
          label="Ringkasan"
        />
        <SidebarNavItem 
          href="/dashboard/products" 
          icon={<Package className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/products')}
          isCollapsed={isCollapsed}
          label="Produk"
        />
        <SidebarNavItem 
          href="/dashboard/orders" 
          icon={<FileText className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/orders')}
          isCollapsed={isCollapsed}
          label="Pesanan"
        />
        <SidebarNavItem 
          href="/dashboard/best-selling" 
          icon={<Trophy className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/best-selling')}
          isCollapsed={isCollapsed}
          label="Terlaris"
        />
        <SidebarNavItem 
          href="/dashboard/pos" 
          icon={<Store className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/pos')}
          isCollapsed={isCollapsed}
          label="Kasir (POS)"
        />
        <SidebarNavItem 
          href="/dashboard/ratings" 
          icon={<Star className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/ratings')}
          isCollapsed={isCollapsed}
          label="Ulasan"
        />
        <SidebarNavItem 
          href="/dashboard/income" 
          icon={<TrendingUp className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/income')}
          isCollapsed={isCollapsed}
          label="Pemasukan"
        />
        <SidebarNavItem 
          href="/dashboard/wallet" 
          icon={<Wallet className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/wallet')}
          isCollapsed={isCollapsed}
          label="Dompet"
        />
        <SidebarNavItem 
          href="/dashboard/settings" 
          icon={<Settings className="h-5 w-5" />} 
          active={pathname.startsWith('/dashboard/settings')}
          isCollapsed={isCollapsed}
          label="Pengaturan"
        />
      </nav>

      <form action={signOutSeller as any} className="mt-auto">
        <button type="submit" className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition-all hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
          isCollapsed ? "justify-center px-0" : "w-full"
        )}>
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
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

function SidebarNavItem({ 
  href, 
  icon, 
  label, 
  active, 
  isCollapsed 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : ""}
      className={cn(
        "flex items-center gap-3 rounded-xl py-2.5 text-sm font-bold transition-all duration-300",
        active 
          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 shadow-xs shadow-green-100/50 dark:shadow-none" 
          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200",
        isCollapsed ? "justify-center px-0 mx-auto w-12" : "px-3"
      )}
    >
      <div className={cn(
        "transition-colors shrink-0",
        active ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
      )}>
        {icon}
      </div>
      {!isCollapsed && <span className="truncate">{label}</span>}
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
