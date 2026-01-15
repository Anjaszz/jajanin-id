import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, ShoppingCart, ArrowRight } from 'lucide-react'

export default function RegisterSelectionPage() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
        <CardDescription>
          Pilih jenis akun yang ingin Anda buat.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 py-6">
        <Link 
            href="/seller/register"
            className="flex items-center justify-between p-4 border-2 rounded-xl border-primary/10 hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
            <div className="flex items-center gap-4">
               <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Store className="h-6 w-6" />
               </div>
               <div className="text-left">
                  <h3 className="font-bold">Akun Penjual</h3>
                  <p className="text-xs text-muted-foreground">Buka toko & mulai jualan</p>
               </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
            href="/buyer/register"
            className="flex items-center justify-between p-4 border-2 rounded-xl border-muted hover:border-primary/50 hover:bg-muted/50 transition-all group"
        >
            <div className="flex items-center gap-4">
               <div className="bg-muted p-3 rounded-full text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ShoppingCart className="h-6 w-6" />
               </div>
               <div className="text-left">
                  <h3 className="font-bold">Akun Pembeli</h3>
                  <p className="text-xs text-muted-foreground">Untuk berbelanja saja</p>
               </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </CardContent>
      <div className="text-center pb-8 text-sm text-muted-foreground">
         Sudah punya akun? <Link href="/login" className="font-bold text-primary hover:underline">Masuk disini</Link>
      </div>
    </Card>
  )
}
