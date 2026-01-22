import { getBuyerProfile, updateBuyerProfile } from "@/app/actions/buyer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save } from "lucide-react";
import Link from "next/link";

export default async function BuyerProfilePage() {
  const profile = await getBuyerProfile() as any;

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6 px-4">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Belum Masuk Akun</h1>
          <p className="text-muted-foreground">Silakan masuk untuk mengelola profil dan alamat pengiriman Anda.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-full px-8">
            <Link href="/buyer/login">Masuk Sekarang</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/buyer/register">Daftar Akun</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>

      <Card>
        <CardHeader>
             <CardTitle>Informasi Pribadi</CardTitle>
             <CardDescription>Update data diri untuk kemudahan pengiriman.</CardDescription>
        </CardHeader>
        <CardContent>
            <form action={updateBuyerProfile as any} className="space-y-4">
                 <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled className="bg-muted" />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" name="name" defaultValue={profile.name} placeholder="Nama Anda" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" name="phone" defaultValue={profile.phone} placeholder="08..." />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="address">Alamat Pengiriman Default</Label>
                    <Input id="address" name="address" defaultValue={profile.address} placeholder="Jl. Contoh No. 123" />
                </div>

                <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
