
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Store, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>SaaSMarket.</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/explore" className="transition-colors hover:text-primary">Jelajahi</Link>
            <Link href="/features" className="transition-colors hover:text-primary">Fitur</Link>
            <Link href="/pricing" className="transition-colors hover:text-primary">Harga</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Masuk
            </Link>
            <Link href="/register" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Daftar Penjual
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                🚀 Platform Jual Beli Masa Depan
              </div>
              <h1 className="text-4xl font-heading font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
                Solusi Marketplace Terpadu untuk Bisnis Anda
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Platform SaaS multi-tenant yang memungkinkan Anda membuka toko online dalam hitungan menit. 
                Sistem pembayaran terintegrasi, manajemen stok real-time, dan desain premium.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  Mulai Jualan Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/explore" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  Lihat Demo Toko
                </Link>
              </div>
            </div>
            
            {/* Abstract Visual */}
            <div className="mt-16 relative mx-auto max-w-5xl">
               <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] bg-linear-to-br from-secondary/50 via-background to-secondary/30 rounded-xl">
                    <p className="text-muted-foreground italic">Interactive Dashboard Preview Image Placeholder</p>
                  </div>
               </div>
               {/* Decorative Gradients */}
               <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
               <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-[100px]" />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container px-4 md:px-6 py-24 space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl">Fitur Unggulan</h2>
              <p className="text-muted-foreground md:text-lg">
                Dibangun dengan teknologi terbaru untuk performa dan keamanan maksimal.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Multi-Tenant Store</h3>
                <p className="text-muted-foreground">Satu akun untuk membuka banyak toko dengan manajemen terpusat.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Secure Payments</h3>
                <p className="text-muted-foreground">Integrasi Midtrans Gateway dan sistem saldo dompet digital yang aman.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Modern Checkout</h3>
                <p className="text-muted-foreground">Pengalaman belanja mulus dengan keranjang mengambang dan UI responsif.</p>
              </div>
            </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6 text-muted-foreground">
          <p className="text-center text-sm leading-loose md:text-left">
            Built by <span className="font-medium text-foreground">Anjaszz Project</span>. 
            Powered by Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}
