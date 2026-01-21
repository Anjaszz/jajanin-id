
"use client";

import { useState, useEffect, use } from "react";
import { getAdminUserDetail, updateAdminUserProfile } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, User as UserIcon, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminUserEditPage({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  const { userId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    shop: {
      id: "",
      name: "",
      address: "",
      whatsapp: ""
    }
  });

  useEffect(() => {
    async function loadUser() {
      const data = await getAdminUserDetail(userId);
      if (data) {
        setIsSeller(data.profile.role === 'seller');
        setFormData({
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            address: data.profile.address || "",
            shop: data.profile.shops?.[0] ? {
              id: data.profile.shops[0].id,
              name: data.profile.shops[0].name || "",
              address: data.profile.shops[0].address || "",
              whatsapp: data.profile.shops[0].whatsapp || ""
            } : { id: "", name: "", address: "", whatsapp: "" }
        });
      }
      setLoading(false);
    }
    loadUser();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    // Prepare data to send (remove shop if not seller or no shop id)
    const submitData = {
      ...formData,
      shop: isSeller && formData.shop.id ? formData.shop : undefined
    };

    const updatePromise = updateAdminUserProfile(userId, submitData);
    
    toast.promise(updatePromise, {
      loading: 'Sedang menyimpan perubahan...',
      success: (result) => {
        if (result.success) {
          setTimeout(() => {
            router.push("/admin/users");
            router.refresh();
          }, 1000);
          return "Profil pengguna berhasil diperbarui";
        } else {
          setSaving(false);
          throw new Error(result.error || "Gagal memperbarui profil");
        }
      },
      error: (err) => {
        setSaving(false);
        return err.message || "Gagal memperbarui profil";
      },
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-muted-foreground font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900">
             Edit <span className="text-blue-600">Pengguna</span>
          </h1>
          <p className="text-muted-foreground">Perbarui informasi akun dan toko pengguna.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Profile Card */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white pb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle>Data Profil</CardTitle>
                <CardDescription className="text-slate-400">ID: {userId}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-xl h-12 focus-visible:ring-blue-500" 
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="rounded-xl h-12 focus-visible:ring-blue-500" 
                  placeholder="0812..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-xl h-12 focus-visible:ring-blue-500" 
                placeholder="email@contoh.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="rounded-2xl min-h-[100px] focus-visible:ring-blue-500 p-4" 
                placeholder="Masukkan alamat tinggal pengguna..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Shop Info Card (Only for Sellers) */}
        {isSeller && formData.shop.id && (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-600 text-white pb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Data Toko</CardTitle>
                  <CardDescription className="text-blue-100">Kelola informasi bisnis penjual.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Nama Toko</Label>
                  <Input 
                    id="shop_name" 
                    value={formData.shop.name}
                    onChange={(e) => setFormData({
                      ...formData, 
                      shop: {...formData.shop, name: e.target.value}
                    })}
                    className="rounded-xl h-12 focus-visible:ring-blue-500" 
                    placeholder="Masukkan nama toko"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop_whatsapp">WhatsApp Toko</Label>
                  <Input 
                    id="shop_whatsapp" 
                    value={formData.shop.whatsapp}
                    onChange={(e) => setFormData({
                      ...formData, 
                      shop: {...formData.shop, whatsapp: e.target.value}
                    })}
                    className="rounded-xl h-12 focus-visible:ring-blue-500" 
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_address">Alamat Toko</Label>
                <Textarea 
                  id="shop_address" 
                  value={formData.shop.address}
                  onChange={(e) => setFormData({
                    ...formData, 
                    shop: {...formData.shop, address: e.target.value}
                  })}
                  className="rounded-2xl min-h-[100px] focus-visible:ring-blue-500 p-4" 
                  placeholder="Masukkan alamat fisik toko..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 pt-4">
           <Button variant="outline" type="button" asChild className="rounded-xl px-8 h-12">
              <Link href="/admin/users">Batal</Link>
           </Button>
           <Button type="submit" disabled={saving} className="rounded-xl px-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-lg font-bold">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Simpan Semua Perubahan
                </>
              )}
           </Button>
        </div>
      </form>
    </div>
  );
}
