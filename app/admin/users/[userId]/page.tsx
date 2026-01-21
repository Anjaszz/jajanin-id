
"use client";

import { use } from "react";
import { getAdminUserDetail, deleteUser, toggleShopStatus } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Mail, Phone, MapPin, Calendar, Store, ArrowLeft, 
  ShoppingBag, Clock, Trash2, ShieldOff, Power, PowerOff,
  AlertTriangle, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUserDetailPage({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  const { userId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getAdminUserDetail(userId);
      if (!result) return notFound();
      setData(result);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      <p className="text-slate-500 font-medium">Memuat detail pengguna...</p>
    </div>
  );

  const { profile, orders } = data;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Menunggu Bayar'
      case 'pending_confirmation': return 'Perlu Konfirmasi'
      case 'paid': return 'Sudah Dibayar'
      case 'accepted': return 'Diterima'
      case 'processing': return 'Sedang Proses'
      case 'ready': return 'Siap Diambil'
      case 'completed': return 'Selesai'
      case 'rejected': return 'Ditolak'
      case 'cancelled': return 'Dibatalkan'
      default: return status.replace('_', ' ')
    }
  }

  async function handleDeleteUser() {
    setProcessing(true);
    const res = await deleteUser(userId);
    if (res.success) {
      toast.success("Akun pengguna berhasil dihapus");
      router.push("/admin/users");
    } else {
      toast.error(res.error || "Gagal menghapus pengguna");
      setProcessing(false);
    }
  }

  async function handleToggleShop(isActive: boolean) {
    setProcessing(true);
    const res = await toggleShopStatus(profile.shops[0].id, isActive);
    if (res.success) {
      toast.success(isActive ? "Toko berhasil diaktifkan" : "Toko berhasil dinonaktifkan");
      const updated = await getAdminUserDetail(userId);
      setData(updated);
    } else {
      toast.error(res.error || "Gagal mengubah status toko");
    }
    setProcessing(false);
  }


  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900">
               Detail <span className="text-blue-600">Pengguna</span>
            </h1>
            <p className="text-muted-foreground">ID: {userId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" asChild className="rounded-xl border-slate-200">
              <Link href={`/admin/users/${userId}/edit`}>Edit Profil</Link>
           </Button>
           
           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button variant="destructive" className="rounded-xl shadow-lg shadow-red-100 uppercase text-[10px] font-black tracking-widest px-6">
                 <Trash2 className="h-4 w-4 mr-2" />
                 Hapus Akun
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
               <AlertDialogHeader>
                 <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                 </div>
                 <AlertDialogTitle className="text-2xl font-black">Hapus Akun Pengguna?</AlertDialogTitle>
                 <AlertDialogDescription className="text-slate-500">
                   Tindakan ini tidak dapat dibatalkan. Semua data profil, riwayat pesanan, dan toko yang terkait akan dihapus secara permanen dari sistem.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="mt-6 gap-2">
                 <AlertDialogCancel className="rounded-xl border-slate-200">Batal</AlertDialogCancel>
                 <AlertDialogAction 
                  onClick={handleDeleteUser}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-none font-bold"
                 >
                   Ya, Hapus Permanen
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-md overflow-hidden h-fit rounded-[2.5rem]">
            <div className={`h-24 ${profile.role === 'seller' ? 'bg-blue-600' : 'bg-slate-900'}`} />
            <CardContent className="relative pt-0 px-6 pb-8">
                <div className="flex justify-center">
                <div className="h-24 w-24 rounded-3xl bg-white p-1 -mt-12 shadow-lg">
                    <div className="h-full w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="h-12 w-12" />
                    </div>
                </div>
                </div>
                
                <div className="text-center mt-4 space-y-1">
                <h2 className="text-2xl font-bold">{profile.name || 'No Name'}</h2>
                <Badge variant="secondary" className={`rounded-full uppercase text-[10px] font-bold ${profile.role === 'seller' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {profile.role}
                </Badge>
                </div>

                <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs leading-relaxed">{profile.address || 'Alamat belum diatur'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm pt-4 border-t">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground italic">Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Shop Info (If Seller) */}
          {profile.role === 'seller' && (
            <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <div>
                  <CardTitle className="text-xl">Manajemen Toko</CardTitle>
                  <CardDescription>Kelola status operasional toko penjual.</CardDescription>
                </div>
                <Store className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-6">
                {profile.shops && profile.shops.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase ${profile.shops[0].is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {profile.shops[0].is_active ? 'Aktif' : 'Non-Aktif'}
                        </div>
                        <div className="h-20 w-20 rounded-2xl bg-white border flex items-center justify-center overflow-hidden shadow-sm">
                        {profile.shops[0].logo_url ? (
                            <img src={profile.shops[0].logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Store className="h-10 w-10 text-slate-300" />
                        )}
                        </div>
                        <div className="flex-1">
                        <h4 className="font-bold text-xl">{profile.shops[0].name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{profile.shops[0].address}</p>
                        <div className="flex gap-4 mt-3">
                            <Link href={`/${profile.shops[0].slug}`} className="text-xs font-bold text-blue-600 hover:underline">Kunjungi Toko</Link>
                        </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button 
                            variant={profile.shops[0].is_active ? "outline" : "default"}
                            onClick={() => handleToggleShop(!profile.shops[0].is_active)}
                            disabled={processing}
                            className={`rounded-2xl h-14 font-bold w-full ${profile.shops[0].is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                            {profile.shops[0].is_active ? (
                                <><PowerOff className="mr-2 h-4 w-4" /> Nonaktifkan Toko</>
                            ) : (
                                <><Power className="mr-2 h-4 w-4" /> Aktifkan Toko</>
                            )}
                        </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed text-slate-400">
                    <Store className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">User ini belum memiliki toko.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Info (Orders as Buyer) */}
          <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-xl">Riwayat Transaksi</CardTitle>
                <CardDescription>Aktivitas belanja pengguna sebagai pembeli.</CardDescription>
              </div>
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-6">
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div key={order.id} className="p-4 rounded-2xl border bg-white flex items-center justify-between hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                          <CheckCircle2 className="h-6 w-6 text-slate-300 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.shops?.name || 'Toko'}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">{formatCurrency(order.total_amount)}</p>
                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-tighter py-0 h-5 border-slate-200">
                            {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed text-slate-400">
                   <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-20" />
                   <p className="font-medium">Belum ada riwayat transaksi.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
