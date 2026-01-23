'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Wallet, Banknote, Loader2, CheckCircle2, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { placeOrder } from '@/app/actions/orders'
import { getProductsByIds } from '@/app/actions/public-shop'
import { cn } from '@/lib/utils'
import { isShopOpen } from '@/lib/shop-status'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  product_variants?: {
    id: string
    name: string
    price_override: number | null
  }[]
  product_addons?: {
    id: string
    name: string
    price: number
  }[]
}

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutClient({ shop, userProfile, walletBalance = 0 }: { shop: any, userProfile?: any, walletBalance?: number }) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOrdering, setIsOrdering] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gateway' | 'balance'>('cash')
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' })
  const [orderType, setOrderType] = useState<'now' | 'scheduled'>('now')
  const [schedule, setSchedule] = useState({ date: '', time: '' })
  const router = useRouter()

  useEffect(() => {
    const shopStatus = isShopOpen(shop)
    if (!shopStatus.isOpen) {
       router.push(`/${shop.slug}`)
       return
    }

    const savedCart = localStorage.getItem(`cart_${shop.id}`)
    if (!savedCart) {
      router.push(`/${shop.slug}`)
      return
    }

    const cartData = JSON.parse(savedCart)
    setCart(cartData)
    
    // Extract product IDs from combined keys (productId:variantId)
    const productIds = Array.from(new Set(Object.keys(cartData).map(key => key.split(':')[0])))
    
    if (productIds.length > 0) {
      getProductsByIds(productIds).then(data => {
        setProducts(data as any)
        setIsLoading(false)
      })
    } else {
      router.push(`/${shop.slug}`)
    }
  }, [shop.id, shop.slug, router])

  useEffect(() => {
    if (userProfile) {
      setGuestInfo({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      })
    }
  }, [userProfile])

  const subtotal = Object.entries(cart).reduce((sum, [key, count]) => {
    const parts = key.split(':')
    const productId = parts[0]
    const variantId = parts[1]
    const addonIdsRaw = parts[2]
    
    const product = products.find(p => p.id === productId)
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

  const gatewayFee = paymentMethod === 'gateway' ? (subtotal * 0.007) : 0 
  const total = subtotal + gatewayFee

  const handlePlaceOrder = async () => {
    const isDigitalPayment = paymentMethod === 'gateway' || paymentMethod === 'balance'
    
    if (!guestInfo.name || !guestInfo.phone || (isDigitalPayment && !guestInfo.email)) {
      alert(isDigitalPayment 
        ? 'Mohon lengkapi nama, nomor HP, dan email Anda untuk pembayaran digital' 
        : 'Mohon lengkapi nama dan nomor HP Anda')
      return
    }

    setIsOrdering(true)
    
    const items = Object.entries(cart).map(([key, count]) => {
        const parts = key.split(':')
        const productId = parts[0]
        const variantId = parts[1]
        const addonIdsRaw = parts[2]
        
        const product = products.find(p => p.id === productId)
        
        let price = product?.price || 0
        if (variantId && variantId !== 'base' && product?.product_variants) {
            const variant = product.product_variants.find(v => v.id === variantId)
            if (variant && variant.price_override !== null) {
                price = variant.price_override
            }
        }

        // Add Addons to price
        let selectedAddons: any[] = []
        if (addonIdsRaw && product?.product_addons) {
            const addonIds = addonIdsRaw.split(',')
            selectedAddons = product.product_addons.filter(a => addonIds.includes(a.id))
            const addonsPrice = selectedAddons.reduce((total, a) => total + a.price, 0)
            price += addonsPrice
        }

        return {
            product_id: productId,
            variant_id: (variantId && variantId !== 'base') ? variantId : undefined,
            quantity: count,
            price: price,
            selected_addons: selectedAddons.length > 0 ? selectedAddons : undefined
        }
    })

    const result = await placeOrder({
      shop_id: shop.id,
      payment_method: paymentMethod,
      items: items,
      guest_info: guestInfo,
      scheduled_for: orderType === 'scheduled' ? `${schedule.date}T${schedule.time}:00` : undefined
    })
    
    if (result.success) {
      if (paymentMethod === 'gateway' && result.snapToken) {
        if (typeof window !== 'undefined' && window.snap) {
          window.snap.pay(result.snapToken, {
            onSuccess: (res: any) => {
              localStorage.removeItem(`cart_${shop.id}`)
              if (!userProfile) {
                const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
                orders.unshift({ id: result.orderId, shopName: shop.name, date: new Date().toISOString() })
                localStorage.setItem('guest_orders', JSON.stringify(orders.slice(0, 10)))
              }
              router.push(`/orders/${result.orderId}`)
            },
            onPending: (res: any) => {
              localStorage.removeItem(`cart_${shop.id}`)
              if (!userProfile) {
                const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
                orders.unshift({ id: result.orderId, shopName: shop.name, date: new Date().toISOString() })
                localStorage.setItem('guest_orders', JSON.stringify(orders.slice(0, 10)))
              }
              router.push(`/orders/${result.orderId}`)
            },
            onError: (res: any) => {
              localStorage.removeItem(`cart_${shop.id}`)
              if (!userProfile) {
                const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
                orders.unshift({ id: result.orderId, shopName: shop.name, date: new Date().toISOString() })
                localStorage.setItem('guest_orders', JSON.stringify(orders.slice(0, 10)))
              }
              router.push(`/orders/${result.orderId}`)
            },
            onClose: () => {
              localStorage.removeItem(`cart_${shop.id}`)
              if (!userProfile) {
                const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
                orders.unshift({ id: result.orderId, shopName: shop.name, date: new Date().toISOString() })
                localStorage.setItem('guest_orders', JSON.stringify(orders.slice(0, 10)))
              }
              router.push(`/orders/${result.orderId}`)
            }
          })
        } else {
          alert('Sistem pembayaran (Midtrans) belum siap. Mohon tunggu sebentar atau refresh halaman.')
          setIsOrdering(false)
        }
      } else {
        localStorage.removeItem(`cart_${shop.id}`)
        if (!userProfile) {
          const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
          orders.unshift({ id: result.orderId, shopName: shop.name, date: new Date().toISOString() })
          localStorage.setItem('guest_orders', JSON.stringify(orders.slice(0, 10)))
        }
        router.push(`/orders/${result.orderId}`)
      }
    } else {
      alert('Gagal membuat pesanan: ' + result.error)
      setIsOrdering(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3">
        <div className="container max-w-2xl px-0 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${shop.slug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-heading font-bold text-lg">Checkout</h1>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-6 space-y-6">
        {/* Opsi Pembelian */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Opsi Pembelian</CardTitle>
            <CardDescription>Pilih waktu pengambilan atau pengantaran.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex gap-4">
               <button 
                 onClick={() => setOrderType('now')}
                 className={cn(
                   "flex-1 p-3 rounded-xl border-2 text-center transition-all",
                   orderType === 'now' ? "border-primary bg-primary/5 font-bold" : "border-border hover:bg-muted"
                 )}
               >
                 Beli Sekarang
               </button>
               <button 
                 onClick={() => setOrderType('scheduled')}
                 className={cn(
                   "flex-1 p-3 rounded-xl border-2 text-center transition-all",
                   orderType === 'scheduled' ? "border-primary bg-primary/5 font-bold" : "border-border hover:bg-muted"
                 )}
               >
                 Jadwalkan
               </button>
             </div>

             {orderType === 'scheduled' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                 <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-1">Pilih Tanggal</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-bold rounded-xl border-slate-200 bg-white hover:border-primary/50 transition-all",
                            !schedule.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {schedule.date ? format(new Date(schedule.date), "PPP", { locale: id }) : <span>Pilih tanggal...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl bg-white" align="start">
                        <Calendar
                          mode="single"
                          selected={schedule.date ? new Date(schedule.date) : undefined}
                          onSelect={(date) => setSchedule(prev => ({ ...prev, date: date ? format(date, "yyyy-MM-dd") : '' }))}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-1">Pilih Jam</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-bold rounded-xl border-slate-200 bg-white hover:border-primary/50 transition-all",
                            !schedule.time && "text-muted-foreground"
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          {schedule.time ? schedule.time : <span>Pilih jam...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-2 rounded-2xl border-none shadow-2xl bg-white" align="start">
                        <ScrollArea className="h-[250px] pr-2">
                           <div className="grid grid-cols-1 gap-1">
                              {Array.from({ length: 48 }).map((_, i) => {
                                 const hour = Math.floor(i / 2)
                                 const minute = i % 2 === 0 ? '00' : '30'
                                 const time = `${hour.toString().padStart(2, '0')}:${minute}`
                                 return (
                                    <button
                                       key={time}
                                       type="button"
                                       onClick={() => {
                                          setSchedule(prev => ({ ...prev, time }))
                                       }}
                                       className={cn(
                                          "flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl text-left transition-all",
                                          schedule.time === time 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                            : "hover:bg-slate-100 text-slate-600"
                                       )}
                                    >
                                       {time}
                                       {schedule.time === time && <CheckCircle2 className="h-4 w-4" />}
                                    </button>
                                 )
                              })}
                           </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(cart).map(([key, count]) => {
              const parts = key.split(':')
              const productId = parts[0]
              const variantId = parts[1]
              const addonIdsRaw = parts[2]
              
              const product = products.find(p => p.id === productId)
              if (!product) return null
              
              let price = product.price
              let variantName = ''
              if (variantId && variantId !== 'base' && product.product_variants) {
                  const variant = product.product_variants.find(v => v.id === variantId)
                  if (variant) {
                      variantName = variant.name
                      if (variant.price_override !== null) {
                          price = variant.price_override
                      }
                  }
              }

              // Handle Addons
              let selectedAddons: any[] = []
              if (addonIdsRaw && product.product_addons) {
                  const addonIds = addonIdsRaw.split(',')
                  selectedAddons = product.product_addons.filter(a => addonIds.includes(a.id))
                  const addonsPrice = selectedAddons.reduce((total, a) => total + a.price, 0)
                  price += addonsPrice
              }

              return (
                <div key={key} className="flex gap-4">
                  <div className="h-16 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                     {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="font-medium truncate">{product.name}</p>
                     <div className="flex flex-wrap gap-2 mt-1">
                        {variantName && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">Varian: {variantName}</span>}
                        {selectedAddons.map(a => (
                           <span key={a.id} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border font-medium">+{a.name}</span>
                        ))}
                     </div>
                     <p className="text-sm text-muted-foreground mt-1">{count}x Rp {price.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="font-bold">Rp {(price * count).toLocaleString('id-ID')}</p>
                </div>
              )
            })}
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {paymentMethod === 'gateway' && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Biaya Layanan (0.7%)</span>
                  <span>Rp {gatewayFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t text-primary">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Pembeli</CardTitle>
            <CardDescription>Digunakan untuk konfirmasi pesanan oleh penjual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cust_name">Nama Lengkap</Label>
              <Input 
                id="cust_name" 
                placeholder="John Doe" 
                value={guestInfo.name} 
                onChange={e => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cust_phone">Nomor WhatsApp</Label>
              <Input 
                id="cust_phone" 
                placeholder="0812..." 
                type="tel"
                value={guestInfo.phone} 
                onChange={e => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cust_email">Email (Wajib untuk Pembayaran Digital)</Label>
              <Input 
                id="cust_email" 
                placeholder="alex@example.com" 
                type="email"
                value={guestInfo.email} 
                onChange={e => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground italic">
                * Email digunakan untuk pengembalian dana otomatis jika pesanan dibatalkan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
             <button 
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  paymentMethod === 'cash' ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}
             >
                <div className={cn("p-2 rounded-lg", paymentMethod === 'cash' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <Banknote className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Tunai (Bayar di Tempat)</p>
                  <p className="text-xs text-muted-foreground">Bayar langsung ke penjual.</p>
                </div>
             </button>

             <button 
                onClick={() => setPaymentMethod('gateway')}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  paymentMethod === 'gateway' ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}
             >
                <div className={cn("p-2 rounded-lg", paymentMethod === 'gateway' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">E-Wallet / QRIS / Transfer</p>
                  <p className="text-xs text-muted-foreground">Pembayaran otomatis via Midtrans.</p>
                </div>
             </button>

             <button 
                disabled={!userProfile || walletBalance < total}
                onClick={() => setPaymentMethod('balance')}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  paymentMethod === 'balance' ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                  (!userProfile || walletBalance < total) && "opacity-50 cursor-not-allowed border-dashed bg-muted/50"
                )}
             >
                <div className={cn("p-2 rounded-lg", paymentMethod === 'balance' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Saldo Dompet</p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile 
                      ? `Saldo: Rp ${walletBalance.toLocaleString('id-ID')} ${walletBalance < total ? '(Kurang)' : ''}`
                      : 'Login untuk menggunakan saldo'}
                  </p>
                </div>
             </button>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20" 
          disabled={isOrdering || !guestInfo.name || !guestInfo.phone || (orderType === 'scheduled' && (!schedule.date || !schedule.time))}
          onClick={handlePlaceOrder}
        >
          {isOrdering && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Buat Pesanan Sekarang
        </Button>
      </main>
    </div>
  )
}
