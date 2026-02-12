import Link from "next/link";
import { ShoppingBag, User, LogOut, Package } from "lucide-react";
import { signOutBuyer } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if ((profile as any)?.role === "seller") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-7 w-7 fill-primary/10" />
            <span>YukJajan<span className="text-foreground">.</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="transition-colors hover:text-primary text-muted-foreground">
              Belanja
            </Link>
            <Link href="/buyer/orders" className="transition-colors hover:text-primary text-muted-foreground">
              Pesanan Saya
            </Link>
            <Link href="/buyer/profile" className="transition-colors hover:text-primary text-muted-foreground">
              Profil
            </Link>
          </nav>
          <div className="flex items-center gap-4">
             {user ? (
                <Button asChild variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary transition-all">
                   <Link href="/buyer/profile">
                      <User className="h-5 w-5" />
                   </Link>
                </Button>
             ) : (
                <Button asChild size="sm" className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20">
                    <Link href="/buyer/login">Masuk</Link>
                </Button>
             )}
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 pb-32">
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around p-4 pb-8 z-50">
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
