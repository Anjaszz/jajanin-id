import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ShieldOff,
  Headset
} from 'lucide-react'
import { getShop } from '@/app/actions/shop'
import { ModeToggle } from '@/components/mode-toggle'
import { Sidebar, MobileNav } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { OrderNotifier } from '@/components/dashboard/order-notifier'

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as any)?.role === "buyer") {
    redirect("/");
  }

  const shop = await getShop()
  
  const showSidebar = !!shop;
  const isDeactivated = shop?.is_active === false;

  const waMessage = encodeURIComponent(`Halo Admin YukJajan, saya pemilik toko *${shop?.name || 'Baru'}* ingin bertanya mengenai layanan pelapak...`)

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Sidebar - Client Component for Active Links */}
      {showSidebar && <Sidebar shopName={shop?.name || ''} />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
        {/* Desktop Header for Theme Toggle */}
        <header className="hidden md:flex h-14 items-center justify-end px-8 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 sticky top-0 z-40 gap-4">
          <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-green-600 font-bold gap-2">
            <a href={`https://wa.me/628123456789?text=${waMessage}`} target="_blank" rel="noopener noreferrer">
              <Headset className="h-4 w-4" />
              Bantuan CS
            </a>
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <ModeToggle />
        </header>

        {/* Mobile Header (Simplified) */}
        {!showSidebar && (
           <header className="flex h-14 items-center justify-between border-b bg-white dark:bg-slate-900 px-6 md:hidden">
              <Link href="/" className="font-black text-xl tracking-tighter text-green-600">YukJajan.</Link>
              <ModeToggle />
           </header>
        )}

        {/* Deactivation Banner */}
        {isDeactivated && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between sticky top-0 md:top-14 z-50 animate-in slide-in-from-top duration-500 shadow-lg">
             <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg">
                   <ShieldOff className="h-5 w-5" />
                </div>
                <div>
                   <h4 className="font-bold text-sm leading-none">Akun Dinonaktifkan</h4>
                   <p className="text-red-100 text-[10px] mt-1">Toko Anda ditutup sementara oleh sistem.</p>
                </div>
             </div>
             <a 
              href="https://wa.me/628123456789" 
              target="_blank" 
              className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-black text-[10px] hover:bg-red-50 transition-colors uppercase"
             >
                Hubungi CS
             </a>
          </div>
        )}
        
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 relative">
            {shop && <OrderNotifier shopId={shop.id} />}
            {children}
        </div>

        {/* Mobile Bottom Navigation - Client Component */}
        {showSidebar && <MobileNav />}
      </main>
    </div>
  )
}
