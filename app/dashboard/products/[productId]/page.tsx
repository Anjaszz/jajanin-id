import { getProduct } from '@/app/actions/seller-products'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, Pencil, ShoppingBag, Layers, Plus, Trash2, LayoutGrid, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const product = await getProduct(productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="rounded-xl font-bold text-slate-500 hover:text-slate-900">
          <Link href="/dashboard/products">
            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-xl border-slate-200 font-bold">
             <Link href={`/dashboard/products/edit/${product.id}`}>
               <Pencil className="mr-2 h-4 w-4" /> Edit Produk
             </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery / Image Area */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none shadow-2xl rounded-[32px] bg-slate-100 aspect-square group">
             {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="h-20 w-20" />
                </div>
             )}
          </Card>
          
          {/* Sub images if any */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: string, i: number) => (
                <div key={i} className="h-20 w-20 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer">
                   <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                  {product.is_active ? 'Produk Aktif' : 'Draft / Nonaktif'}
               </span>
               <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                  ID: {product.id.slice(0, 8)}
               </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-black text-primary mt-2">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-3xl space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <LayoutGrid className="h-4 w-4 text-slate-400" />
                   <span className="text-xs font-bold text-slate-500">Kategori</span>
                </div>
                <span className="text-xs font-black text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">
                   {product.category?.name || 'Umum'}
                </span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Tag className="h-4 w-4 text-slate-400" />
                   <span className="text-xs font-bold text-slate-500">Stok Saat Ini</span>
                </div>
                <span className="text-xs font-black text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">
                   {product.stock} Unit
                </span>
             </div>
          </div>

          <div className="space-y-3">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Rincian Produk
             </h3>
             <p className="text-slate-600 leading-relaxed text-sm bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[100px]">
                {product.description || 'Tidak ada deskripsi untuk produk ini.'}
             </p>
          </div>
        </div>
      </div>

      {/* Variants & Addons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variants */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="font-black text-sm uppercase tracking-widest">Varian Produk</h3>
             </div>
             <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {product.product_variants?.length || 0}
             </span>
          </div>
          <CardContent className="p-4">
             {product.product_variants && product.product_variants.length > 0 ? (
               <div className="space-y-2">
                 {product.product_variants.map((v: any) => (
                   <div key={v.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                      <span className="text-sm font-bold text-slate-700">{v.name}</span>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-black text-primary">
                            {v.price_override ? formatCurrency(v.price_override) : 'Harga Normal'}
                         </span>
                         <span className="text-[10px] font-bold text-slate-400">Stok: {v.stock}</span>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-10 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-400 italic">Produk ini tidak memiliki varian.</p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Addons */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-500" />
                <h3 className="font-black text-sm uppercase tracking-widest">Tambahan / Add-ons</h3>
             </div>
             <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {product.product_addons?.length || 0}
             </span>
          </div>
          <CardContent className="p-4">
             {product.product_addons && product.product_addons.length > 0 ? (
               <div className="space-y-2">
                 {product.product_addons.map((a: any) => (
                   <div key={a.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-orange-200 transition-all">
                      <span className="text-sm font-bold text-slate-700">{a.name}</span>
                      <span className="text-xs font-black text-orange-600">+{formatCurrency(a.price)}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-10 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-400 italic">Produk ini tidak memiliki add-ons.</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
