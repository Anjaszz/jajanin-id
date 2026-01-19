import Link from "next/link";
import { Store, BarChart3, ShieldCheck, ArrowRight, Wallet, Globe, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BusinessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
            <Store className="h-6 w-6 text-primary" />
            <span>SaaSMarket Seller</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#hero" className="transition-colors hover:text-primary">Beranda</Link>
            <Link href="#features" className="transition-colors hover:text-primary">Fitur</Link>
            <Link href="#pricing" className="transition-colors hover:text-primary">Harga</Link>
            <Link href="#faq" className="transition-colors hover:text-primary">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/seller/login" className="text-sm font-medium hover:text-primary transition-colors">
              Masuk
            </Link>
            <Button asChild className="hidden sm:inline-flex rounded-full px-6">
              <Link href="/seller/register">Mulai Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="relative pt-20 pb-32 md:pt-32 md:pb-48 bg-white overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container px-4 md:px-6 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center rounded-full border bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
               <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
               Platform Bisnis #1 di Indonesia
            </div>
            
            <div className="mx-auto max-w-4xl space-y-4">
              <h1 className="text-4xl font-heading font-black tracking-tight sm:text-6xl md:text-7xl text-slate-900 leading-[1.1]">
                Bangun Kerajaan Bisnis <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600">Digital Anda Disini</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
                Tinggalkan cara lama. Beralih ke sistem manajemen toko modern yang terintegrasi, aman, dan mudah digunakan. Tanpa biaya tersembunyi.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-200">
                <Link href="/seller/register">
                  Buka Toko Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full text-lg bg-white/50 backdrop-blur-sm border-slate-300 hover:bg-white hover:text-primary">
                <Link href="/seller/login">Demonstrasi Dashboard</Link>
              </Button>
            </div>

            {/* Mockup Preview */}
            <div className="mt-16 mx-auto max-w-5xl relative group">
               <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
               <div className="relative rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] flex items-center justify-center bg-slate-100">
                  <div className="text-center space-y-2">
                     <BarChart3 className="h-16 w-16 text-slate-300 mx-auto" />
                     <p className="text-slate-400 font-medium">Dashboard Preview Placeholder</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-slate-50 py-12">
           <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                 { label: "Pengguna Aktif", value: "10,000+" },
                 { label: "Transaksi Harian", value: "Rp 5M+" },
                 { label: "Negara Terjangkau", value: "5+" },
                 { label: "Uptime Server", value: "99.99%" },
              ].map((stat, i) => (
                 <div key={i} className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900">{stat.value}</h3>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-heading font-bold tracking-tight sm:text-5xl text-slate-900">Solusi Lengkap untuk Penjual</h2>
              <p className="text-lg text-slate-600">Semua yang Anda butuhkan untuk mengelola, memasarkan, dan mengembangkan bisnis online Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  {
                     icon: Globe,
                     title: "Website Toko Custom",
                     desc: "Dapatkan subdomain unik (contoh: tokoanda.saasmarket.com) yang bisa langsung diakses pelanggan."
                  },
                  {
                     icon: Wallet,
                     title: "Pembayaran Terintegrasi",
                     desc: "Terima pembayaran via QRIS, Virtual Account, dan E-Wallet secara otomatis dengan fee rendah."
                  },
                  {
                     icon: Smartphone,
                     title: "Mobile Friendly",
                     desc: "Kelola toko dari mana saja. Dashboard kami didesain responsif untuk penggunaan di HP."
                  },
                  {
                     icon: BarChart3,
                     title: "Analitik Mendalam",
                     desc: "Pantau performa penjualan, produk terlaris, dan perilaku pelanggan dengan data real-time."
                  },
                  {
                     icon: ShieldCheck,
                     title: "Keamanan Tingkat Tinggi",
                     desc: "Data Anda dan pelanggan diamankan dengan enkripsi standar industri dan backup berkala."
                  },
                  {
                     icon: Store,
                     title: "Manajemen Inventaris",
                     desc: "Atur stok produk varian, dan kategori dengan mudah. Notifikasi otomatis saat stok menipis."
                  }
               ].map((feature, i) => (
                  <Card key={i} className="group hover:-translate-y-2 transition-transform duration-300 border-slate-200 hover:shadow-xl bg-slate-50/50 hover:bg-white">
                     <CardHeader>
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                           <feature.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <CardDescription className="text-base leading-relaxed text-slate-600">
                           {feature.desc}
                        </CardDescription>
                     </CardContent>
                  </Card>
               ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50 border-t">
           <div className="container px-4 md:px-6">
              <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
                 <h2 className="text-3xl font-heading font-bold tracking-tight sm:text-5xl text-slate-900">Harga Transparan</h2>
                 <p className="text-lg text-slate-600">Mulai gratis, upgrade saat bisnis Anda berkembang.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 {/* Free Tier */}
                 <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-white">
                    <CardHeader>
                       <CardTitle className="text-xl font-bold text-slate-900">Starter</CardTitle>
                       <CardDescription className="text-slate-600">Untuk pemula yang baru memulai.</CardDescription>
                       <div className="mt-4">
                          <span className="text-4xl font-black text-slate-900">Rp 0</span>
                          <span className="text-slate-500">/bulan</span>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 Toko</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 50 Produk</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basic Analytics</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 5% Platform Fee</li>
                       </ul>
                       <Button asChild className="w-full mt-6" variant="outline">
                          <Link href="/seller/register">Mulai Sekarang</Link>
                       </Button>
                    </CardContent>
                 </Card>

                 {/* Pro Tier */}
                 <Card className="border-primary shadow-2xl relative scale-105 z-10 bg-white">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
                    <CardHeader>
                       <CardTitle className="text-xl font-bold text-primary">Pro Business</CardTitle>
                       <CardDescription className="text-slate-600">Untuk bisnis yang sedang berkembang.</CardDescription>
                       <div className="mt-4">
                          <span className="text-4xl font-black text-slate-900">Rp 199rb</span>
                          <span className="text-slate-500">/bulan</span>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 3 Toko</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Produk</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Advanced Analytics</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 2% Platform Fee</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Prioritas Support</li>
                       </ul>
                       <Button asChild className="w-full mt-6 shadow-lg shadow-primary/20">
                          <Link href="/seller/register">Coba Gratis 14 Hari</Link>
                       </Button>
                    </CardContent>
                 </Card>

                 {/* Enterprise Tier */}
                 <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-white">
                    <CardHeader>
                       <CardTitle className="text-xl font-bold text-slate-900">Enterprise</CardTitle>
                       <CardDescription className="text-slate-600">Solusi kustom untuk skala besar.</CardDescription>
                       <div className="mt-4">
                          <span className="text-4xl font-black text-slate-900">Hubungi</span>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Toko</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Custom Domain</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Dedicated Manager</li>
                          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> API Access</li>
                       </ul>
                       <Button asChild className="w-full mt-6" variant="outline">
                          <Link href="/contact">Kontak Kami</Link>
                       </Button>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 -z-10 rotate-1 scale-150"></div>
           <div className="container px-4 md:px-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight leading-tight">
                       Jangan Biarkan Kompetitor <br/> <span className="text-primary">Mendahului Anda</span>
                    </h2>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                       Bergabunglah sekarang dengan ribuan pengusaha sukses lainnya. Setup toko Anda dalam waktu kurang dari 5 menit.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                       <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/seller/register">Gabung Sekarang</Link>
                       </Button>
                    </div>
                 </div>
                 
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 -m-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 left-0 -m-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-16">
        <div className="container px-4 md:px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1 space-y-4">
                 <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
                    <Store className="h-6 w-6 text-primary" />
                    <span>SaaSMarket</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    Platform e-commerce masa depan untuk UMKM Indonesia.
                 </p>
              </div>
              <div>
                 <h4 className="font-bold mb-4">Produk</h4>
                 <ul className="space-y-2 text-sm text-slate-600">
                    <li><Link href="#" className="hover:text-primary">Fitur</Link></li>
                    <li><Link href="#" className="hover:text-primary">Integrasi</Link></li>
                    <li><Link href="#" className="hover:text-primary">Harga</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-4">Perusahaan</h4>
                 <ul className="space-y-2 text-sm text-slate-600">
                    <li><Link href="#" className="hover:text-primary">Tentang Kami</Link></li>
                    <li><Link href="#" className="hover:text-primary">Karir</Link></li>
                    <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-4">Legal</h4>
                 <ul className="space-y-2 text-sm text-slate-600">
                    <li><Link href="#" className="hover:text-primary">Privasi</Link></li>
                    <li><Link href="#" className="hover:text-primary">Syarat</Link></li>
                 </ul>
              </div>
           </div>
           <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <p>&copy; 2024 SaaSMarket Inc. All rights reserved.</p>
              <div className="flex gap-4">
                 {/* Social icons placeholder */}
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
