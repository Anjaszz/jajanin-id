import { ShoppingBag } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="relative">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        <div className="relative bg-background rounded-full p-6 shadow-2xl border-2 border-primary/10 animate-pulse">
          <ShoppingBag className="h-10 w-10 text-primary animate-bounce" />
        </div>
      </div>
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-xl font-heading font-black tracking-tight animate-pulse">Menyiapkan Menu...</h3>
        <p className="text-sm text-muted-foreground font-medium">Bentar ya, lagi nunggu respon dari dapur.</p>
      </div>
    </div>
  )
}
