import { getBuyerProfile, updateBuyerProfile } from "@/app/actions/buyer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save } from "lucide-react";

export default async function BuyerProfilePage() {
  const profile = await getBuyerProfile() as any;

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
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
