'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ShoppingBag, ChevronRight, Plus, Minus, MapPin, Instagram, Facebook, Clock, X, ChevronLeft, User, Package, Save, ShieldOff, Share2, Copy, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

import { isShopOpen } from '@/lib/shop-status'

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
  rating?: {
    average: number
    count: number
    reviews?: any[]
  }
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
  is_active?: boolean
}

export default function ShopClient({ 
  shop, 
  categories, 
  isLoggedIn,
  shopRating 
}: { 
  shop: Shop, 
  categories: CategoryWithProducts[], 
  isLoggedIn: boolean,
  shopRating?: { 
    average: number; 
    count: number; 
    reviews?: any[] 
  }
}) {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false)
  const [isProductReviewsOpen, setIsProductReviewsOpen] = useState(false)
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null)
  
  const shopStatus = isShopOpen(shop)
  const isDeactivated = shop.is_active === false
  const [cart, setCart] = useState<Record<string, number>>({})
  /* ... inside ShopClient ... */
  /* ... inside ShopClient ... */
  const [isClearCartOpen, setIsClearCartOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Sync URL with Selected Product
  useEffect(() => {
    const productId = searchParams.get('productId')
    if (productId) {
      const product = categories.flatMap(c => c.products).find(p => p.id === productId)
      if (product) {
        setSelectedProduct(product)
      }
    } else {
      setSelectedProduct(null)
    }
  }, [searchParams, categories])

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product)
    setActiveImageIndex(0)
    // Update URL without refreshing
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('productId', product.id)
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  const handleCloseProduct = () => {
    setSelectedProduct(null)
    // Remove query param
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('productId')
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  const handleShareProduct = async (product: Product) => {
     const shareUrl = `${window.location.origin}${pathname}?productId=${product.id}`
     const shareData = {
        title: product.name,
        text: `Cek produk ${product.name} di ${shop.name}!`,
        url: shareUrl
     }

     if (navigator.share) {
        try {
           await navigator.share(shareData)
        } catch (err) {
           console.log('Error sharing:', err)
        }
     } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl)
        alert('Link produk berhasil disalin!')
     }
  }

  useEffect(() => {
    if (selectedProduct) {
        setSelectedVariant(null)
        setSelectedAddons([])
    }
  }, [selectedProduct])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${shop.id}`)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
  }, [shop.id])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
     localStorage.setItem(`cart_${shop.id}`, JSON.stringify(cart))
  }, [cart, shop.id])

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
    <div className="min-h-screen bg-muted/5 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl shrink-0">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tighter text-primary">
            <ShoppingBag className="h-7 w-7 fill-primary/10" />
            <span>YukJajan<span className="text-foreground">.</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="transition-colors hover:text-primary text-muted-foreground">
              Belanja
            </Link>
            <Link href="/buyer/orders" className="transition-colors hover:text-primary text-muted-foreground">
              Pesanan Saya
            </Link>
            <Link href="/buyer/profile" className="transition-colors hover:text-primary text-muted-foreground">
              Profil
            </Link>
          </nav>
          <div className="flex items-center gap-4">
             {isLoggedIn ? (
                <Button asChild variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary transition-all">
                   <Link href="/buyer/profile">
                      <User className="h-5 w-5" />
                   </Link>
                </Button>
             ) : (
                <Button asChild size="sm" className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20">
                    <Link href="/buyer/login">Masuk</Link>
                </Button>
             )}
          </div>
        </div>
      </header>

      <div className="flex-1 pb-32 relative">
      {/* Deactivation Overlay for Buyer */}
      {isDeactivated && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <Card className="max-w-md border-none shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-2 bg-destructive w-full" />
            <CardHeader className="pt-10 pb-6">
              <div className="h-20 w-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ShieldOff className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-black">Toko Sedang Ditinjau</CardTitle>
              <CardDescription className="text-base text-slate-500 font-medium leading-relaxed mt-2">
                Maaf, toko ini sedang dalam masa peninjauan oleh moderator atau telah dinonaktifkan sementara. Silakan coba lagi nanti atau cari toko lain.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pb-10 flex flex-col gap-4">
              <Button asChild className="w-full rounded-2xl h-12 bg-slate-900 font-bold">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Shop Header */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {shop.cover_url ? (
          <img src={shop.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-primary/20 to-primary/10" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="container max-w-full flex justify-center px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl max-w-4xl w-full shadow-xl border p-6 flex flex-col items-center text-center space-y-4">
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
            <div className="flex flex-col items-center gap-2">
               <h1 className="text-2xl md:text-3xl font-heading font-bold">{shop.name}</h1>
               {(() => {
                  const status = isShopOpen(shop);
                  return (
                     <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        status.isOpen 
                           ? "bg-green-500/10 text-green-600 border-green-500/20" 
                           : "bg-destructive/10 text-destructive border-destructive/20"
                     )}>
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", status.isOpen ? "bg-green-500" : "bg-destructive")} />
                        {status.message}
                     </div>
                  );
               })()}
            </div>
            {shop.description && <p className="text-muted-foreground text-sm max-w-md">{shop.description}</p>}
            
            {shopRating && shopRating.count > 0 && (
               <button 
                onClick={() => setIsReviewsOpen(true)}
                className="flex items-center gap-2 mt-2 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-all group active:scale-95 shadow-sm"
               >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "h-3.5 w-3.5 transition-all duration-300 group-hover:scale-110",
                          s <= Math.round(shopRating.average) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-slate-200 dark:text-slate-700"
                        )} 
                        style={{ transitionDelay: `${s * 50}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black text-yellow-700 dark:text-yellow-400 ml-1">{shopRating.average}</span>
                  <span className="text-[10px] text-yellow-600/60 dark:text-yellow-400/50 font-bold">({shopRating.count} ulasan)</span>
               </button>
            )}
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
                className="flex items-center gap-1.5 text-blue-600 hover:underline"
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
                  className={cn(
                    "overflow-hidden group hover:shadow-xl transition-all duration-300 border bg-card flex flex-col relative cursor-pointer",
                    product.stock <= 0 && "opacity-60 grayscale hover:shadow-none hover:scale-100 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (product.stock > 0) {
                        handleOpenProduct(product)
                    }
                  }}
                >
                  {/* Image Header */}
                  <div className="aspect-square w-full relative overflow-hidden bg-muted">
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                                Stok Habis
                            </div>
                        </div>
                    )}
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
                                handleOpenProduct(product)
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

                      {/* Product Rating */}
                      {(product as any).rating && (product as any).rating.count > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProductForReviews(product)
                            setIsProductReviewsOpen(true)
                          }}
                          className="flex items-center gap-1 group/rating"
                        >
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={cn(
                                  "h-2.5 w-2.5 transition-transform group-hover/rating:scale-110",
                                  s <= Math.round((product as any).rating.average) 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-slate-200 dark:text-slate-700"
                                )} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-black ml-1 group-hover/rating:text-primary transition-colors">{(product as any).rating.average}</span>
                          <span className="text-[9px] text-muted-foreground font-medium group-hover/rating:text-primary transition-colors">({(product as any).rating.count})</span>
                        </button>
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
                              disabled={!shopStatus.isOpen}
                              className="w-full rounded-2xl font-bold shadow-md shadow-primary/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenProduct(product)
                              }}
                            >
                              {shopStatus.isOpen ? "Tambah" : "Tutup"}
                            </Button>
                          )
                        }

                        const baseKey = `${product.id}:base`
                        const isStockEmpty = product.stock <= 0

                        if (cart[baseKey]) {
                          return (
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
                                  if (product.stock > cart[baseKey]) {
                                      addToCart(product.id)
                                  }
                                }}
                                disabled={product.stock <= cart[baseKey]}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        } 
                        
                        return (
                          <Button 
                            disabled={!shopStatus.isOpen || isStockEmpty}
                            className="w-full rounded-2xl font-bold shadow-md shadow-primary/10 disabled:opacity-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product.id)
                            }}
                          >
                            {!shopStatus.isOpen ? "Tutup" : (isStockEmpty ? "Stok Habis" : "Tambah")}
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

      {/* Cart Edit Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-80 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300">
           <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsCartOpen(false)}
           />
           <div className="bg-card w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-10 duration-300">
              <div className="p-4 border-b flex items-center justify-between shrink-0">
                  <h3 className="text-lg font-heading font-bold">Keranjang Belanja</h3>
                  <div className="flex items-center gap-2">
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10 h-8"
                          onClick={() => setIsClearCartOpen(true)}
                        >
                           Bersihkan
                        </Button>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                 {Object.entries(cart).map(([key, count]) => {
                    const [productId, variantId, addonIdsRaw] = key.split(':')
                    const product = categories.flatMap(c => c.products).find(p => p.id === productId)
                    if (!product) return null

                    let price = product.price
                    let variantName = ''
                    let variantStock = product.stock

                    if (variantId && variantId !== 'base' && product.product_variants) {
                        const variant = product.product_variants.find(v => v.id === variantId)
                        if (variant) {
                            if (variant.price_override !== null) price = variant.price_override
                            variantName = variant.name
                            variantStock = variant.stock
                        }
                    }

                    // Addons
                    const addonIds = addonIdsRaw ? addonIdsRaw.split(',') : []
                    const addons = product.product_addons?.filter(a => addonIds.includes(a.id)) || []
                    const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0)
                    const finalPrice = price + addonsPrice

                    const isStockMax = count >= variantStock

                    return (
                        <div key={key} className="flex gap-3 p-3 bg-muted/30 rounded-2xl border">
                             <div className="h-16 w-16 bg-white rounded-xl overflow-hidden shrink-0 border">
                                {product.image_url ? (
                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                )}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold truncate">{product.name}</h4>
                                 <div className="flex flex-wrap text-[10px] gap-1 mt-1 text-muted-foreground">
                                    {variantName && <span className="bg-primary/5 text-primary px-1 rounded-md border border-primary/10">{variantName}</span>}
                                    {addons.map((addon, i) => (
                                       <span key={i} className="bg-muted px-1 rounded-md border">+{addon.name}</span>
                                    ))}
                                 </div>
                                 <p className="text-sm font-bold mt-1 text-primary">Rp {(finalPrice * count).toLocaleString('id-ID')}</p>
                             </div>
                             
                             <div className="flex flex-col items-end justify-between shrink-0">
                                 <div className="flex items-center gap-2 bg-background border rounded-lg p-0.5 shadow-sm">
                                      <button 
                                        onClick={() => removeFromCart(product.id, variantId === 'base' ? undefined : variantId, addonIds)}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-destructive hover:text-white rounded-md transition-colors"
                                      >
                                          <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="text-xs font-bold w-4 text-center">{count}</span>
                                      <button 
                                        onClick={() => addToCart(product.id, variantId === 'base' ? undefined : variantId, addonIds)}
                                        disabled={isStockMax}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-white rounded-md transition-colors disabled:opacity-30"
                                      >
                                          <Plus className="h-3 w-3" />
                                      </button>
                                 </div>
                             </div>
                        </div>
                    )
                 })}
              </div>

              <div className="p-4 border-t bg-muted/10 shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Total Pembayaran</span>
                      <span className="text-xl font-black text-primary">Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <Button asChild className="w-full h-12 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                     <Link href={`/${shop.slug}/checkout`}>
                        Lanjut ke Pembayaran
                        <ChevronRight className="ml-2 h-5 w-5" />
                     </Link>
                  </Button>
              </div>
           </div>
        </div>
      )}

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-[70] px-4 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full max-w-md bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl flex items-center justify-between group hover:scale-[1.02] transition-transform active:scale-95 cursor-pointer"
           >
             <div className="flex items-center gap-3">
               <div className="relative">
                 <ShoppingBag className="h-6 w-6" />
                 <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary">
                   {cartCount}
                 </span>
               </div>
               <div className="text-left">
                 <p className="text-xs opacity-80 uppercase font-bold tracking-widest leading-none">Total Keranjang</p>
                 <p className="text-lg font-bold">Rp {cartTotal.toLocaleString('id-ID')}</p>
               </div>
             </div>
             <div className="bg-white/20 px-3 py-1.5 rounded-xl font-bold text-sm group-hover:bg-white/30 transition-colors flex items-center gap-2">
                Lihat Detail
                <ChevronRight className="h-4 w-4" />
             </div>
           </button>
        </div>
      )}
      {/* Clear Cart Confirmation Modal */}
      {isClearCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
             onClick={() => setIsClearCartOpen(false)}
           />
           <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
             <div className="text-center space-y-4">
               <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                 <ShoppingBag className="h-8 w-8" />
               </div>
               <div>
                  <h3 className="text-lg font-bold">Hapus semua item?</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tindakan ini akan mengosongkan keranjang belanja Anda. Anda tidak dapat membatalkannya.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-12 font-bold"
                    onClick={() => setIsClearCartOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="rounded-xl h-12 font-bold text-white"
                    onClick={() => {
                      setCart({})
                      setIsClearCartOpen(false)
                      setIsCartOpen(false)
                    }}
                  >
                    Ya, Hapus
                  </Button>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className={cn(
          "fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300",
          cartCount > 0 ? "pb-32 md:pb-4" : "pb-4"
        )}>
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleCloseProduct}
          />
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => handleShareProduct(selectedProduct)}
                  className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                   <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleCloseProduct}
                  className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
            </div>

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
            <div className="md:w-1/2 flex flex-col h-full overflow-hidden">
              <div className="flex-1 p-3 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
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

              <div className="p-4 md:p-8 border-t bg-background/50 backdrop-blur-xl shrink-0">
                {(() => {
                  const addonPart = selectedAddons.length > 0 ? `:${selectedAddons.sort().join(',')}` : ''
                  const key = selectedVariant ? `${selectedProduct.id}:${selectedVariant.id}${addonPart}` : `${selectedProduct.id}:base${addonPart}`
                  const hasVariants = selectedProduct.product_variants && selectedProduct.product_variants.length > 0
                  const isVariantSelected = !hasVariants || !!selectedVariant
                  
// ... inside shop-client.tsx component

                        // Logic for Modal Button
                        const isStockAvailable = (() => {
                            if (selectedVariant) return selectedVariant.stock > 0
                            return selectedProduct.stock > 0
                        })()

                        if (cart[key]) {
                            return (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-between bg-muted rounded-2xl p-1 border w-full">
                                  <button 
                                    onClick={() => removeFromCart(selectedProduct.id, selectedVariant?.id, selectedAddons)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-background border shadow-sm hover:text-destructive transition-colors"
                                  >
                                    <Minus className="h-5 w-5" />
                                  </button>
                                  <span className="w-12 text-center text-lg font-black text-primary">{cart[key]}</span>
                                  <button 
                                    onClick={() => {
                                        // Check max stock? For now just simple check
                                        if (isStockAvailable && ((selectedVariant?.stock ?? selectedProduct.stock) > cart[key])) {
                                             addToCart(selectedProduct.id, selectedVariant?.id, selectedAddons)
                                        }
                                    }}
                                    disabled={!isStockAvailable || ((selectedVariant?.stock ?? selectedProduct.stock) <= cart[key])}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            )
                        }
                          
                        return (
                            <Button 
                              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 disabled:opacity-50"
                              disabled={!isVariantSelected || !isStockAvailable}
                              onClick={() => {
                                addToCart(selectedProduct.id, selectedVariant?.id, selectedAddons)
                              }}
                            >
                              {!isVariantSelected ? 'Pilih Varian Terlebih Dahulu' : (!isStockAvailable ? 'Stok Habis' : 'Tambah ke Keranjang')}
                            </Button>
                        )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around p-4 pb-8 z-50">
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

      {/* Shop Reviews Dialog */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-100 dark:border-yellow-900/30">
            <div className="flex items-center gap-2 mb-1">
               <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
               <DialogTitle className="text-xl font-black text-yellow-800 dark:text-yellow-400">Ulasan Toko</DialogTitle>
            </div>
            <DialogDescription className="text-yellow-700/70 dark:text-yellow-400/60 font-medium">
               Apa kata mereka tentang {shop.name}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            {shopRating?.reviews && shopRating.reviews.length > 0 ? (
              shopRating.reviews.map((review, i) => (
                <div key={review.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                        {(review.orders?.guest_info?.name || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {review.orders?.guest_info?.name || 'Pelanggan'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                       <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                       <span className="text-[11px] font-black text-yellow-700 dark:text-yellow-400">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                       <div className="absolute -top-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-100 dark:border-b-slate-800" />
                       <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic">"{review.comment}"</p>
                    </div>
                  )}
                  {i < (shopRating?.reviews?.length || 0) - 1 && <div className="h-px bg-slate-100 dark:bg-slate-800 w-full pt-2" />}
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-2">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Star className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-black text-slate-900 dark:text-white">Belum ada ulasan</p>
                <p className="text-sm text-slate-500">Jadilah yang pertama memberikan ulasan!</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t">
             <Button onClick={() => setIsReviewsOpen(false)} variant="outline" className="w-full rounded-2xl font-black uppercase tracking-widest text-xs h-12 shadow-sm">
                Tutup
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Reviews Dialog */}
      <Dialog open={isProductReviewsOpen} onOpenChange={setIsProductReviewsOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-xl">
          <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-2 mb-1">
               <Star className="h-5 w-5 fill-primary text-primary" />
               <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Ulasan Produk</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 font-medium">
               Apa kata mereka tentang {selectedProductForReviews?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            {selectedProductForReviews?.rating?.reviews && selectedProductForReviews.rating.reviews.length > 0 ? (
              selectedProductForReviews.rating.reviews.map((review: any, i: number) => (
                <div key={review.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                        {(review.orders?.guest_info?.name || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {review.orders?.guest_info?.name || 'Pelanggan'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                       <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                       <span className="text-[11px] font-black text-yellow-700 dark:text-yellow-400">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                       <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic">"{review.comment}"</p>
                    </div>
                  )}
                  {i < (selectedProductForReviews?.rating?.reviews?.length || 0) - 1 && <div className="h-px bg-slate-100 dark:bg-slate-800 w-full pt-2" />}
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-2">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Star className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-black text-slate-900 dark:text-white">Belum ada ulasan</p>
                <p className="text-sm text-slate-500">Produk ini belum memiliki ulasan.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t">
             <Button onClick={() => setIsProductReviewsOpen(false)} variant="outline" className="w-full rounded-2xl font-black uppercase tracking-widest text-xs h-12">
                Tutup
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
