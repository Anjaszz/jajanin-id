'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, MapPin, Store } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { isShopOpen } from '@/lib/shop-status'

export default function ShopsList({ initialShops }: { initialShops: any[] }) {
  const [search, setSearch] = useState('')
  
  const filteredShops = initialShops
    .filter(shop => isShopOpen(shop).isOpen)
    .filter(shop => 
      shop.name.toLowerCase().includes(search.toLowerCase()) ||
      (shop.description && shop.description.toLowerCase().includes(search.toLowerCase())) ||
      (shop.address && shop.address.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <div className="space-y-12">
      {/* Search Section */}
      <section className="relative overflow-hidden py-12 border-b bg-muted/30 -mx-4 px-4 md:-mx-6 md:px-6">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-10 w-96 h-96 bg-primary rounded-full blur-[120px]" />
         </div>

         <div className="container px-0 space-y-4">
            <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight">Semua Toko</h1>
            <p className="text-muted-foreground max-w-2xl text-lg font-medium">
               Jelajahi berbagai toko pilihan yang menyediakan jajanan terbaik untuk Anda.
            </p>
            
            <div className="max-w-md relative group mt-8">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                  type="search" 
                  placeholder="Cari toko favorit..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border shadow-sm pl-10 rounded-2xl h-12 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" 
               />
            </div>
         </div>
      </section>

      {/* Shop Grid */}
      <section className="container px-0 pb-12">
         {filteredShops.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {filteredShops.map((shop) => (
               <Link key={shop.id} href={`/${shop.slug}`} className="group block">
                 <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card group-hover:-translate-y-2 relative">
                   <div className="aspect-4/3 w-full relative bg-muted overflow-hidden">
                     {shop.cover_url ? (
                       <img 
                         src={shop.cover_url} 
                         alt={shop.name} 
                         className={cn(
                           "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700",
                           !isShopOpen(shop).isOpen && "grayscale opacity-80"
                         )} 
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                         <ShoppingBag className="h-12 w-12 text-primary/10" />
                       </div>
                     )}
                     
                     {/* Status Badge */}
                     <div className="absolute top-4 right-4 z-10">
                        {(() => {
                           const status = isShopOpen(shop);
                           return (
                              <div className={cn(
                                 "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border",
                                 status.isOpen 
                                    ? "bg-green-500/90 text-white border-green-400" 
                                    : "bg-destructive/90 text-white border-destructive/40"
                              )}>
                                 {status.isOpen ? "Buka" : "Tutup"}
                              </div>
                           );
                        })()}
                     </div>

                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                       <div className="scale-90 group-hover:scale-100 transition-transform duration-500">
                         <Button size="sm" className="rounded-full font-black text-xs uppercase h-10 px-6 shadow-2xl">
                           Lihat Menu
                         </Button>
                       </div>
                     </div>
                   </div>
                   <CardContent className="p-6 relative">
                      <div className="absolute -top-10 left-6 h-14 w-14 rounded-2xl border-[3px] border-card bg-white shadow-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                         {shop.logo_url ? (
                            <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                         ) : (
                            <Store className="h-7 w-7 text-primary/20" />
                         )}
                      </div>
                      
                      <div className="mt-6 space-y-2">
                         <h3 className="font-heading font-black text-xl tracking-tight leading-none group-hover:text-primary transition-colors">{shop.name}</h3>
                         <p className="text-sm text-muted-foreground line-clamp-2 min-h-10 leading-relaxed">
                           {shop.description || "Temukan jajanan favoritmu hanya di toko ini dengan kualitas premium."}
                         </p>
                      </div>

                      {shop.address && (
                         <div className="mt-4 pt-4 border-t flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate">{shop.address}</span>
                         </div>
                      )}
                   </CardContent>
                 </Card>
               </Link>
             ))}
           </div>
         ) : (
           <div className="text-center py-32 bg-muted/30 rounded-[40px] border-2 border-dashed border-primary/10">
             <Store className="h-16 w-16 mx-auto text-primary/20 mb-6" />
             <h3 className="text-2xl font-black">Toko Tidak Ditemukan</h3>
             <p className="text-muted-foreground max-w-sm mx-auto mt-2">Maaf, kami tidak menemukan toko dengan kata kunci "{search}".</p>
             <Button onClick={() => setSearch('')} variant="link" className="mt-4 font-bold text-primary">
                Hapus Pencarian
             </Button>
           </div>
         )}
      </section>
    </div>
  )
}
