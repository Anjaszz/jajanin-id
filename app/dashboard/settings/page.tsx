import { getShop } from "@/app/actions/shop"
import { isAdmin } from "@/app/actions/admin"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingBag, MapPin, Globe, Image as ImageIcon, CheckCircle2, CreditCard, LogOut, Shield, Clock, ShieldOff } from "lucide-react"
import { signOutSeller } from "@/app/actions/auth"
import { updateShopSettings } from "@/app/actions/settings"
import ScheduleSettings from "./schedule-settings"

export default async function SettingsPage() {
  const shop = await getShop()
  const isUserAdmin = await isAdmin()

  if (!shop) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight bg-linear-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          Pengaturan Toko
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl font-medium">
          Kelola informasi publik, branding, dan status operasional toko Anda dalam satu halaman.
        </p>
      </div>

      <form action={updateShopSettings as any} className="space-y-6 sm:space-y-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2">
           
           {/* Basic Info */}
           <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xs">
              <CardHeader className="space-y-2 p-5 sm:p-6">
                 <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
                    <div className="p-2 bg-primary/10 rounded-xl">
                       <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    Informasi Dasar
                 </CardTitle>
                 <CardDescription className="text-sm">Nama dan deskripsi toko yang dilihat pelanggan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-5 sm:p-6 pt-0 sm:pt-0">
                 <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nama Toko</Label>
                    <Input id="name" name="name" defaultValue={shop.name} required className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Deskripsi Singkat</Label>
                    <Textarea 
                       id="description" 
                       name="description" 
                       defaultValue={shop.description || ''} 
                       placeholder="Ceritakan tentang toko Anda..."
                       rows={4}
                       className="rounded-xl border-muted-foreground/10 focus:ring-primary/20 transition-all resize-none"
                    />
                 </div>
              </CardContent>
           </Card>

           {/* Contact & Location */}
           <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xs">
              <CardHeader className="space-y-2 p-5 sm:p-6">
                 <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
                    <div className="p-2 bg-primary/10 rounded-xl">
                       <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Kontak & Lokasi
                 </CardTitle>
                 <CardDescription className="text-sm">Cara pelanggan menemukan dan menghubungi Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-5 sm:p-6 pt-0 sm:pt-0">
                 <div className="grid gap-2">
                    <Label htmlFor="whatsapp" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nomor WhatsApp</Label>
                    <Input id="whatsapp" name="whatsapp" defaultValue={(shop as any).whatsapp || ''} placeholder="0812..." required className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="address" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Alamat Lengkap</Label>
                    <Textarea 
                       id="address" 
                       name="address" 
                       defaultValue={shop.address || ''} 
                       placeholder="Alamat fisik toko..."
                       rows={2}
                       required
                       className="rounded-xl border-muted-foreground/10 focus:ring-primary/20 transition-all resize-none"
                    />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="google_maps_link" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Link Google Maps</Label>
                    <Input id="google_maps_link" name="google_maps_link" defaultValue={shop.google_maps_link || ''} placeholder="https://goo.gl/maps/..." className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" />
                 </div>
              </CardContent>
           </Card>

           {/* Operating Status - Full Width on Desktop */}
           <div className="lg:col-span-2">
              <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xs overflow-hidden">
                 <CardHeader className="space-y-2 p-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
                       <div className="p-2 bg-primary/10 rounded-xl">
                          <Clock className="h-5 w-5 text-primary" />
                       </div>
                       Status Operasional
                    </CardTitle>
                    <CardDescription className="text-sm font-medium">Atur jam operasional atau tutup toko secara instan. <span className="text-primary">(Simpan Otomatis)</span></CardDescription>
                 </CardHeader>
                 <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0">
                     <ScheduleSettings 
                       key={shop.updated_at}
                       initialHours={(shop as any).operating_hours || {}} 
                       isManualClosed={(shop as any).is_manual_closed || false}
                       isDeactivated={shop.is_active === false}
                     />
                 </CardContent>
              </Card>
           </div>

           {/* Bank Account */}
           <Card className="border-none shadow-xl bg-linear-to-br from-green-500/5 to-transparent border-t-2 border-green-500/10">
              <CardHeader className="space-y-2 p-5 sm:p-6">
                 <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                       <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    Rekening Penarikan
                 </CardTitle>
                 <CardDescription className="text-sm">Tujuan pencairan saldo pendapatan Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-5 sm:p-6 pt-0 sm:pt-0">
                 <div className="grid gap-2">
                    <Label htmlFor="bank_name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nama Bank</Label>
                    <Input id="bank_name" name="bank_name" defaultValue={(shop as any).bank_name || ''} placeholder="BCA / Mandiri / BNI / E-Wallet..." className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="bank_account" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nomor Rekening</Label>
                    <Input id="bank_account" name="bank_account" defaultValue={(shop as any).bank_account || ''} placeholder="Nomor rekening / nomor HP..." className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" />
                 </div>
                 <div className="flex items-start gap-3 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                   <Shield className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                   <p className="text-[11px] sm:text-xs text-green-700/80 font-semibold leading-relaxed">
                     Data ini digunakan untuk verifikasi pencairan dana. Pastikan nomor rekening sudah benar.
                   </p>
                 </div>
              </CardContent>
           </Card>

           {/* Branding */}
           <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xs">
              <CardHeader className="space-y-2 p-5 sm:p-6">
                 <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
                    <div className="p-2 bg-primary/10 rounded-xl">
                       <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    Branding & Media
                 </CardTitle>
                 <CardDescription className="text-sm">Visual identitas toko Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-5 sm:p-6 pt-0 sm:pt-0">
                 <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Logo Toko</Label>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-muted/30 p-4 rounded-2xl border border-dashed border-primary/20">
                       <div className="h-24 w-24 sm:h-20 sm:w-20 rounded-2xl bg-muted overflow-hidden border-2 border-white shadow-lg flex items-center justify-center shrink-0">
                          {shop.logo_url ? (
                             <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                             <ShoppingBag className="h-8 w-8 text-primary/20" />
                          )}
                       </div>
                       <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                          <Input id="logo" name="logo" type="file" accept="image/*" className="rounded-xl h-10 text-xs bg-background cursor-pointer" />
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Format: .JPG, .PNG • Max: 2MB</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Banner Toko</Label>
                    <div className="space-y-4">
                       <div className="h-28 sm:h-24 w-full rounded-2xl bg-muted overflow-hidden border-2 border-dashed border-primary/20 flex items-center justify-center group relative">
                          {shop.cover_url ? (
                             <img src={shop.cover_url} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                             <div className="flex flex-col items-center gap-1 opacity-20">
                                <ImageIcon className="h-8 w-8 text-primary" />
                                <span className="text-[10px] font-black">PREVIEW BANNER</span>
                             </div>
                          )}
                       </div>
                       <Input id="cover" name="cover" type="file" accept="image/*" className="rounded-xl h-10 text-xs bg-card cursor-pointer" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Global Save Button - Sticky on Mobile Bottom? Or just large card */}
           <div className="lg:col-span-2">
              <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative group h-full">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 transition-transform group-hover:scale-110" />
                 <CardFooter className="p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="text-center sm:text-left space-y-1 sm:max-w-md">
                       <p className="text-lg font-black tracking-tight leading-none italic">Satu Klik Lebih Bagus!</p>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">Simpan perubahan Informasi Dasar, Kontak, dan Branding Anda agar tampil di halaman pembeli.</p>
                    </div>
                    <Button 
                       type="submit" 
                       size="lg" 
                       className="w-full sm:w-auto px-10 h-14 text-base font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_40px_-10px] shadow-primary/40 rounded-2xl group transition-all"
                       disabled={shop.is_active === false}
                    >
                       {shop.is_active === false ? (
                          <span className="flex items-center gap-2 opacity-50">
                             <ShieldOff className="h-5 w-5 mr-3" />
                             Fitur Dikunci
                          </span>
                       ) : (
                          <>
                             <CheckCircle2 className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                             Simpan Perubahan
                          </>
                       )}
                    </Button>
                    {shop.is_active === false && (
                       <p className="sm:hidden text-center text-[10px] text-red-100 font-bold opacity-80">
                         Pengaturan dikunci sementara.
                       </p>
                    )}
                 </CardFooter>
              </Card>
           </div>
        </div>
      </form>

      {/* Quick Links Section */}
      <div className="pt-6 sm:pt-10 border-t border-muted/30">
        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4">
           <Button variant="outline" size="lg" className="rounded-2xl h-12 text-sm sm:text-base border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold" asChild>
              <a href={`/${shop.slug}`} target="_blank">
                 <Globe className="h-4 w-4 mr-2.5" />
                 Lihat Toko Publik
              </a>
           </Button>
           
           {isUserAdmin && (
              <Button variant="outline" size="lg" className="rounded-2xl h-12 text-sm sm:text-base border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-800 transition-all font-bold" asChild>
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
