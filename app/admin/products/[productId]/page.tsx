import { getAdminProductById } from "@/app/actions/admin";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Package, Store, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProductActions } from "@/components/admin/admin-product-actions";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Produk</h1>
          <p className="text-muted-foreground text-sm">
            #{product.id.slice(0, 8)} • Terdaftar pada{" "}
            {new Date(product.created_at).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge
             variant={product.is_active ? "default" : "secondary"}
             className={product.is_active ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 text-base px-4 py-1" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 text-base px-4 py-1"}
          >
             {product.is_active ? "Aktif" : "Non-Aktif"}
          </Badge>
          <AdminProductActions productId={product.id} isActive={product.is_active} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Product Image & Basic Info */}
         <Card className="md:row-span-2">
            <CardHeader>
               <CardTitle>Foto Produk</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="aspect-square w-full rounded-lg bg-muted overflow-hidden border">
                  {product.image_url ? (
                     <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Package className="h-12 w-12" />
                        <span>Tidak ada foto</span>
                     </div>
                  )}
               </div>
            </CardContent>
         </Card>

         {/* General Info */}
         <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informasi Umum
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <span className="text-sm font-medium text-muted-foreground">Nama Produk</span>
                  <p className="font-semibold text-lg">{product.name}</p>
               </div>
               <div>
                  <span className="text-sm font-medium text-muted-foreground">Deskripsi</span>
                  <p className="whitespace-pre-wrap text-sm">{product.description || "-"}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <span className="text-sm font-medium text-muted-foreground">Harga</span>
                     <p className="font-bold text-lg">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-muted-foreground">Stok</span>
                     <p className="font-bold text-lg">{product.stock}</p>
                  </div>
               </div>
               <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                     <Tag className="h-3 w-3" /> Kategori
                  </span>
                  <p className="font-medium">{product.category?.name || "Uncategorized"}</p>
               </div>
            </CardContent>
         </Card>

         {/* Shop Info */}
         <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Informasi Toko
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <span className="text-sm font-medium text-muted-foreground">Nama Toko</span>
                  <p className="font-semibold">{product.shop?.name}</p>
               </div>
               <div>
                  <span className="text-sm font-medium text-muted-foreground">Alamat Toko</span>
                  <p className="text-sm">{product.shop?.address}</p>
               </div>
               <div className="pt-2">
                  <Button size="sm" variant="outline" asChild>
                     <a href={`https://wa.me/${product.shop?.whatsapp}`} target="_blank">
                        Hubungi Toko
                     </a>
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
      
      {/* Admin Note if Inactive */}
      {!product.is_active && product.admin_note && (
         <Card className="border-red-200 bg-red-50">
           <CardHeader>
             <CardTitle className="text-red-800 text-lg">Alasan Penonaktifan</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-red-700">{product.admin_note}</p>
           </CardContent>
         </Card>
      )}

    </div>
  );
}
