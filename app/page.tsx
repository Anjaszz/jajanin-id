import Link from 'next/link'
import { ShoppingBag, Search, MapPin, ArrowRight, Store, User, Package, LogOut } from 'lucide-react'
import { getAllShops } from '@/app/actions/public-shop'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/actions/auth'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const shops = await getAllShops()

  return (
    <div className="flex min-h-screen flex-col bg-muted/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>SaaSMarket.</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-sm mx-8 relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input type="search" placeholder="Cari toko atau produk..." className="w-full bg-muted pl-9 rounded-full h-9" />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
               <>
                 <Link href="/buyer/orders" className="hidden md:flex text-sm font-medium hover:text-primary transition-colors items-center gap-2">
                   <Package className="h-4 w-4" /> Pesanan
                 </Link>
                 <Link href="/buyer/profile" className="hidden md:flex text-sm font-medium hover:text-primary transition-colors items-center gap-2">
                   <User className="h-4 w-4" /> Profil
                 </Link>
                 <form action={signout}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                       <LogOut className="h-4 w-4 mr-2" />
                       Keluar
                    </Button>
                 </form>
               </>
            ) : (
               <>
                <Link href="/buyer/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Masuk
                </Link>
                <Link href="/buyer/register" className="h-9 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 hidden sm:inline-flex">
                  Daftar Pembeli
                </Link>
               </>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Welcome */}
      <main className="flex-1 container px-4 sm:px-6 py-8">
        <div className="mb-10 text-center space-y-2">
            <h1 className="text-3xl font-heading font-bold tracking-tight sm:text-4xl md:text-5xl">
              Jelajahi Toko Pilihan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Temukan berbagai produk unik dari penjual terpercaya di platform kami.
            </p>
        </div>

        {/* Shop Grid */}
        {shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/${shop.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1">
                  <div className="aspect-[16/9] w-full relative bg-muted overflow-hidden">
                    {shop.cover_url ? (
                      <img src={shop.cover_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                        <ShoppingBag className="h-10 w-10 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/60 to-transparent" />
                  </div>
                  <CardContent className="p-5 relative pt-10 mt-[-2rem]">
                     {/* Logo Avatar */}
                     <div className="absolute -top-6 left-5 h-12 w-12 rounded-xl border-4 border-card bg-white shadow-sm overflow-hidden flex items-center justify-center">
                        {shop.logo_url ? (
                           <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                           <Store className="h-6 w-6 text-muted-foreground" />
                        )}
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors">{shop.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                          {shop.description || "Toko ini menyediakan berbagai macam produk berkualitas."}
                        </p>
                     </div>

                     {shop.address && (
                        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                           <MapPin className="h-3 w-3 shrink-0" />
                           <span className="truncate">{shop.address}</span>
                        </div>
                     )}
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                     <Button variant="secondary" className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Kunjungi Toko <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed">
            <Store className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">Belum ada toko yang terdaftar</h3>
            <p className="text-muted-foreground">Jadilah yang pertama membuka toko di sini!</p>
            <Button asChild className="mt-6">
               <Link href="/seller/register">Buka Toko Sekarang</Link>
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t bg-card mt-auto pb-16 md:pb-0">
        <div className="container py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 SaaSMarket. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <Link href="/seller/login" className="hover:text-foreground font-medium flex items-center gap-2">
               <Store className="h-4 w-4" /> Login Seller
             </Link>
             <Link href="/seller/register" className="hover:text-foreground font-medium">
               Daftar Jadi Penjual
             </Link>
          </div>
        </div>
      </footer>

      {user && (
        <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex justify-around p-4 z-50">
           <Link href="/" className="flex flex-col items-center text-xs text-primary font-bold">
              <ShoppingBag className="h-5 w-5 mb-1" />
              Belanja
           </Link>
           <Link href="/buyer/orders" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
              <Package className="h-5 w-5 mb-1" />
              Pesanan
           </Link>
           <Link href="/buyer/profile" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
              <User className="h-5 w-5 mb-1" />
              Profil
           </Link>
        </nav>
      )}
    </div>
  )
}
