'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, Plus, Minus, MapPin, Instagram, Facebook, Clock, X, ChevronLeft, User, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  description: string | null
  image_url: string | null
  images: string[] | null
  stock: number
  product_variants?: {
    id: string
    name: string
    price_override: number | null
    stock: number
  }[]
  product_addons?: {
    id: string
    name: string
    price: number
  }[]
}

interface CategoryWithProducts {
  id: string
  name: string
  products: Product[]
}

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  google_maps_link: string | null
  logo_url: string | null
  cover_url: string | null
  social_links: any
}

export default function ShopClient({ shop, categories, isLoggedIn }: { shop: Shop, categories: CategoryWithProducts[], isLoggedIn?: boolean }) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (selectedProduct) {
        setSelectedVariant(null)
        setSelectedAddons([])
    }
  }, [selectedProduct])

  // Load cart from session storage? Maybe later. For now just state.
  
  const addToCart = (productId: string, variantId?: string, addonIds: string[] = []) => {
    const addonPart = addonIds.length > 0 ? `:${addonIds.sort().join(',')}` : ''
    const key = variantId ? `${productId}:${variantId}${addonPart}` : `${productId}:base${addonPart}`
    
    setCart(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }))
  }

  const removeFromCart = (productId: string, variantId?: string, addonIds: string[] = []) => {
    const addonPart = addonIds.length > 0 ? `:${addonIds.sort().join(',')}` : ''
    const key = variantId ? `${productId}:${variantId}${addonPart}` : `${productId}:base${addonPart}`
    
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[key] > 1) {
        newCart[key] -= 1
      } else {
        delete newCart[key]
      }
      return newCart
    })
  }

  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0)
  const cartTotal = Object.entries(cart).reduce((sum, [key, count]) => {
    const [productId, variantId, addonIdsRaw] = key.split(':')
    const product = categories.flatMap(c => c.products).find(p => p.id === productId)
    if (!product) return sum
    
    let price = product.price
    if (variantId && variantId !== 'base' && product.product_variants) {
        const variant = product.product_variants.find(v => v.id === variantId)
        if (variant && variant.price_override !== null) {
            price = variant.price_override
        }
    }

    // Add Addons to price
    if (addonIdsRaw && product.product_addons) {
        const addonIds = addonIdsRaw.split(',')
        const addonsPrice = product.product_addons
            .filter(a => addonIds.includes(a.id))
            .reduce((total, a) => total + a.price, 0)
        price += addonsPrice
    }
    
    return sum + (price * count)
  }, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-muted/5 pb-32">
      {/* Shop Header */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {shop.cover_url ? (
          <img src={shop.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-primary/20 to-primary/10" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="container max-w-4xl px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-background bg-muted overflow-hidden -mt-20 shadow-lg">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <ShoppingBag className="h-10 w-10" />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-heading font-bold">{shop.name}</h1>
            {shop.description && <p className="text-muted-foreground text-sm max-w-md">{shop.description}</p>}
          </div>

          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href={`/${shop.slug}/orders`}>
                   <Clock className="h-4 w-4 mr-2" />
                   Pesanan Saya
                </Link>
             </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {shop.address && (
              <a 
                href={shop.google_maps_link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" />
                {shop.address}
              </a>
            )}
            
            <div className="flex items-center gap-3">
              {shop.social_links?.instagram && (
                <a href={shop.social_links.instagram} className="p-1 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
              )}
              {shop.social_links?.facebook && (
                <a href={shop.social_links.facebook} className="p-1 hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="container max-w-4xl px-4 py-8 space-y-12">
        {categories.map((category) => (
          <section key={category.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-xl font-heading font-bold uppercase tracking-wider">{category.name}</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {category.products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden group hover:shadow-xl transition-all duration-300 border bg-card flex flex-col relative cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product)
                    setActiveImageIndex(0)
                  }}
                >
                  {/* Image Header */}
                  <div className="aspect-square w-full relative overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                         <ShoppingBag className="h-12 w-12" />
                      </div>
                    )}
                    
                    {/* Floating Add Button for quick access */}
                    {(() => {
                        const hasOptions = (product.product_variants && product.product_variants.length > 0) || 
                                         (product.product_addons && product.product_addons.length > 0)
                        const isInCart = Object.keys(cart).some(key => key.startsWith(`${product.id}:`))

                        if (isInCart) return null

                        return (
                          <Button
                            size="icon"
                            className="absolute bottom-3 right-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (hasOptions) {
                                setSelectedProduct(product)
                                setActiveImageIndex(0)
                              } else {
                                addToCart(product.id)
                              }
                            }}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        )
                    })()}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3 border-t">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-heading font-bold text-sm md:text-base leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-medium bg-muted w-fit px-2 py-0.5 rounded-full text-nowrap">Stok: {product.stock}</p>
                      </div>

                      {/* Variants Preview on Card */}
                      {product.product_variants && product.product_variants.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.product_variants.slice(0, 3).map(v => (
                            <span key={v.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                              {v.name}
                            </span>
                          ))}
                          {product.product_variants.length > 3 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                              +{product.product_variants.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <p className="text-primary font-black text-lg md:text-xl">
                        {product.product_variants && product.product_variants.length > 0 
                          ? `Mulai Rp ${Math.min(...product.product_variants.map(v => v.price_override ?? product.price)).toLocaleString('id-ID')}`
                          : `Rp ${product.price.toLocaleString('id-ID')}`
                        }
                      </p>
                      
                      {(() => {
                        const hasOptions = (product.product_variants && product.product_variants.length > 0) || 
                                          (product.product_addons && product.product_addons.length > 0)
                        
                        // If has options (variants or addons), we show "Pilih" or "Tambah" that opens modal
                        if (hasOptions) {
                          return (
                            <Button 
                              className="w-full rounded-2xl font-bold shadow-md shadow-primary/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedProduct(product)
                                setActiveImageIndex(0)
                              }}
                            >
                              Tambah
                            </Button>
                          )
                        }

                        const baseKey = `${product.id}:base`
                        return cart[baseKey] ? (
                          <div className="flex items-center justify-between bg-primary/5 rounded-2xl p-1.5 border border-primary/10" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromCart(product.id)
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border shadow-sm hover:text-destructive transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-black text-primary">{cart[baseKey]}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                addToCart(product.id)
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-90"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <Button 
                            className="w-full rounded-2xl font-bold shadow-md shadow-primary/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product.id)
                            }}
                          >
                            Tambah
                          </Button>
                        )
                      })()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-50 px-4 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
           <Link 
             href={`/${shop.slug}/checkout`}
             onClick={() => localStorage.setItem(`cart_${shop.id}`, JSON.stringify(cart))}
             className="w-full max-w-md bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl flex items-center justify-between group hover:scale-[1.02] transition-transform active:scale-95"
           >
             <div className="flex items-center gap-3">
               <div className="relative">
                 <ShoppingBag className="h-6 w-6" />
                 <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary">
                   {cartCount}
                 </span>
               </div>
               <div>
                 <p className="text-xs opacity-80 uppercase font-bold tracking-widest leading-none">Checkout</p>
                 <p className="text-lg font-bold">Rp {cartTotal.toLocaleString('id-ID')}</p>
               </div>
             </div>
             <div className="bg-white/20 p-2 rounded-xl group-hover:translate-x-1 transition-transform">
                <ChevronRight className="h-6 w-6" />
             </div>
           </Link>
        </div>
      )}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Gallery Section */}
            <div className="md:w-1/2 relative bg-muted flex flex-col">
              <div className="aspect-square w-full relative group">
                {(selectedProduct.images && selectedProduct.images.length > 0) ? (
                  <img 
                    src={selectedProduct.images[activeImageIndex]} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover transition-opacity duration-300" 
                  />
                ) : selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                    <ShoppingBag className="h-24 w-24" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImageIndex(prev => (prev > 0 ? prev - 1 : selectedProduct.images!.length - 1))
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImageIndex(prev => (prev < selectedProduct.images!.length - 1 ? prev + 1 : 0))
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto bg-muted/50 no-scrollbar">
                  {selectedProduct.images.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={cn(
                        "h-12 w-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                        activeImageIndex === i ? "border-primary scale-110 shadow-md" : "border-transparent opacity-60"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col h-full overflow-y-auto">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold leading-tight">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-primary text-2xl font-black">
                        Rp {(() => {
                           let price = selectedVariant?.price_override ?? selectedProduct.price
                           const addonsPrice = (selectedProduct as any).product_addons
                             ?.filter((a: any) => selectedAddons.includes(a.id))
                             .reduce((sum: number, a: any) => sum + a.price, 0) || 0
                           return (price + addonsPrice).toLocaleString('id-ID')
                        })()}
                    </p>
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full text-muted-foreground">
                        Stok: {selectedVariant?.stock ?? selectedProduct.stock}
                    </span>
                  </div>
                </div>

                {selectedProduct.product_variants && selectedProduct.product_variants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pilih Varian</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.product_variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all",
                            selectedVariant?.id === v.id 
                              ? "border-primary bg-primary/10 text-primary shadow-sm" 
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          )}
                        >
                          {v.name}
                          {v.price_override !== null && (
                              <span className="ml-1 opacity-60 text-[10px]">
                                (+Rp {(v.price_override - selectedProduct.price).toLocaleString('id-ID')})
                              </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.product_addons && selectedProduct.product_addons.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pilih Add-on (Bisa lebih dari satu)</h4>
                    <div className="space-y-2">
                       {selectedProduct.product_addons.map((a) => (
                         <label
                           key={a.id}
                           className={cn(
                             "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                             selectedAddons.includes(a.id)
                               ? "border-primary bg-primary/5 shadow-sm"
                               : "border-border hover:border-primary/20"
                           )}
                         >
                           <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                className="accent-primary h-4 w-4"
                                checked={selectedAddons.includes(a.id)}
                                onChange={() => {
                                  setSelectedAddons(prev => 
                                    prev.includes(a.id) 
                                      ? prev.filter(id => id !== a.id) 
                                      : [...prev, a.id]
                                  )
                                }}
                              />
                              <span className="text-sm font-bold">{a.name}</span>
                           </div>
                           <span className="text-xs font-black text-primary">+Rp {a.price.toLocaleString('id-ID')}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                )}

                {selectedProduct.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deskripsi</h4>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">{selectedProduct.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t">
                {(() => {
                  const addonPart = selectedAddons.length > 0 ? `:${selectedAddons.sort().join(',')}` : ''
                  const key = selectedVariant ? `${selectedProduct.id}:${selectedVariant.id}${addonPart}` : `${selectedProduct.id}:base${addonPart}`
                  const hasVariants = selectedProduct.product_variants && selectedProduct.product_variants.length > 0
                  const isVariantSelected = !hasVariants || !!selectedVariant
                  
                  if (cart[key]) {
                    return (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-muted rounded-2xl p-1 border">
                          <button 
                            onClick={() => removeFromCart(selectedProduct.id, selectedVariant?.id, selectedAddons)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-background border shadow-sm hover:text-destructive transition-colors"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                          <span className="w-12 text-center text-lg font-black text-primary">{cart[key]}</span>
                          <button 
                            onClick={() => addToCart(selectedProduct.id, selectedVariant?.id, selectedAddons)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-90"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground flex-1">Di keranjang</p>
                      </div>
                    )
                  }
                  
                  return (
                    <Button 
                      className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                      disabled={!isVariantSelected}
                      onClick={() => {
                        addToCart(selectedProduct.id, selectedVariant?.id, selectedAddons)
                      }}
                    >
                      {isVariantSelected ? 'Tambah ke Keranjang' : 'Pilih Varian Terlebih Dahulu'}
                    </Button>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && (
        <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex justify-around p-4 z-50">
           <Link href="/" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
              <ShoppingBag className="h-5 w-5 mb-1" />
              Belanja
           </Link>
           <Link href="/buyer/orders" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
              <Package className="h-5 w-5 mb-1" />
              Pesanan
           </Link>
           <Link href="/buyer/profile" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
              <User className="h-5 w-5 mb-1" />
              Profil
           </Link>
        </nav>
      )}
    </div>
  )
}
