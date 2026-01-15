
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
  Wallet
} from 'lucide-react'
import { getShop } from '@/app/actions/shop'
import { headers } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const shop = await getShop()
  
  // Get current path to check if we are in create-shop page
  // Headers solution is a bit flaky for pathname in SC, but for redirect logic:
  // We can just rely on the fact that if shop is null, we render a limited layout 
  // OR we strictly redirect if they are not in the create-shop page (done via middleware or client check usually, but let's try centralized logic here)
  
  // Actually, let's keep it simple:
  // If no shop, we render a layout that basically just contains the children (which will be the create-shop form presumably)
  // But wait, the children is determined by the URL. If URL is /dashboard, children is DashboardPage.
  // So inside DashboardPage, we should also check shop status? 
  // A cleaner way is: If no shop, render a "Onboarding Layout" or just the children with a specific "Create Shop" prompt.
  
  // Let's check headers for simplistic "current url" check or just let the page handle redirection?
  // Use a variable to determine if we show sidebar.
  
  const showSidebar = !!shop;

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
             <NavItem href="/dashboard/wallet" icon={<Wallet className="h-5 w-5" />}>
              Dompet
            </NavItem>
            <NavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>
              Pengaturan Toko
            </NavItem>
          </nav>

          <form action="/auth/signout" method="post" className="mt-auto">
             <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
                <LogOut className="h-5 w-5" />
                Keluar
             </button>
          </form>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Mobile Header (Simplified) */}
        {!showSidebar && (
           <header className="flex h-16 items-center border-b bg-background px-6 md:hidden">
              <Link href="/" className="font-bold">SaaSMarket.</Link>
           </header>
        )}
        
        {/* If user logged in but no shop, and not on create-shop, we might want to guide them. 
            But for now, let's just render children. Use page.tsx to enforce logic. */}
        <div className="flex-1 p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  // Logic to highlight active link would need 'use client' and usePathname. 
  // Keeping it simple server component for now, or make this a client component.
  // For MVP, standard styling.
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
