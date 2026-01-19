import Link from "next/link";
import { ShoppingBag, User, LogOut, Package } from "lucide-react";
import { signOutBuyer } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>SaaSMarket</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary">
              Belanja
            </Link>
            <Link href="/buyer/orders" className="transition-colors hover:text-primary">
              Pesanan Saya
            </Link>
            <Link href="/buyer/profile" className="transition-colors hover:text-primary">
              Profil
            </Link>
          </nav>
          <div className="flex items-center gap-4">
             <form action={signOutBuyer as any}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                   <LogOut className="h-4 w-4 mr-2" />
                   Keluar
                </Button>
             </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex justify-around p-4 z-50">
         <Link href="/" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
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
    </div>
  );
}
