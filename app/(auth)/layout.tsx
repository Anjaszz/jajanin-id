
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 lg:p-8">
       <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>YukJajan.</span>
        </Link>
       </div>
      <div className="w-full max-w-md space-y-4">
        {children}
      </div>
    </div>
  )
}
