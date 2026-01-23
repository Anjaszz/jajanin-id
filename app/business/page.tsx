"use client";

import Link from "next/link";
import { Store, BarChart3, ShieldCheck, ArrowRight, Wallet, Globe, Smartphone, Check, Zap, ShoppingBag, Heart, Users, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function BusinessPage() {
  const currentYear = new Date().getFullYear();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      {/* Navbar */}
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "border-b bg-background/80 backdrop-blur-xl py-2 md:py-3" : "bg-transparent py-4 md:py-6"
      )}>
        <div className="container flex items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-lg md:text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-5 w-5 md:h-7 md:w-7 fill-primary/10" />
            <span>YukJajan</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-muted-foreground">
            <Link href="#fitur" className="transition-all hover:text-primary hover:-translate-y-px">Fitur</Link>
            <Link href="#harga" className="transition-all hover:text-primary hover:-translate-y-px">Harga</Link>
            <Link href="#faq" className="transition-all hover:text-primary hover:-translate-y-px">Bantuan</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button asChild variant="ghost" className="hidden sm:flex rounded-xl font-bold text-sm px-4 active:scale-95 transition-all">
               <Link href="/seller/login">Masuk</Link>
            </Button>
            <Button asChild className="rounded-xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-4 md:px-6 h-10 md:h-12 text-xs md:text-sm">
              <Link href="/seller/register">Mulai Jualan</Link>
            </Button>
            
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "lg:hidden fixed inset-x-0 top-[60px] md:top-[72px] bg-background border-b transition-all duration-300 overflow-hidden z-40",
          isMobileMenuOpen ? "max-h-[300px] opacity-100 shadow-xl" : "max-h-0 opacity-0 pointer-events-none"
        )}>
          <div className="flex flex-col p-6 gap-4 font-bold">
            <Link href="#fitur" className="text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Fitur Utama</Link>
            <Link href="#harga" className="text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Harga Paket</Link>
            <div className="h-px bg-border my-2" />
            <Link href="/seller/login" className="text-muted-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>Masuk Seller</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 md:pt-24 md:pb-32 overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-[-10%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[150px] animate-pulse" />
              <div className="absolute bottom-10 left-[-10%] w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-blue-500/10 rounded-full blur-[60px] md:blur-[120px]" />
           </div>

           <div className="container px-4 text-center space-y-6 md:space-y-12">
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-1.5 md:py-2 rounded-full text-primary text-[10px] md:text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
                 <Zap className="h-3 w-3 fill-primary" />
                 Platform UMKM di Indonesia
              </div>
              
              <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter leading-tight md:leading-none animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  Digitalkan <br className="hidden md:block" />
                  <span className="bg-linear-to-r from-primary via-primary/80 to-blue-600 bg-clip-text text-transparent italic px-1">Toko Jajananmu</span> Sekarang.
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-xl font-medium leading-relaxed animate-in fade-in zoom-in-95 duration-700 delay-200 px-2 lg:px-4">
                  Kelola pesanan, stok, dan pembayaran dalam satu genggaman. YukJajan membantu UMKM naik kelas dengan sistem yang cerdas dan modern.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center py-2 md:py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                 <Button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl text-base md:text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95" asChild>
                   <Link href="/seller/register">Mulai Jualan Gratis</Link>
                 </Button>
                 <Link href="#" className="flex items-center gap-2 py-2 px-4 text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
                    <div className="p-2 md:p-3 bg-muted rounded-full group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                       <Smartphone className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <span>Konsultasi Gratis</span>
                 </Link>
              </div>

              {/* Trust Badge */}
              <div className="pt-8 md:pt-16 flex flex-col items-center gap-4 md:gap-6 animate-in fade-in duration-1000 delay-500">
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Dipercaya Oleh 500+ Pedagang Jajanan</p>
                 <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 grayscale opacity-30 px-4">
                    <div className="flex items-center gap-2 font-black text-base md:text-xl italic">UMKM</div>
                    <div className="flex items-center gap-2 font-black text-base md:text-xl italic">Local</div>
                    <div className="flex items-center gap-2 font-black text-base md:text-xl italic">Food</div>
                    <div className="flex items-center gap-2 font-black text-base md:text-xl italic">Trusted</div>
                 </div>
              </div>
           </div>
        </section>

        {/* Interactive Stats */}
        <section className="container px-4 py-8 md:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {[
              { label: "Fee Platform", value: "0%", sub: "Untuk Paket Pro" },
              { label: "Waktu Setup", value: "5 Menit", sub: "Langsung Jualan" },
              { label: "Metode Bayar", value: "Lengkap", sub: "QRIS, VA, E-Wallet" },
              { label: "Keamanan", value: "Cloud", sub: "Data Terproteksi" },
            ].map((stat, i) => (
              <div key={i} className="bg-card border-2 border-primary/5 p-4 md:p-8 rounded-3xl md:rounded-[32px] hover:border-primary/20 transition-all group text-center md:text-left">
                <div className="text-2xl md:text-4xl font-black text-primary mb-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                <div className="text-[10px] md:text-sm font-black uppercase tracking-widest mb-0.5 md:mb-1">{stat.label}</div>
                <div className="text-[9px] md:text-xs text-muted-foreground font-medium">{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="container px-4 py-12 md:py-32">
            <div className="text-center md:text-left max-w-3xl mb-10 md:mb-16 space-y-3 md:space-y-4">
               <h2 className="text-3xl md:text-6xl font-heading font-black tracking-tighter leading-tight">Fitur Canggih, <br /><span className="text-primary italic">Kelola Makin Gampang.</span></h2>
               <p className="text-muted-foreground font-medium text-sm md:text-lg leading-relaxed">
                 Kami mendesain fitur yang benar-benar dibutuhkan oleh pedagang jajanan, Fokus pada kemudahan penggunaan.
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
               {[
                  {
                     icon: Globe,
                     title: "Link Toko Digital",
                     desc: "Pelanggan bisa langsung pesan melalui link toko unikmu. Cukup buka dari browser."
                  },
                  {
                     icon: Wallet,
                     title: "POS Digital Cerdas",
                     desc: "Catat pesanan secara real-time. Hitung total otomatis dengan berbagai pilihan pembayaran."
                  },
                  {
                     icon: Smartphone,
                     title: "Kelola Sambil Rebah",
                     desc: "Terima notifikasi pesanan masuk langsung ke HP. Kelola stok dari mana saja."
                  },
                  {
                     icon: BarChart3,
                     title: "Analitik Penjualan",
                     desc: "Pantau omzet harian dan produk laris untuk strategi jualan esok hari."
                  },
                  {
                     icon: ShieldCheck,
                     title: "Data Aman di Cloud",
                     desc: "Semua data transaksi tersimpan aman. Gak perlu takut catatan kertas hilang."
                  },
                  {
                     icon: Store,
                     title: "Manajemen Stok",
                     desc: "Stok terpotong otomatis setiap ada pesanan. Alarm otomatis jika stok menipis."
                  }
               ].map((feature, i) => (
                  <div key={i} className="group relative p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-card border border-primary/5 hover:border-primary/20 hover:shadow-xl transition-all duration-500 overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] -z-10" />
                     <div className="h-10 w-10 md:h-14 md:w-14 bg-primary text-primary-foreground rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-500">
                        <feature.icon className="h-5 w-5 md:h-7 md:w-7" />
                     </div>
                     <h3 className="text-lg md:text-2xl font-black font-heading tracking-tight mb-2 leading-tight">{feature.title}</h3>
                     <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed">
                        {feature.desc}
                     </p>
                  </div>
               ))}
            </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="bg-muted/30 py-16 md:py-32 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-20 bg-linear-to-b from-background to-transparent" />
           <div className="container px-4">
              <div className="text-center mb-10 md:mb-16 space-y-3">
                 <h2 className="text-3xl md:text-6xl font-heading font-black tracking-tight leading-tight">Pilih Paket <br /><span className="text-primary italic">Sesuai Skala Bisnis.</span></h2>
                 <p className="text-muted-foreground max-w-xl mx-auto font-medium text-sm md:text-lg px-2">Upgrade kapan saja saat bisnismu mulai meledak.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto px-1">
                 {/* Free Tier */}
                 <div className="bg-white border md:border-none rounded-[32px] md:rounded-[48px] p-6 md:p-10 flex flex-col justify-between hover:shadow-lg transition-all group">
                    <div className="space-y-6 md:space-y-8">
                       <div className="space-y-2">
                          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">Gratis Selamanya</div>
                          <h3 className="text-2xl md:text-3xl font-black font-heading tracking-tight mt-3 text-slate-800">Paket Starter</h3>
                          <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">Cocok buat kamu yang baru mulai.</p>
                       </div>
                       <div className="flex items-baseline gap-1">
                          <span className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">Rp 0</span>
                          <span className="text-slate-400 font-bold text-[10px] md:text-sm tracking-widest uppercase">/ Selamanya</span>
                       </div>
                       <div className="h-px bg-slate-100" />
                       <ul className="grid gap-3 md:gap-4">
                          {[
                             "Maksimal 20 Katalog Produk",
                             "Laporan Penjualan Harian",
                             "Notifikasi WA Standar",
                             "Fee Platform 5%"
                          ].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-600">
                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <Button asChild variant="outline" className="w-full h-12 md:h-16 rounded-2xl border-2 font-black text-base md:text-lg mt-8 md:mt-12 hover:bg-slate-50 active:scale-95 transition-all">
                       <Link href="/seller/register">Mulai Gratis</Link>
                    </Button>
                 </div>

                 {/* Premium Tier */}
                 <div className="bg-[#0f172a] rounded-[32px] md:rounded-[48px] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl hover:scale-[1.01] transition-all group">
                    <div className="absolute top-0 right-0 bg-red-500 px-6 md:px-8 py-2 md:py-3 rounded-bl-2xl md:rounded-bl-[32px] font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white shadow-xl z-20">Best Value</div>
                    
                    <div className="space-y-6 md:space-y-8 relative z-10">
                       <div className="space-y-2 md:space-y-3">
                          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/10">Pro Features</div>
                          <h3 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white italic">Paket Pro</h3>
                          <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">Untuk UMKM yang mau serius omzet tinggi.</p>
                       </div>
                       <div className="flex items-baseline gap-1">
                          <span className="text-4xl md:text-6xl font-black tracking-tighter text-white italic">Rp 99k</span>
                          <span className="text-slate-400 font-bold text-[10px] md:text-sm tracking-widest uppercase">/ Bulan</span>
                       </div>
                       <div className="h-px bg-white/10" />
                       <ul className="grid gap-3 md:gap-4">
                          {[
                             "Katalog Produk Tanpa Batas",
                             "Dashboard Analitik Premium",
                             "Prioritas Support 24/7",
                             "Fee Platform 0%",
                             "Custom Promo & Voucher"
                          ].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-200">
                                <Check className="h-4 w-4 text-blue-400 shrink-0" />
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <Button asChild className="w-full h-12 md:h-16 rounded-2xl font-black text-base md:text-lg mt-8 md:mt-12 bg-white hover:bg-white/90 text-slate-900 shadow-xl shadow-white/10 active:scale-95 transition-all">
                       <Link href="/seller/register">Coba Pro Sekarang</Link>
                    </Button>
                    
                    <div className="absolute bottom-[-10%] left-[-10%] w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-48 relative overflow-hidden">
           <div className="container px-4 text-center space-y-8 md:space-y-12 relative z-10">
              <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
                <h2 className="text-4xl md:text-8xl lg:text-9xl font-heading font-black tracking-tighter leading-none px-2">
                  Siap <span className="text-primary italic">Cuan</span> <br className="md:hidden" /> Bareng YukJajan?
                </h2>
                <p className="text-muted-foreground text-base md:text-2xl font-medium max-w-2xl mx-auto px-4">
                  Daftar cuma butuh 5 menit. Langsung dapet link toko online tercanggih.
                </p>
              </div>
              <Button asChild className="h-16 md:h-24 px-10 md:px-16 rounded-[24px] md:rounded-[40px] text-xl md:text-3xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                 <Link href="/seller/register">Buka Toko Sekarang!</Link>
              </Button>
           </div>
           
           <div className="absolute inset-0 -z-10 overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[100px] md:blur-[150px]" />
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 pt-16 pb-12 border-t border-primary/5">
        <div className="container px-4 text-center space-y-12">
           <div className="flex flex-col items-center gap-4">
              <Link href="/" className="inline-flex items-center gap-2 font-heading font-black text-2xl md:text-4xl tracking-tighter text-primary">
                <ShoppingBag className="h-7 w-7 md:h-10 md:w-10 fill-primary/10" />
                <span>YukJajan<span className="text-foreground">.</span></span>
              </Link>
              <p className="text-xs md:text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
                Sahabat digital UMKM Indonesia. Digitalizing Indonesian Flavors.
              </p>
           </div>
           
           <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-12 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="#fitur" className="hover:text-primary transition-colors">Fitur</Link>
              <Link href="#harga" className="hover:text-primary transition-colors">Harga</Link>
              <Link href="/buyer/login" className="hover:text-primary transition-colors">Pembeli</Link>
              <Link href="/seller/login" className="hover:text-primary transition-colors">Penjual</Link>
           </nav>

           <div className="pt-8 md:pt-12 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">
              <p>© {currentYear} YukJajan Indonesia.</p>
              <div className="flex gap-6 md:gap-10">
                 <Link href="#" className="hover:text-primary transition-colors">Term</Link>
                 <Link href="#" className="hover:text-primary transition-colors">Privasi</Link>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
