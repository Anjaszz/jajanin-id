import Link from "next/link";
import { Store, BarChart3, ShieldCheck, ArrowRight, Wallet, Globe, Smartphone, Check, Zap, ShoppingBag, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BusinessPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      {/* Navbar - Consistent with Home */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-7 w-7 fill-primary/10" />
            <span>YukJajan<span className="text-foreground">.</span> Business</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="#fitur" className="transition-colors hover:text-primary text-muted-foreground">Fitur</Link>
            <Link href="#harga" className="transition-colors hover:text-primary text-muted-foreground">Harga</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="rounded-xl font-bold text-sm px-4">
               <Link href="/seller/login">Masuk Seller</Link>
            </Button>
            <Button asChild className="rounded-xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6">
              <Link href="/seller/register">Buka Toko Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 md:pt-32 md:pb-40 overflow-hidden">
           {/* Background Decor */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20 pointer-events-none">
              <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] animate-pulse" />
              <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-primary/40 rounded-full blur-[120px]" />
           </div>

           <div className="container px-4 text-center space-y-10">
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full text-primary text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
                 <Zap className="h-3 w-3 fill-primary" />
                 Platform UMKM No. 1 di Indonesia
              </div>
              
              <div className="space-y-6 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] md:leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  Digitalkan <br className="hidden md:block" />
                  <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent italic pr-4">Toko mu</span> Disini.
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium animate-in fade-in zoom-in-95 duration-700 delay-200">
                  Kelola pesanan, stok, dan pembayaran dalam satu genggaman. YukJajan membantu UMKM naik kelas dengan sistem POS yang cerdas dan modern.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                 <Button className="h-16 px-10 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105" asChild>
                   <Link href="/seller/register">Mulai Jualan Sekarang</Link>
                 </Button>
                 <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <div className="p-3 bg-muted rounded-full group-hover:scale-110 transition-transform">
                       <ArrowRight className="h-5 w-5" />
                    </div>
                    Tanya CS Kami
                 </button>
              </div>

              {/* Trust Badge */}
              <div className="pt-12 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-500">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Dipercaya Oleh 500+ Pedagang Jajanan</p>
                 <div className="flex flex-wrap justify-center gap-8 grayscale opacity-40">
                    <Users className="h-10 w-10" />
                    <Store className="h-10 w-10" />
                    <Heart className="h-10 w-10" />
                    <ShoppingBag className="h-10 w-10" />
                 </div>
              </div>
           </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="container px-4 py-24">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
               <div className="max-w-xl space-y-4">
                  <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter leading-none">Fitur Canggih, <br className="hidden md:block" /><span className="text-primary italic">Kelola Gampang.</span></h2>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                    Kami mendesain fitur yang benar-benar dibutuhkan oleh pedagang jajanan, tanpa ribet dan tanpa biaya admin yang mencekik.
                  </p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  {
                     icon: Globe,
                     title: "Link Toko Digital",
                     desc: "Pelanggan bisa langsung pesan melalui link toko unikmu. Tanpa aplikasi, cukup buka dari browser."
                  },
                  {
                     icon: Wallet,
                     title: "Kasir & POS Digital",
                     desc: "Catat pesanan masuk secara real-time. Hitung total belanja otomatis tanpa perlu kalkulator manual."
                  },
                  {
                     icon: Smartphone,
                     title: "Kelola dari HP",
                     desc: "Terima notifikasi pesanan masuk langsung ke HP-mu. Bisa jualan sambil tetap santai di rumah."
                  },
                  {
                     icon: BarChart3,
                     title: "Laporan Penjualan",
                     desc: "Pantau omzet harian dan produk mana yang paling laris untuk strategi jualan esok hari."
                  },
                  {
                     icon: ShieldCheck,
                     title: "Transaksi Aman",
                     desc: "Semua data transaksi tersimpan aman di cloud. Gak perlu takut catatan kertas hilang atau basah."
                  },
                  {
                     icon: Store,
                     title: "Inventaris Akurat",
                     desc: "Stok akan terpotong otomatis setiap ada pesanan. Alarm otomatis jika stok produk mulai habis."
                  }
               ].map((feature, i) => (
                  <Card key={i} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card rounded-[32px] overflow-hidden p-4">
                     <CardHeader className="p-6">
                        <div className="h-16 w-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm border border-primary/10">
                           <feature.icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-black font-heading tracking-tight mb-2 leading-none">{feature.title}</CardTitle>
                        <CardDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
                           {feature.desc}
                        </CardDescription>
                     </CardHeader>
                  </Card>
               ))}
            </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="bg-muted/30 py-24 md:py-32">
           <div className="container px-4">
              <div className="text-center mb-20 space-y-4">
                 <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight leading-none">Pilih Paket <br className="hidden md:block" /><span className="text-primary italic">Sesuai Kebutuhan.</span></h2>
                 <p className="text-muted-foreground max-w-xl mx-auto font-medium text-lg leading-relaxed">Mulai jualan online secara gratis, upgrade kapan saja saat bisnismu mulai meledak.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 {/* Free Tier */}
                 <Card className="border-none shadow-sm rounded-[40px] p-8 bg-background flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black font-heading tracking-tight">Starter</h3>
                          <p className="text-muted-foreground text-sm font-medium">Cocok buat kamu yang baru mau nyoba jualan digital.</p>
                       </div>
                       <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black tracking-tighter">Gratis</span>
                          <span className="text-muted-foreground font-bold text-sm tracking-widest uppercase">/ Selamanya</span>
                       </div>
                       <div className="h-px bg-muted" />
                       <ul className="space-y-4">
                          {[
                             "Maksimal 20 Produk",
                             "Laporan Penjualan Harian",
                             "Support Komunitas",
                             "Fee Platform 5%"
                          ].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                   <Check className="h-3 w-3 text-green-500" />
                                </div>
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-2 font-black text-lg mt-12 hover:bg-primary/5 hover:border-primary/20">
                       <Link href="/seller/register">Mulai Sekarang</Link>
                    </Button>
                 </Card>

                 {/* Premium Tier */}
                 <Card className="border-none shadow-2xl rounded-[40px] p-8 bg-slate-900 text-white relative flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                    <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl font-black text-xs uppercase tracking-widest text-slate-900">Best Value</div>
                    
                    <div className="space-y-6 relative z-10">
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black font-heading tracking-tight">Pro Seller</h3>
                          <p className="text-slate-400 text-sm font-medium">Untuk UMKM yang mau serius kembangin bisnis.</p>
                       </div>
                       <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black tracking-tighter text-primary italic">Rp 99rb</span>
                          <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">/ Bulan</span>
                       </div>
                       <div className="h-px bg-white/10" />
                       <ul className="space-y-4">
                          {[
                             "Produk Tanpa Batas",
                             "Analitik Bisnis Lengkap",
                             "Prioritas Chat Support 24/7",
                             "Bebas Biaya Platform (0%)",
                             "Fitur Promo & Diskon"
                          ].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                   <Check className="h-3 w-3 text-primary" />
                                </div>
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <Button asChild className="w-full h-14 rounded-2xl font-black text-lg mt-12 bg-primary hover:bg-primary/90 text-slate-900 shadow-xl shadow-primary/20">
                       <Link href="/seller/register">Coba Pro Gratis 7 Hari</Link>
                    </Button>
                    
                    {/* Background Decor for Premium */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                 </Card>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-40 bg-background overflow-hidden relative">
           <div className="container px-4 text-center space-y-12 relative z-10">
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-5xl md:text-8xl font-heading font-black tracking-tighter leading-none animate-in fade-in duration-1000">
                  Siap Bawa <br className="hidden md:block" />
                  <span className="text-primary italic">Jajananmu</span> Go Digital?
                </h2>
                <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
                  Daftar sekarang dan rasakan kemudahan mengelola jualan jajan dengan sistem yang modern dan cerdas.
                </p>
              </div>
              <Button asChild className="h-20 px-12 rounded-[32px] text-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-110 active:scale-95">
                 <Link href="/seller/register">Gabung Jadi Seller</Link>
              </Button>
           </div>
           
           {/* Decorative elements */}
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
           <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
        </section>
      </main>

      {/* Footer - Consistent with Home */}
      <footer className="bg-muted/30 pt-20 pb-12 border-t border-primary/5">
        <div className="container px-4">
           <div className="text-center space-y-8">
              <Link href="/" className="inline-flex items-center gap-2 font-heading font-black text-3xl tracking-tighter text-primary">
                <ShoppingBag className="h-8 w-8 fill-primary/10" />
                <span>YukJajan<span className="text-foreground">.</span></span>
              </Link>
              <p className="text-sm text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                Sahabat digital UMKM Indonesia. Membantu pedagang jajanan naik kelas dengan teknologi kasir dan toko online tercanggih.
              </p>
              <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                 <Link href="#fitur" className="hover:text-primary transition-colors">Fitur Utama</Link>
                 <Link href="#harga" className="hover:text-primary transition-colors">Harga Paket</Link>
                 <Link href="/buyer/login" className="hover:text-primary transition-colors">Halaman Pembeli</Link>
                 <Link href="/seller/login" className="hover:text-primary transition-colors">Login Penjual</Link>
              </nav>
              <div className="pt-12 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                 <p>© {currentYear} YukJajan Indonesia. Digitalizing Indonesian Flavors.</p>
                 <div className="flex gap-8">
                    <Link href="#" className="hover:text-primary transition-colors">Terma & Layanan</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Privasi</Link>
                 </div>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
