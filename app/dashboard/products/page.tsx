
import Link from 'next/link'
import { getSellerProducts, deleteProduct } from '@/app/actions/seller-products'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

export default async function ProductsPage() {
  const { data: products, count } = await getSellerProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Produk Saya</h1>
            <p className="text-muted-foreground">Kelola katalog produk toko Anda.</p>
         </div>
         <Button asChild>
            <Link href="/dashboard/products/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Produk
            </Link>
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
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/products/edit/${product.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <form action={async () => {
                                                'use server'
                                                await deleteProduct(product.id)
                                            }}>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                     <Trash2 className="h-4 w-4" />
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
