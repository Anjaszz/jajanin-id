import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Instagram, Facebook, Twitter } from 'lucide-react'
import { getAllShops } from '@/app/actions/public-shop'
import ShopsList from './shops-list'

export default async function ShopsPage() {
  const shops = await getAllShops()
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-7 w-7 fill-primary/10" />
            <span>YukJajan<span className="text-foreground">.</span></span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4">
          <ShopsList initialShops={shops} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 pt-16 pb-12 border-t border-primary/5 mt-auto">
        <div className="container px-4 text-center space-y-6">
           <Link href="/" className="inline-flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
             <ShoppingBag className="h-7 w-7 fill-primary/10" />
             <span>YukJajan<span className="text-foreground">.</span></span>
           </Link>
           <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
             Platform marketplace UMKM jajanan lokal terbaik di Indonesia.
           </p>
           <div className="flex gap-4 justify-center">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="h-10 w-10 rounded-xl bg-card border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm">
                   <Icon className="h-5 w-5" />
                </Link>
              ))}
           </div>
           <div className="pt-8 text-xs font-bold text-muted-foreground tracking-widest uppercase">
              © {currentYear} YukJajan Indonesia.
           </div>
        </div>
      </footer>
    </div>
  )
}
