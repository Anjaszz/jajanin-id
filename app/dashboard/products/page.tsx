import Link from 'next/link'
import { getSellerProducts, deleteProduct } from '@/app/actions/seller-products'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Pencil, Trash2, ShieldOff } from 'lucide-react'
import { getShop } from '@/app/actions/shop'
import { cn } from '@/lib/utils'

export default async function ProductsPage() {
  const { data: products, count } = await getSellerProducts()
  const shop = await getShop()
  const isDeactivated = shop?.is_active === false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div>
               <h1 className="text-3xl font-heading font-bold tracking-tight">Produk Saya</h1>
               <p className="text-muted-foreground">Kelola katalog produk toko Anda.</p>
            </div>
            {isDeactivated && (
               <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 animate-pulse">
                  <ShieldOff className="h-3 w-3" /> Fitur Dibatasi
               </div>
            )}
         </div>
         <Button asChild disabled={isDeactivated} variant={isDeactivated ? "outline" : "default"}>
            {isDeactivated ? (
               <span className="flex items-center gap-2 opacity-50">
                  <PlusCircle className="h-4 w-4" /> Tambah Produk
               </span>
            ) : (
               <Link href="/dashboard/products/create">
                   <PlusCircle className="mr-2 h-4 w-4" />
                   Tambah Produk
               </Link>
            )}
         </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Daftar Produk ({count})</CardTitle>
            <CardDescription>Semua produk yang aktif dan non-aktif.</CardDescription>
        </CardHeader>
        <CardContent>
            {products && products.length > 0 ? (
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Nama Produk</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Harga</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Stok</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {products.map((product) => (
                                <tr key={product.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle">Rp {product.price.toLocaleString('id-ID')}</td>
                                    <td className="p-4 align-middle">{product.stock}</td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex items-center justify-end gap-2">
                                             <Button variant="ghost" size="icon" asChild disabled={isDeactivated}>
                                                 {isDeactivated ? (
                                                     <Pencil className="h-4 w-4 opacity-30" />
                                                 ) : (
                                                     <Link href={`/dashboard/products/edit/${product.id}`}>
                                                         <Pencil className="h-4 w-4" />
                                                     </Link>
                                                 )}
                                             </Button>
                                             <form action={isDeactivated ? undefined : (async () => {
                                                 'use server'
                                                 await deleteProduct(product.id)
                                             }) as any}>
                                                 <Button 
                                                     variant="ghost" 
                                                     size="icon" 
                                                     className="text-destructive hover:text-destructive"
                                                     disabled={isDeactivated}
                                                 >
                                                      <Trash2 className={cn("h-4 w-4", isDeactivated && "opacity-30")} />
                                                 </Button>
                                             </form>
                                         </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <PlusCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">Belum ada produk</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                        Mulai tambahkan produk pertama Anda untuk dilihat oleh calon pembeli.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/products/create">Tambah Produk Sekarang</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
