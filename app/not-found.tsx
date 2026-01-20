import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Home, Search, Ghost } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      {/* Header - Consistent with main app */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-7 w-7 fill-primary/10" />
            <span>YukJajan<span className="text-foreground">.</span></span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
        {/* Background Decor */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary rounded-full blur-[150px] animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/40 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative inline-block">
            <h1 className="text-[12rem] md:text-[18rem] font-heading font-black leading-none tracking-tighter text-muted/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="bg-card border-4 border-background shadow-2xl p-6 rounded-[40px] rotate-6 animate-bounce duration-3000">
                <Ghost className="h-20 w-20 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight leading-tight">
              Waduh! Jajanannya <span className="text-primary italic">Ilang...</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto leading-relaxed">
              Kayaknya halaman yang kamu cari lari duluan atau memang belum buka. Jangan sedih, masih banyak jajanan enak lainnya!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6">
            <Button asChild size="lg" className="h-14 px-8 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group">
              <Link href="/">
                <Home className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                Balik ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl text-lg font-bold border-2 transition-all hover:bg-primary/5 hover:border-primary/20">
              <Link href="/shops">
                 <Search className="mr-2 h-5 w-5" />
                 Cari Toko Lain
              </Link>
            </Button>
          </div>

          {/* Friendly Footer Link */}
          <div className="pt-12">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-muted" />
              Tetap Tenang & Terus Jajan
              <span className="w-8 h-px bg-muted" />
            </p>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="py-8 border-t bg-muted/30">
        <div className="container px-4 text-center">
          <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
            © {new Date().getFullYear()} YukJajan Indonesia. Teman Setia UMKM.
          </p>
        </div>
      </footer>
    </div>
  )
}
