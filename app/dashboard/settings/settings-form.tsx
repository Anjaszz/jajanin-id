"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ShoppingBag, 
  MapPin, 
  Globe, 
  Image as ImageIcon, 
  CheckCircle2, 
  CreditCard, 
  LogOut, 
  Shield, 
  Clock, 
  ShieldOff 
} from "lucide-react"
import { signOutSeller } from "@/app/actions/auth"
import { updateShopSettings } from "@/app/actions/settings"
import ScheduleSettings from "./schedule-settings"
import { BankSelect } from "@/components/dashboard/bank-select"
import { toast } from "sonner"

interface SettingsFormProps {
  shop: any
  isAdmin: boolean
}

export default function SettingsForm({ shop, isAdmin }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: shop.name,
    description: shop.description || "",
    whatsapp: (shop as any).whatsapp || "",
    address: shop.address || "",
    google_maps_link: shop.google_maps_link || "",
    bank_name: (shop as any).bank_name || "",
    bank_account: (shop as any).bank_account || "",
    bank_holder_name: (shop as any).bank_holder_name || "",
  })

  // Track if files are selected
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [coverFile, setCoverFile] = React.useState<File | null>(null)

  const hasChanges = React.useMemo(() => {
    const fieldChanges = 
      formData.name !== shop.name ||
      formData.description !== (shop.description || "") ||
      formData.whatsapp !== ((shop as any).whatsapp || "") ||
      formData.address !== (shop.address || "") ||
      formData.google_maps_link !== (shop.google_maps_link || "") ||
      formData.bank_name !== ((shop as any).bank_name || "") ||
      formData.bank_account !== ((shop as any).bank_account || "") ||
      formData.bank_holder_name !== ((shop as any).bank_holder_name || "")
    
    return fieldChanges || !!logoFile || !!coverFile
  }, [formData, shop, logoFile, coverFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)

    const form = new FormData(e.currentTarget)
    
    try {
      const result = await updateShopSettings(form)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Pengaturan berhasil disimpan")
        router.refresh()
        // Reset file states
        setLogoFile(null)
        setCoverFile(null)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    required 
                    className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" 
                  />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Deskripsi Singkat</Label>
                  <Textarea 
                     id="description" 
                     name="description" 
                     value={formData.description} 
                     onChange={handleInputChange}
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
                  <div className="p-3 bg-primary/10 rounded-xl">
                     <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  Kontak & Lokasi
               </CardTitle>
               <CardDescription className="text-sm">Cara pelanggan menemukan dan menghubungi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5 sm:p-6 pt-0 sm:pt-0">
               <div className="grid gap-2">
                  <Label htmlFor="whatsapp" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nomor WhatsApp</Label>
                  <Input 
                    id="whatsapp" 
                    name="whatsapp" 
                    value={formData.whatsapp} 
                    onChange={handleInputChange}
                    placeholder="0812..." 
                    required 
                    className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" 
                  />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="address" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Alamat Lengkap</Label>
                  <Textarea 
                     id="address" 
                     name="address" 
                     value={formData.address} 
                     onChange={handleInputChange}
                     placeholder="Alamat fisik toko..."
                     rows={2}
                     required
                     className="rounded-xl border-muted-foreground/10 focus:ring-primary/20 transition-all resize-none"
                  />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="google_maps_link" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Link Google Maps</Label>
                  <Input 
                    id="google_maps_link" 
                    name="google_maps_link" 
                    value={formData.google_maps_link} 
                    onChange={handleInputChange}
                    placeholder="https://goo.gl/maps/..." 
                    className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" 
                  />
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
                  <BankSelect 
                    name="bank_name" 
                    defaultValue={formData.bank_name} 
                    onChange={(val) => setFormData(prev => ({ ...prev, bank_name: val }))}
                  />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="bank_holder_name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nama Pemilik Rekening</Label>
                  <Input 
                    id="bank_holder_name" 
                    name="bank_holder_name" 
                    value={formData.bank_holder_name} 
                    onChange={handleInputChange}
                    placeholder="Nama sesuai buku tabungan..." 
                    className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" 
                    required 
                  />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="bank_account" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Nomor Rekening</Label>
                  <Input 
                    id="bank_account" 
                    name="bank_account" 
                    value={formData.bank_account} 
                    onChange={handleInputChange}
                    placeholder="Nomor rekening / nomor HP..." 
                    className="rounded-xl h-11 border-muted-foreground/10 focus:ring-primary/20 transition-all" 
                    required 
                  />
               </div>
               <div className="flex items-start gap-3 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                 <Shield className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] sm:text-xs text-green-700/80 font-semibold leading-relaxed">
                   Data ini digunakan untuk verifikasi pencairan dana. Pastikan nama dan nomor rekening sudah benar.
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
                        <Input 
                          id="logo" 
                          name="logo" 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                          className="rounded-xl h-10 text-xs bg-background cursor-pointer" 
                        />
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Format: .JPG, .PNG • Max: 2MB {logoFile && <span className="text-primary ml-2">• File Terpilih!</span>}</p>
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
                     <Input 
                       id="cover" 
                       name="cover" 
                       type="file" 
                       accept="image/*" 
                       onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                       className="rounded-xl h-10 text-xs bg-card cursor-pointer" 
                     />
                     {coverFile && <p className="text-[10px] font-bold text-primary italic">Banner baru siap diupload!</p>}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Global Save Button */}
         <div className="lg:col-span-2">
            <Card className={cn(
               "border-none shadow-2xl overflow-hidden relative group h-full transition-all duration-500",
               hasChanges ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
            )}>
               {hasChanges && <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 transition-transform group-hover:scale-110" />}
               <CardFooter className="p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left space-y-1 sm:max-w-md">
                     <p className={cn(
                        "text-lg font-black tracking-tight leading-none italic",
                        hasChanges ? "text-white" : "text-slate-400"
                     )}>
                        {hasChanges ? "Ada Perubahan Terdeteksi!" : "Tidak Ada Perubahan"}
                     </p>
                     <p className="text-xs font-medium leading-relaxed">
                        {hasChanges 
                          ? "Simpan perubahan informasi toko Anda agar segera tampil di halaman pembeli." 
                          : "Silakan ubah data di atas untuk mengaktifkan tombol simpan."}
                     </p>
                  </div>
                  <Button 
                     type="submit" 
                     size="lg" 
                     className={cn(
                        "w-full sm:w-auto px-10 h-14 text-base font-black uppercase tracking-widest transition-all rounded-2xl group",
                        hasChanges 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_40px_-10px] shadow-primary/40" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                     )}
                     disabled={!hasChanges || isPending || shop.is_active === false}
                  >
                     {isPending ? (
                        <span className="flex items-center gap-2">
                           <Clock className="h-5 w-5 animate-spin mr-2" />
                           Menyimpan...
                        </span>
                     ) : shop.is_active === false ? (
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
               </CardFooter>
            </Card>
         </div>
      </div>
    </form>
  )
}
