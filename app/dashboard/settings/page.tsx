import { getShop } from "@/app/actions/shop"
import { isAdmin } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { ShoppingBag, MapPin, Globe, Image as ImageIcon, CheckCircle2, CreditCard, LogOut, Shield, Clock, ShieldOff } from "lucide-react"
import { signOutSeller } from "@/app/actions/auth"
import SettingsForm from "./settings-form"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/server"

export default async function SettingsPage() {
  const shop = await getShop()
  const isUserAdmin = await isAdmin()
  
  if (!shop) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", shop.owner_id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight bg-linear-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          Pengaturan Toko
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg max-w-2xl font-medium">
          Kelola informasi publik, branding, dan status operasional toko Anda dalam satu halaman.
        </p>
      </div>

      <SettingsForm shop={shop} isAdmin={isUserAdmin} sellerName={(profile as any)?.name || ''} />

      {/* Quick Links Section */}
      <div className="pt-6 sm:pt-10 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4">
           <Button variant="outline" size="lg" className="rounded-2xl h-12 text-sm sm:text-base border-primary/20 bg-white dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-slate-800 hover:text-primary transition-all font-bold dark:text-white" asChild>
              <a href={`/${shop.slug}`} target="_blank">
                 <Globe className="h-4 w-4 mr-2.5" />
                 Lihat Toko Publik
              </a>
           </Button>
           
           {isUserAdmin && (
              <Button variant="outline" size="lg" className="rounded-2xl h-12 text-sm sm:text-base border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-300 transition-all font-bold" asChild>
                 <a href="/admin">
                    <Shield className="h-4 w-4 mr-2.5" />
                    Admin Access
                 </a>
              </Button>
           )}

           <form action={signOutSeller as any} className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-2xl h-12 text-sm sm:text-base text-destructive hover:bg-destructive/10 transition-all font-bold">
                 <LogOut className="h-4 w-4 mr-2.5" />
                 Keluar Akun
              </Button>
           </form>
        </div>
      </div>
    </div>
  )
}
