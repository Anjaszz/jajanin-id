import { getAllProductsAdmin } from "@/app/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Package, ChevronLeft, ChevronRight, Eye, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageStr, search: searchStr } = await searchParams;
  const page = Number(pageStr) || 1;
  const search = searchStr || "";
  const limit = 10;
  
  const { data: products, total } = await getAllProductsAdmin(page, limit, search);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Master Produk</h1>
           <p className="text-muted-foreground">
             Kelola semua produk yang terdaftar di platform.
           </p>
        </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                 <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Daftar Produk
                 </CardTitle>
                 <CardDescription className="mt-1">
                    {search 
                      ? `Hasil pencarian: "${search}" (${total} ditemukan)`
                      : `Menampilkan produk ${((page - 1) * limit) + 1} - ${Math.min(page * limit, total)} dari total ${total} produk.`
                    }
                 </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search Form */}
                  <form className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      name="search"
                      placeholder="Cari Produk atau Toko..."
                      className="pl-9 w-full rounded-xl bg-muted/30"
                      defaultValue={search}
                    />
                  </form>
                  
                  {/* Top Pagination */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      asChild={page > 1}
                      className="h-9 w-9"
                    >
                      {page > 1 ? (
                        <Link href={`/admin/products?page=${page - 1}&search=${search}`}>
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous</span>
                        </Link>
                      ) : (
                         <span className="flex items-center justify-center">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                         </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= totalPages}
                      asChild={page < totalPages}
                      className="h-9 w-9"
                    >
                      {page < totalPages ? (
                        <Link href={`/admin/products?page=${page + 1}&search=${search}`}>
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next</span>
                        </Link>
                      ) : (
                        <span className="flex items-center justify-center">
                           <ChevronRight className="h-4 w-4" />
                           <span className="sr-only">Next</span>
                        </span>
                      )}
                    </Button>
                  </div>
              </div>
           </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Toko</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {products.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        {search ? "Produk tidak ditemukan." : "Belum ada produk yang terdaftar."}
                    </TableCell>
                    </TableRow>
                ) : (
                    products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span>{product.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{product.id.slice(0, 8)}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {product.shop?.name || "-"}
                        </TableCell>
                        <TableCell>
                            {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell>
                            {product.stock}
                        </TableCell>
                        <TableCell>
                          <Badge
                              variant={product.is_active ? "default" : "secondary"}
                              className={product.is_active ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"}
                          >
                              {product.is_active ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                             {/* Future: Add View Detail or Edit actions */}
                             <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/products/${product.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                             </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
             Halaman {page} dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/admin/products?page=${page - 1}&search=${search}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/admin/products?page=${page + 1}&search=${search}`}>
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <span>
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </span>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
