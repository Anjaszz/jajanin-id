import Link from 'next/link'
import { ShoppingBag, Search, MapPin, ArrowRight, Store, User, Package, LogOut, Instagram, Facebook, Twitter, ShieldCheck, Zap, Heart } from 'lucide-react'
import { getAllShops } from '@/app/actions/public-shop'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { signOutBuyer } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { isShopOpen } from '@/lib/shop-status'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const shops = (await getAllShops()).filter(shop => isShopOpen(shop).isOpen)
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-7 w-7 fill-primary/10" />
            <span>YukJajan<span className="text-foreground">.</span></span>
          </Link>
          
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                 <Button asChild variant="ghost" className="rounded-xl font-bold text-sm hidden sm:flex">
                    <Link href="/buyer/orders">Pesanan Saya</Link>
                 </Button>
                 <div className="h-4 w-px bg-border hidden sm:block" />
                 <form action={signOutBuyer}>
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive transition-colors">
                       <LogOut className="h-5 w-5" />
                    </Button>
                 </form>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="rounded-xl font-bold text-sm hover:scale-95 transition-all">
                  <Link href="/buyer/login">Masuk</Link>
                </Button>
                <Button asChild className="rounded-xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Link href="/shops">Mulai Jajan</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
           {/* Background Highlights */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-10 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary/40 rounded-full blur-[100px]" />
           </div>

           <div className="container px-4 text-center space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full text-primary text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
                 <Zap className="h-3 w-3 fill-primary" />
                 Lagi Pengen Jajan Apa Hari Ini?
              </div>
              <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] md:leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Jajan <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent italic pr-4">Makin Asik</span><br /> Cuma Di YukJajan.
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium animate-in fade-in zoom-in-95 duration-700 delay-200">
                Temukan ribuan jajanan favorit dari pedagang UMKM terbaik di sekitarmu. 
                Pesan langsung, bayar mudah, dan nikmati kelezatannya!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                 <div className="w-full sm:w-[400px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                       placeholder="Cari nasi goreng, seblak, atau nama toko..." 
                       className="h-16 pl-12 pr-4 rounded-2xl border-2 shadow-2xl focus-visible:ring-primary/20 transition-all font-bold text-lg"
                    />
                 </div>
                 <Button className="h-16 px-10 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105" asChild>
                    <Link href="/shops">Cari Sekarang</Link>
                 </Button>
              </div>
           </div>
        </section>

        {/* Categories/Stats */}
        <section className="container px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
               {[
                 { label: 'Total Toko', val: '500+', icon: Store },
                 { label: 'Kategori', val: '24+', icon: Package },
                 { label: 'Puas Banget', val: '10k+', icon: User },
                 { label: 'Top Rated', val: '4.9/5', icon: Heart },
               ].map((s, i) => (
                 <div key={i} className="bg-card border p-6 rounded-3xl flex flex-col items-center text-center gap-2 hover:border-primary/50 transition-colors group">
                    <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all">
                       <s.icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-2xl font-black">{s.val}</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{s.label}</p>
                 </div>
               ))}
            </div>
        </section>

        {/* Shop Grid */}
        <section id="toko" className="container px-4 py-20 animate-in fade-in duration-1000">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                 <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight">Toko Terpopuler</h2>
                 <p className="text-muted-foreground mt-2">Daftar toko paling banyak dikunjungi pembeli minggu ini.</p>
              </div>
              <Button variant="outline" className="rounded-xl font-bold h-12" asChild>
                 <Link href="/shops">Lihat Semua <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
           </div>

           {shops.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {shops.map((shop) => (
                 <Link key={shop.id} href={`/${shop.slug}`} className="group block">
                   <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card group-hover:-translate-y-2 relative">
                     <div className="aspect-4/3 w-full relative bg-muted overflow-hidden">
                       {shop.cover_url ? (
                         <img 
                            src={shop.cover_url} 
                            alt={shop.name} 
                            className={cn(
                                "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700",
                                !isShopOpen(shop).isOpen && "grayscale opacity-80"
                            )} 
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                           <ShoppingBag className="h-12 w-12 text-primary/10" />
                         </div>
                       )}

                       {/* Status Badge */}
                       <div className="absolute top-4 right-4 z-10">
                          {(() => {
                             const status = isShopOpen(shop);
                             return (
                                <div className={cn(
                                   "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border",
                                   status.isOpen 
                                      ? "bg-green-500/90 text-white border-green-400" 
                                      : "bg-destructive/90 text-white border-destructive/40"
                                )}>
                                   {status.isOpen ? "Buka" : "Tutup"}
                                </div>
                             );
                          })()}
                       </div>

                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                         <div className="scale-90 group-hover:scale-100 transition-transform duration-500">
                           <Button size="sm" className="rounded-full font-black text-xs uppercase h-10 px-6 shadow-2xl">
                             Lihat Menu
                           </Button>
                         </div>
                       </div>
                     </div>
                     <CardContent className="p-6 relative">
                        {/* Logo Avatar Floating */}
                        <div className="absolute -top-10 left-6 h-14 w-14 rounded-2xl border-[3px] border-card bg-white shadow-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                           {shop.logo_url ? (
                              <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                           ) : (
                              <Store className="h-7 w-7 text-primary/20" />
                           )}
                        </div>
                        
                        <div className="mt-6 space-y-2">
                           <h3 className="font-heading font-black text-xl tracking-tight leading-none group-hover:text-primary transition-colors">{shop.name}</h3>
                           <p className="text-sm text-muted-foreground line-clamp-2 min-h-10 leading-relaxed">
                              {shop.description || "Temukan jajanan favoritmu hanya di toko ini dengan kualitas premium."}
                           </p>
                        </div>

                        {shop.address && (
                           <div className="mt-4 pt-4 border-t flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">{shop.address}</span>
                           </div>
                        )}
                     </CardContent>
                   </Card>
                 </Link>
               ))}
             </div>
           ) : (
             <div className="text-center py-20 bg-muted/30 rounded-[40px] border-2 border-dashed border-primary/10">
               <Store className="h-16 w-16 mx-auto text-primary/20 mb-6" />
               <h3 className="text-2xl font-black">Belum Ada Toko</h3>
               <p className="text-muted-foreground max-w-sm mx-auto mt-2">Daftar toko favoritmu akan muncul di sini segera setelah para pedagang bergabung!</p>
             </div>
           )}
        </section>

        {/* Business CTA */}
        <section className="container px-4 py-20">
           <div className="bg-slate-900 rounded-[48px] p-12 md:p-24 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] z-0 transition-transform group-hover:scale-110" />
              <div className="relative z-10 space-y-8 max-w-2xl">
                 <h2 className="text-4xl md:text-7xl font-heading font-black tracking-tight text-white leading-none">Punya Jualan?<br /><span className="text-blue-500 italic">Yuk Gabung!</span></h2>
                 <p className="text-slate-400 text-lg md:text-xl font-medium">
                    Buka toko online gratis hanya dalam 5 menit. Kelola pesanan, stok, dan pembayaran dalam satu genggaman. Jualan makin simpel, untung makin nempel!
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button className="h-16 px-10 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30" asChild>
                       <Link href="/business">Daftar Jadi Seller</Link>
                    </Button>
                  
                 </div>
              </div>
              
              <div className="hidden lg:block absolute bottom-0 right-24 translate-y-12 -rotate-12 w-[400px] h-[300px] bg-slate-800 rounded-3xl border-8 border-slate-700 shadow-2xl overflow-hidden opacity-50 group-hover:opacity-100 transition-all group-hover:translate-y-0 group-hover:rotate-0">
                 <div className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-4 w-4 bg-red-500 rounded-full" />
                       <div className="h-4 w-4 bg-yellow-500 rounded-full" />
                       <div className="h-4 w-4 bg-green-500 rounded-full" />
                    </div>
                    <div className="h-4 w-3/4 bg-slate-700 rounded-lg" />
                    <div className="h-20 w-full bg-slate-700 rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-12 w-full bg-slate-700 rounded-xl" />
                       <div className="h-12 w-full bg-slate-700 rounded-xl" />
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 pt-20 pb-12">
        <div className="container px-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="md:col-span-2 space-y-8">
                <Link href="/" className="flex items-center gap-2 font-heading font-black text-3xl tracking-tighter text-primary">
                  <ShoppingBag className="h-8 w-8 fill-primary/10" />
                  <span>YukJajan<span>.</span></span>
                </Link>
                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed font-medium">
                  YukJajan adalah platform marketplace jajanan UMKM terlengkap di Indonesia. 
                  Kami membantu mempermudah akses kuliner nusantara untuk semua orang.
                </p>
                <div className="flex gap-4">
                   {[Instagram, Facebook, Twitter].map((Icon, i) => (
                      <a key={i} href="#" className="p-3 bg-muted rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                         <Icon className="h-5 w-5" />
                      </a>
                   ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-6">Tautan Penting</h4>
                 <ul className="space-y-4 text-sm font-bold">
                    <li><Link href="/shops" className="hover:text-primary transition-colors">Semua Toko</Link></li>
                    <li><Link href="/business" className="hover:text-primary transition-colors">Jadi Seller</Link></li>
                    <li><Link href="/buyer/login" className="hover:text-primary transition-colors">Masuk Pembeli</Link></li>
                 </ul>
              </div>
              
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-6">Informasi</h4>
                 <ul className="space-y-4 text-sm font-bold">
                    <li><Link href="#" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-colors">Pusat Bantuan</Link></li>
                 </ul>
              </div>
           </div>
           
           <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <p>© {currentYear} YukJajan Indonesia. Digitalizing Indonesian Flavors.</p>
              <div className="flex gap-8">
                 <Link href="#" className="hover:text-primary transition-colors">Terma & Layanan</Link>
                 <Link href="#" className="hover:text-primary transition-colors">Privasi</Link>
              </div>
           </div>
        </div>
      </footer>
    </div>
  )
}
