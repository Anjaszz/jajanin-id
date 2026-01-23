import { getBuyerProfile, updateBuyerProfile } from "@/app/actions/buyer";
import { getBuyerWallet, getWalletTransactions } from "@/app/actions/wallet";
import { getCurrentUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, LogOut } from "lucide-react";
import Link from "next/link";
import { signOutBuyer } from "@/app/actions/auth";

import { WithdrawModal } from "./withdraw-modal";

export default async function BuyerProfilePage() {
  const user = await getCurrentUser();
  const profile = await getBuyerProfile() as any;
  const wallet = user ? await getBuyerWallet(user.id) : null;
  const transactions = user ? await getWalletTransactions(user.id) : [];

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

      <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <User className="w-32 h-32" />
        </div>
        <CardHeader className="flex flex-row items-start justify-between">
           <div>
               <CardTitle className="text-primary-foreground/90">Saldo Saya</CardTitle>
               <div className="flex items-baseline gap-1 mt-2">
                 <span className="text-sm font-medium opacity-80">Rp</span>
                 <span className="text-4xl font-extrabold tracking-tight">
                   {(wallet as any)?.balance?.toLocaleString('id-ID') || 0}
                 </span>
               </div>
           </div>
           <div className="z-10">
              <WithdrawModal balance={(wallet as any)?.balance || 0} />
           </div>
        </CardHeader>
        <CardContent>
           <p className="text-xs opacity-70">Saldo dapat digunakan untuk berbelanja di semua toko.</p>
        </CardContent>
        {transactions && transactions.length > 0 && (
           <CardFooter className="bg-black/10 p-4 block">
              <p className="text-xs font-bold mb-3 opacity-80 uppercase tracking-widest">Riwayat Transaksi</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {transactions.map((tx: any) => (
                   <div key={tx.id} className="flex justify-between items-center text-sm p-2 bg-white/10 rounded-lg">
                      <div className="flex flex-col">
                         <span className="font-bold">{tx.description || tx.type}</span>
                         <span className="text-[10px] opacity-70">{new Date(tx.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <span className={`font-bold ${tx.amount > 0 ? 'text-green-300' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('id-ID')}
                      </span>
                   </div>
                ))}
              </div>
           </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
             <CardTitle>Informasi Pribadi</CardTitle>
             <CardDescription>Update data diri untuk kemudahan pengiriman.</CardDescription>
        </CardHeader>
        <CardContent>
            <form id="profile-form" action={updateBuyerProfile as any} className="space-y-4">
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
            </form>
        </CardContent>
        <CardFooter className="pt-0">
            <Button type="submit" form="profile-form" className="w-full">
                <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
            </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
        <CardHeader>
             <CardTitle className="text-destructive">Keluar Dari Akun</CardTitle>
        </CardHeader>
        <CardContent>
            <form action={signOutBuyer as any}>
                <Button variant="destructive" className="w-full font-bold text-white">
                    <LogOut className="h-4 w-4 mr-2" /> Keluar
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
