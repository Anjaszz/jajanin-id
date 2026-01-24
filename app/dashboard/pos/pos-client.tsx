"use client"

import { useState, useMemo } from "react"
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Package, X, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn, formatCurrency } from "@/lib/utils"
import { processPosOrder, PosOrderItem } from "@/app/actions/pos"
import { toast } from "sonner"
import { ConfirmationModal } from "@/components/confirmation-modal"

// Types
interface Variant {
    id: string;
    name: string;
    price_override: number | null;
    stock: number;
}

interface Addon {
    id: string;
    name: string;
    price: number;
}

interface Product {
    id: string
    name: string
    price: number
    stock: number | null
    image_url: string | null
    category_id: string | null
    product_variants: Variant[]
    product_addons: Addon[]
}

interface CartItem {
    cartId: string // Unique ID for cart item (product + variant + addons combination)
    productId: string
    name: string
    basePrice: number
    finalPrice: number
    quantity: number
    image_url: string | null
    variant?: Variant
    addons: Addon[]
}

export default function PosClient({ products, settings }: { products: Product[], settings: { platform_fee: number; gateway_fee: number } }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gateway'>('cash')
    
    // Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [products, searchTerm])

    // --- Cart Logic ---

    const handleProductClick = (product: Product) => {
        const hasVariants = product.product_variants && product.product_variants.length > 0
        const hasAddons = product.product_addons && product.product_addons.length > 0

        if (hasVariants || hasAddons) {
            // Open Modal
            setSelectedProduct(product)
            // Pre-select first variant if exists and has stock
            if (hasVariants) {
                const firstAvailableParams = product.product_variants.find(v => v.stock > 0)
                setSelectedVariantId(firstAvailableParams ? firstAvailableParams.id : null)
            } else {
                setSelectedVariantId(null)
            }
            setSelectedAddonIds([])
            setIsModalOpen(true)
        } else {
            // Add directly
            if (product.stock !== null && product.stock <= 0) {
                 toast.error("Stok habis")
                 return
            }
            addToCart(product, null, [])
        }
    }

    const addToCart = (product: Product, variant: Variant | null, addons: Addon[]) => {
        // Calculate Price
        let base = Number(product.price)
        if (variant && variant.price_override !== null) {
            base = Number(variant.price_override)
        }
        const addonTotal = addons.reduce((sum, a) => sum + Number(a.price), 0)
        const finalPrice = base + addonTotal

        // Generate Cart ID
        const addonString = addons.map(a => a.id).sort().join('-')
        const cartId = `${product.id}-${variant?.id || 'base'}-${addonString}`

        setCart(prev => {
            const existing = prev.find(i => i.cartId === cartId)
            if (existing) {
                // Check Stock
                const stockLimit = variant ? variant.stock : (product.stock || 0)
                if (existing.quantity >= stockLimit) {
                     toast.error("Mencapai batas stok tersedia")
                     return prev
                }
                return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i)
            }

            return [...prev, {
                cartId,
                productId: product.id,
                name: product.name,
                basePrice: base,
                finalPrice,
                quantity: 1,
                image_url: product.image_url,
                variant: variant || undefined,
                addons
            }]
        })
        
        setIsModalOpen(false)
        setSelectedProduct(null)
    }

    const confirmAddToOrder = () => {
        if (!selectedProduct) return
        
        // Validation
        if (selectedProduct.product_variants.length > 0 && !selectedVariantId) {
            toast.error("Pilih varian terlebih dahulu")
            return
        }

        let variant = null
        if (selectedVariantId) {
            variant = selectedProduct.product_variants.find(v => v.id === selectedVariantId) || null
        }

        const addons = selectedProduct.product_addons.filter(a => selectedAddonIds.includes(a.id))

        // Stock check
        if (variant) {
            if (variant.stock <= 0) {
                toast.error("Stok varian ini habis")
                return
            }
        } else {
             if (selectedProduct.product_variants.length === 0 && selectedProduct.stock !== null && selectedProduct.stock <= 0) {
                toast.error("Stok produk habis")
                return
             }
        }

        addToCart(selectedProduct, variant, addons)
    }

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(i => i.cartId !== cartId))
    }

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.cartId === cartId) {
                    const newQty = i.quantity + delta
                    if (newQty < 1) return i 
                    
                    // Stock Limit Check
                    const limit = i.variant ? i.variant.stock : 9999 // Simplification: we should check product stock too if no variant
                    if (newQty > limit) {
                        toast.error("Mencapai batas stok")
                        return i
                    }

                    return { ...i, quantity: newQty }
                }
                return i
            })
        })
    }

    const toggleAddon = (addonId: string) => {
        setSelectedAddonIds(prev => 
            prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
        )
    }

    // --- Checkout Logic ---

    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0)
    const gatewayFee = paymentMethod === 'gateway' ? Math.round(subtotal * (settings.gateway_fee / 100)) : 0
    const totalAmount = subtotal + gatewayFee

    const handleCheckout = async () => {
        if (cart.length === 0) return
        setShowConfirm(true)
    }

    const confirmPayment = async () => {
        setIsProcessing(true)
        setShowConfirm(false) 

        try {
            const items: PosOrderItem[] = cart.map(i => ({ 
                productId: i.productId, 
                quantity: i.quantity,
                variantId: i.variant?.id,
                addonIds: i.addons.map(a => a.id)
            }))
            
            const result = await processPosOrder(items, paymentMethod)
            
            if (result.success) {
                setCart([])
                toast.success("Transaksi Dibuat!", {
                    description: `Order ID: #${result.orderId}`,
                    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />
                })
                // Redirect immediately to order detail
                // The auto-trigger for payment will happen there
                window.location.href = `/dashboard/orders/${result.orderId}`
            } else {
                toast.error(result.error || "Gagal memproses transaksi")
            }
        } catch (error) {
            console.error(error)
            toast.error("Terjadi kesalahan sistem")
        } finally {
            setIsProcessing(false)
        }
    }

    // Modal Helper: Calculate potential price
    const modalReviewPrice = useMemo(() => {
        if (!selectedProduct) return 0
        let price = Number(selectedProduct.price)
        if (selectedVariantId) {
            const v = selectedProduct.product_variants.find(v => v.id === selectedVariantId)
            if (v && v.price_override) price = Number(v.price_override)
        }
        const addonsPrice = selectedProduct.product_addons
            .filter(a => selectedAddonIds.includes(a.id))
            .reduce((sum, a) => sum + Number(a.price), 0)
        return price + addonsPrice
    }, [selectedProduct, selectedVariantId, selectedAddonIds])

    return (
        <div className="flex h-full gap-4 md:gap-6 overflow-hidden relative">
            
            {/* LEFT SIDE: CATALOG */}
            <div className={cn(
                "flex-1 flex flex-col h-full overflow-hidden transition-all duration-300",
                isMobileCartOpen ? "hidden xl:flex" : "flex"
            )}>
                <div className="relative mb-4 shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border-none shadow-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-hidden"
                        placeholder="Cari produk..."
                    />
                </div>

                <ScrollArea className="flex-1 pr-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 pb-20">
                        {filteredProducts.map(product => {
                             const hasStock = (product.product_variants.length > 0 
                                ? product.product_variants.some(v => v.stock > 0) 
                                : (product.stock !== null && product.stock > 0));

                             return (
                                <Card 
                                    key={product.id} 
                                    className={cn(
                                        "group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-lg transition-all active:scale-95 duration-200 rounded-3xl",
                                        !hasStock && "opacity-60 grayscale"
                                    )}
                                    onClick={() => hasStock && handleProductClick(product)}
                                >
                                    <div className="aspect-square bg-slate-100 relative">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-10 w-10 text-slate-300" />
                                            </div>
                                        )}
                                        {hasStock && (
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
                                                    <Plus className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>
                                        )}
                                        {/* Stock Badge */}
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm text-slate-500">
                                            {product.product_variants.length > 0 ? (
                                                <span className="text-primary italic">Varian</span>
                                            ) : (
                                                <span>Stok: {product.stock}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white group-hover:bg-slate-50 transition-colors">
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate leading-tight mb-1">{product.name}</h3>
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="text-primary font-black text-sm sm:text-base">{formatCurrency(product.price)}</p>
                                            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center sm:hidden">
                                                <Plus className="h-3 w-3 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-50">
                                <Search className="h-12 w-12 mx-auto mb-2" />
                                <p className="font-bold">Tidak ada produk ditemukan</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT SIDE: CART */}
            <div className={cn(
                "fixed inset-0 z-50 bg-white xl:relative xl:inset-auto xl:z-0 xl:flex w-full xl:w-[350px] 2xl:w-[420px] shrink-0 flex flex-col h-dvh xl:h-full rounded-none xl:rounded-3xl shadow-xl border-none xl:border xl:border-slate-100 overflow-hidden transition-all duration-300",
                isMobileCartOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"
            )}>
                <div className="p-4 md:p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h2 className="font-black text-xl flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Keranjang
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                    </h2>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="xl:hidden rounded-full h-10 w-10 p-0" 
                        onClick={() => setIsMobileCartOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length > 0 ? (
                        cart.map((item, idx) => (
                            <div key={item.cartId} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                                <div className="h-14 w-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Package className="h-6 w-6 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                                    
                                    {/* Variant & Addons Info */}
                                    <div className="text-[10px] text-slate-500 leading-tight mb-1">
                                        {item.variant && <span className="block font-medium text-emerald-600">{item.variant.name}</span>}
                                        {item.addons.length > 0 && (
                                            <span className="block">+ {item.addons.map(a => a.name).join(', ')}</span>
                                        )}
                                    </div>

                                    <p className="text-xs text-primary font-black">{formatCurrency(item.finalPrice)}</p>
                                    
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                                            <button 
                                                onClick={() => updateQuantity(item.cartId, -1)}
                                                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-xs transition-all disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.cartId, 1)}
                                                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-xs transition-all"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-slate-400 hover:text-red-500 transition-colors ml-auto"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <ShoppingCart className="h-16 w-16 mb-4 text-slate-300" />
                            <p className="font-bold text-slate-400 text-sm">Keranjang Kosong</p>
                            <p className="text-xs text-slate-400">Pilih produk di sebelah kiri</p>
                        </div>
                    )}
                </div>

                <div className="p-5 pb-32 xl:pb-12 bg-slate-50 border-t border-slate-100 space-y-4">
                     {/* Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {paymentMethod === 'gateway' && (
                            <div className="flex justify-between text-sm text-blue-600 font-medium animate-in fade-in slide-in-from-top-1">
                                <span className="flex items-center gap-1.5">
                                    Biaya Layanan ({settings.gateway_fee}%)
                                </span>
                                <span>{formatCurrency(gatewayFee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-black text-slate-900 border-t border-slate-100 pt-2">
                            <span>Total</span>
                            <span className="text-primary">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant="outline"
                            onClick={() => setPaymentMethod('cash')}
                            className={cn(
                                "h-12 border-2 rounded-xl text-xs font-black uppercase tracking-wide",
                                paymentMethod === 'cash' 
                                    ? "border-primary bg-primary/5 text-primary" 
                                    : "border-slate-200 text-slate-400 bg-white"
                            )}
                        >
                            <Banknote className="mr-2 h-4 w-4" /> Tunai
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => setPaymentMethod('gateway')}
                            className={cn(
                                "h-12 border-2 rounded-xl text-xs font-black uppercase tracking-wide",
                                paymentMethod === 'gateway' 
                                    ? "border-blue-500 bg-blue-50 text-blue-600" 
                                    : "border-slate-200 text-slate-400 bg-white"
                            )}
                        >
                            <CreditCard className="mr-2 h-4 w-4" /> Digital
                        </Button>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full h-14 text-base font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : "Proses Pembayaran"}
                    </Button>
                </div>
            </div>

            {/* OPTION MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-black">{selectedProduct?.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="p-6 pt-0 space-y-6 max-h-[60vh] overflow-y-auto">
                        {selectedProduct?.product_variants && selectedProduct.product_variants.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">Pilih Varian</h4>
                                <div className="grid gap-2">
                                    {selectedProduct.product_variants.map(variant => (
                                        <div 
                                            key={variant.id}
                                            onClick={() => variant.stock > 0 && setSelectedVariantId(variant.id)} 
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                selectedVariantId === variant.id 
                                                    ? "border-primary bg-primary/5" 
                                                    : "border-slate-100 hover:border-slate-200",
                                                variant.stock === 0 && "opacity-50 cursor-not-allowed bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                                    selectedVariantId === variant.id ? "border-primary" : "border-slate-300"
                                                )}>
                                                    {selectedVariantId === variant.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                                </div>
                                                <span className="font-medium text-sm">{variant.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-sm text-slate-900">
                                                    {variant.price_override ? formatCurrency(variant.price_override) : formatCurrency(selectedProduct.price)}
                                                </div>
                                                <div className="text-[10px] font-medium text-slate-500">
                                                    Stok: {variant.stock}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProduct?.product_addons && selectedProduct.product_addons.length > 0 && (
                             <div className="space-y-3">
                                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">Tambahan (Add-ons)</h4>
                                <div className="grid gap-2">
                                    {selectedProduct.product_addons.map(addon => (
                                        <div 
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                selectedAddonIds.includes(addon.id)
                                                    ? "border-green-500 bg-green-50" 
                                                    : "border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                             <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-5 w-5 rounded-md border-2 flex items-center justify-center",
                                                    selectedAddonIds.includes(addon.id) ? "border-green-600 bg-green-600 text-white" : "border-slate-300"
                                                )}>
                                                     {selectedAddonIds.includes(addon.id) && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                </div>
                                                <span className="font-medium text-sm">{addon.name}</span>
                                            </div>
                                            <div className="font-bold text-sm text-slate-900">
                                                +{formatCurrency(addon.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Harga Item</p>
                            <p className="text-xl font-black text-primary">{formatCurrency(modalReviewPrice)}</p>
                        </div>
                        <Button onClick={confirmAddToOrder} className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                            Masuk Keranjang
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CONFIRMATION */}
            <ConfirmationModal 
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false)
                    setIsProcessing(false) // Reset loading state if cancelled
                }}
                onConfirm={confirmPayment}
                title="Konfirmasi Pembayaran"
                description={`Total transaksi sebesar ${formatCurrency(totalAmount)} via ${paymentMethod === 'cash' ? 'Tunai' : 'Digital'}${paymentMethod === 'gateway' ? ` (Termasuk biaya layanan ${formatCurrency(gatewayFee)})` : ''}. Lanjutkan proses?`}
                confirmText="Ya, Proses"
                variant="default"
            />

            {/* MOBILE FLOATING CART BUTTON */}
            {!isMobileCartOpen && cart.length > 0 && (
                <div className="fixed bottom-24 sm:bottom-32 left-0 right-0 px-4 sm:px-6 z-40 xl:hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <Button 
                        onClick={() => setIsMobileCartOpen(true)}
                        className="w-full h-16 sm:h-20 rounded-3xl shadow-[0_20px_50px_rgba(34,197,94,0.3)] text-base sm:text-lg font-black flex items-center justify-between px-6 sm:px-10 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 border-none group transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-white/20 backdrop-blur-md p-2 sm:p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                                <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div className="text-left">
                                <span className="block leading-none">Cek Keranjang</span>
                                <span className="text-white/70 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1 block">
                                    {cart.reduce((s, i) => s + i.quantity, 0)} Items
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="h-10 w-px bg-white/20 hidden sm:block" />
                            <span className="text-xl sm:text-2xl font-black bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm">{formatCurrency(totalAmount)}</span>
                        </div>
                    </Button>
                </div>
            )}
        </div>
    )
}
