import { getShop } from "@/app/actions/shop"
import { updateShopSettings } from "@/app/actions/settings"
import { isAdmin } from "@/app/actions/admin"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingBag, MapPin, Globe, Image as ImageIcon, CheckCircle2, CreditCard, LogOut, Shield } from "lucide-react"
import { signOutSeller } from "@/app/actions/auth"

export default async function SettingsPage() {
  const shop = await getShop()
  const isUserAdmin = await isAdmin()

  if (!shop) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Pengaturan Toko
        </h1>
        <p className="text-muted-foreground">Kelola informasi publik dan branding toko Anda.</p>
      </div>

      <form action={updateShopSettings as any} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
           {/* Basic Info */}
           <Card className="border-none shadow-lg">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Informasi Dasar
                 </CardTitle>
                 <CardDescription>Nama dan deskripsi toko yang dilihat pelanggan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-2">
                    <Label htmlFor="name">Nama Toko</Label>
                    <Input id="name" name="name" defaultValue={shop.name} required />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea 
                       id="description" 
                       name="description" 
                       defaultValue={shop.description || ''} 
                       placeholder="Ceritakan tentang toko Anda..."
                       rows={4}
                    />
                 </div>
              </CardContent>
           </Card>

           {/* Contact & Location */}
           <Card className="border-none shadow-lg">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Kontak & Lokasi
                 </CardTitle>
                 <CardDescription>Cara pelanggan menemukan dan menghubungi Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-2">
                    <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                    <Input id="whatsapp" name="whatsapp" defaultValue={(shop as any).whatsapp || ''} placeholder="0812..." required />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Textarea 
                       id="address" 
                       name="address" 
                       defaultValue={shop.address || ''} 
                       placeholder="Alamat fisik toko..."
                       rows={2}
                       required
                    />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="google_maps_link">Link Google Maps (URL)</Label>
                    <Input id="google_maps_link" name="google_maps_link" defaultValue={shop.google_maps_link || ''} placeholder="https://goo.gl/maps/..." />
                 </div>
              </CardContent>
           </Card>

           {/* Bank Account */}
           <Card className="border-none shadow-lg bg-linear-to-br from-green-500/5 to-transparent">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Rekening Penarikan
                 </CardTitle>
                 <CardDescription>Rekening tujuan untuk mencairkan saldo pendapatan Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-2">
                    <Label htmlFor="bank_name">Nama Bank</Label>
                    <Input id="bank_name" name="bank_name" defaultValue={(shop as any).bank_name || ''} placeholder="Contoh: BCA, Mandiri, BNI..." />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="bank_account">Nomor Rekening</Label>
                    <Input id="bank_account" name="bank_account" defaultValue={(shop as any).bank_account || ''} placeholder="Masukkan nomor rekening..." />
                 </div>
                 <p className="text-[10px] text-muted-foreground bg-green-500/10 p-2 rounded-lg border border-green-500/20 font-medium italic">
                   Penting: Pastikan data rekening benar agar proses penarikan saldo tidak terhambat.
                 </p>
              </CardContent>
           </Card>

           {/* Branding */}
           <Card className="border-none shadow-lg">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Branding & Media
                 </CardTitle>
                 <CardDescription>Upload logo dan banner toko.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="grid gap-8">
                    <div className="space-y-4">
                       <Label>Logo Toko</Label>
                       <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden border-2 border-dashed flex items-center justify-center shrink-0">
                             {shop.logo_url ? (
                                <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                             ) : (
                                <ShoppingBag className="h-6 w-6 text-muted-foreground opacity-20" />
                             )}
                          </div>
                          <div className="flex-1 space-y-2">
                             <Input id="logo" name="logo" type="file" accept="image/*" />
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Format: JPG, PNG • Max: 2MB</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <Label>Banner Toko</Label>
                       <div className="space-y-4">
                          <div className="h-20 w-full rounded-2xl bg-muted overflow-hidden border-2 border-dashed flex items-center justify-center">
                             {shop.cover_url ? (
                                <img src={shop.cover_url} alt="Cover" className="w-full h-full object-cover" />
                             ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground opacity-20" />
                             )}
                          </div>
                          <Input id="cover" name="cover" type="file" accept="image/*" />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="md:col-span-2 border-none shadow-lg bg-primary text-primary-foreground">
              <CardFooter className="p-6 flex justify-between items-center">
                 <p className="text-sm font-medium opacity-90">Simpan perubahan untuk memperbarui profil publik Anda.</p>
                 <Button type="submit" variant="secondary" className="shadow-xl">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                 </Button>
              </CardFooter>
           </Card>
        </div>
      </form>

      {/* Action Links */}
      <div className="flex justify-center gap-4">
         <Button variant="outline" asChild>
            <a href={`/${shop.slug}`} target="_blank">
               <Globe className="h-4 w-4 mr-2" />
               Lihat Halaman Toko (Buyer POV)
            </a>
         </Button>
         
         {isUserAdmin && (
            <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800" asChild>
               <a href="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
               </a>
            </Button>
         )}

         <form action={signOutSeller as any}>
            <Button variant="destructive">
               <LogOut className="h-4 w-4 mr-2" />
               Keluar
            </Button>
         </form>
      </div>
    </div>
  )
}
