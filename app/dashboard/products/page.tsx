import Link from 'next/link'
import { getSellerProducts } from '@/app/actions/seller-products'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Pencil, ShieldOff, Eye, ShoppingBag, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getShop } from '@/app/actions/shop'
import { cn } from '@/lib/utils'
import { ToggleProductStatusButton } from '@/components/dashboard/toggle-product-status-button'
import { DeleteProductButton } from '@/components/dashboard/delete-product-button'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q = "", page = "1" } = await searchParams
  const currentPage = parseInt(page)
  const limit = 10
  
  const { data: products, count = 0 } = await getSellerProducts(currentPage, limit, q)
  const shop = await getShop()
  const isShopDeactivated = shop?.is_active === false
  
  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
               Produk <span className="text-primary italic">Saya</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-lg font-medium mt-1">Kelola katalog dan status tampilan produk Anda.</p>
         </div>
         <Button asChild disabled={isShopDeactivated} size="lg" className="rounded-2xl h-14 px-8 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            {isShopDeactivated ? (
               <span className="flex items-center gap-3 opacity-50">
                  <PlusCircle className="h-5 w-5" /> Tambah Produk
               </span>
            ) : (
               <Link href="/dashboard/products/create">
                   <PlusCircle className="mr-3 h-5 w-5" />
                   Tambah Produk
               </Link>
            )}
         </Button>
      </div>

      {isShopDeactivated && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
           <ShieldOff className="h-5 w-5 shrink-0" />
           <p>Toko Anda sedang dinonaktifkan. Fitur pengelolaan produk dibatasi sementara.</p>
        </div>
      )}

      {/* Search Bar */}
      <form method="GET" className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          name="q"
          defaultValue={q}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
          placeholder="Cari nama produk atau deskripsi..."
        />
        <input type="hidden" name="page" value="1" />
      </form>

      {products && products.length > 0 ? (
          <div className="space-y-4">
              <div className="grid gap-4">
                  {products.map((product) => (
                      <Card key={product.id} className={cn(
                        "overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group rounded-3xl bg-white",
                        !product.is_active && "bg-slate-50 opacity-80"
                      )}>
                          <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row items-center">
                                  {/* Product Image & Basic Info */}
                                  <div className="p-4 flex-1 flex items-center gap-4 w-full">
                                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                          {product.image_url ? (
                                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                  <ShoppingBag className="h-8 w-8" />
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                              <h3 className="font-black text-base sm:text-lg text-slate-900 truncate tracking-tight">{product.name}</h3>
                                              {product.is_active ? (
                                                  <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Aktif</span>
                                              ) : (
                                                  <span className="bg-slate-200 text-slate-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Draft</span>
                                              )}
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <p className="text-primary font-black text-sm">Rp {product.price.toLocaleString('id-ID')}</p>
                                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                                              <p className="text-slate-400 text-xs font-bold">Stok: <span className="text-slate-600">{product.stock}</span></p>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Actions Section */}
                                  <div className="bg-slate-50/50 md:bg-transparent p-4 flex items-center justify-between md:justify-end gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100">
                                      <div className="flex items-center gap-2">
                                          <Button variant="outline" size="sm" asChild className="rounded-xl h-10 px-4 font-bold text-xs border-slate-200 bg-white hover:bg-slate-50">
                                              <Link href={`/dashboard/products/${product.id}`}>
                                                  <Eye className="h-4 w-4 mr-2" /> Detail
                                              </Link>
                                          </Button>
                                          
                                          <Button variant="outline" size="icon" asChild disabled={isShopDeactivated} className="rounded-xl h-10 w-10 border-slate-200 bg-white hover:text-primary transition-all">
                                            <Link href={`/dashboard/products/edit/${product.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                          </Button>

                                          <ToggleProductStatusButton 
                                            productId={product.id}
                                            isActive={!!product.is_active}
                                            isShopDeactivated={isShopDeactivated}
                                          />

                                          <DeleteProductButton 
                                            productId={product.id}
                                            productName={product.name}
                                            disabled={isShopDeactivated}
                                          />
                                      </div>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mt-6">
                  <p className="text-xs font-bold text-slate-500">
                    Halaman <span className="text-slate-900">{currentPage}</span> dari <span className="text-slate-900">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {currentPage > 1 && (
                      <Button variant="outline" size="sm" asChild className="rounded-xl h-10 border-slate-200">
                        <Link href={`?q=${q}&page=${currentPage - 1}`}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> Sebelum
                        </Link>
                      </Button>
                    )}
                    {currentPage < totalPages && (
                      <Button variant="outline" size="sm" asChild className="rounded-xl h-10 border-slate-200">
                        <Link href={`?q=${q}&page=${currentPage + 1}`}>
                          Berikut <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
          </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-xs">
              <div className="rounded-full bg-slate-50 p-8 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Produk Tidak Ditemukan</h3>
              <p className="text-slate-400 max-w-sm mb-8 font-medium">
                  {q ? `Tidak ada hasil untuk pencarian "${q}". Coba kata kunci lain.` : "Yuk, mulai tambahkan produk pertama Anda agar pelanggan bisa berbelanja di toko Anda."}
              </p>
              {q ? (
                <Button asChild variant="outline" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest">
                  <Link href="/dashboard/products">Reset Pencarian</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                    <Link href="/dashboard/products/create">Tambah Produk Sekarang</Link>
                </Button>
              )}
          </div>
      )}
    </div>
  )
}
