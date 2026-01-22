import { getSellerOrderById } from '@/app/actions/seller-orders'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Calendar, CreditCard, Package, User, MapPin, Receipt, ArrowLeft, Store, Phone, Banknote } from 'lucide-react'
import Link from 'next/link'
import { OrderStatusBadge } from '@/components/dashboard/order-status-badge'
import { OrderDetailActions } from './order-detail-actions'
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default async function OrderDetailPage({ 
    params 
}: { 
    params: Promise<{ orderId: string }> 
}) {
    const { orderId } = await params
    const order = await getSellerOrderById(orderId)

    if (!order) {
        notFound()
    }

    const { guest_info, order_items, payment_method, status, total_amount, created_at, snap_token } = order
    const guest = guest_info ? (typeof guest_info === 'string' ? JSON.parse(guest_info) : guest_info) : { name: 'Pelanggan' }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-slate-200 shrink-0">
                        <Link href="/dashboard/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                         <div className="flex items-center gap-3">
                             <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Order #{orderId.slice(0, 8)}
                             </h1>
                             <OrderStatusBadge status={status} />
                         </div>
                         <p className="text-slate-500 text-xs font-medium flex items-center gap-2 mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(created_at), "eeee, d MMMM yyyy • HH:mm", { locale: id })}
                         </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Main Content (Order Items) */}
                 <div className="md:col-span-2 space-y-6">
                      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                           <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <Package className="h-4 w-4 text-primary" />
                                    Rincian Pesanan
                                </CardTitle>
                           </CardHeader>
                           <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {order_items.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                                             <div className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                                 {item.products?.image_url ? (
                                                     <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-cover" />
                                                 ) : (
                                                     <div className="h-full w-full flex items-center justify-center">
                                                         <Package className="h-6 w-6 text-slate-300" />
                                                     </div>
                                                 )}
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                  <div className="flex justify-between items-start">
                                                      <div>
                                                          <h4 className="font-bold text-sm text-slate-900">{item.products?.name}</h4>
                                                          {/* Metadata (Variant/Addons) */}
                                                          {item.metadata && (
                                                              <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                                                                  {item.metadata.description && <p>{item.metadata.description}</p>}
                                                              </div>
                                                          )}
                                                      </div>
                                                      <p className="font-bold text-sm text-slate-900">{formatCurrency(item.subtotal)}</p>
                                                  </div>
                                                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">{item.quantity} x {formatCurrency(item.price_at_purchase)}</span>
                                                  </div>
                                             </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="p-6 bg-slate-50/30 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Subtotal Produk</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Biaya Layanan {payment_method === 'gateway' && '(Digital)'}</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(order.gateway_fee || 0)}</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-black text-slate-900">Total Pembayaran</span>
                                        <span className="text-xl font-black text-primary">{formatCurrency(total_amount + (order.gateway_fee || 0))}</span>
                                    </div>
                                    
                                    {/* Info for Seller */}
                                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                        <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            <span>Potongan Platform (App Fee)</span>
                                            <span className="text-red-500">-{formatCurrency(order.platform_fee || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                           </CardContent>
                      </Card>

                      {/* Actions */}
                      <OrderDetailActions 
                          orderId={orderId} 
                          status={status} 
                          paymentMethod={payment_method} 
                          snapToken={snap_token} 
                          createdAt={created_at}
                      />
                 </div>

                 {/* Sidebar (Customer Info & Payment) */}
                 <div className="space-y-6">
                      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                           <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <User className="h-4 w-4 text-primary" />
                                    Info Pelanggan
                                </CardTitle>
                           </CardHeader>
                           <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                         <User className="h-5 w-5" />
                                     </div>
                                     <div>
                                         <p className="font-bold text-sm text-slate-900">{guest.name}</p>
                                         <p className="text-xs text-slate-500">Pelanggan Umum</p>
                                     </div>
                                </div>
                                {guest.phone && (
                                     <div className="flex items-center gap-2 text-sm text-slate-600">
                                         <Phone className="h-4 w-4 text-slate-400" />
                                         <span>{guest.phone}</span>
                                     </div>
                                )}
                                {guest.address && (
                                     <div className="flex items-center gap-2 text-sm text-slate-600">
                                         <MapPin className="h-4 w-4 text-slate-400" />
                                         <span>{guest.address}</span>
                                     </div>
                                )}
                           </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                           <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Pembayaran
                                </CardTitle>
                           </CardHeader>
                           <CardContent className="p-6 space-y-4">
                                <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Metode</p>
                                     <div className="flex items-center gap-2 font-bold text-slate-900 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                         {payment_method === 'cash' ? <Banknote className="h-4 w-4 text-green-600" /> : <CreditCard className="h-4 w-4 text-blue-600" />}
                                         <span className="uppercase">{payment_method === 'gateway' ? 'Digital / QRIS' : 'Tunai'}</span>
                                     </div>
                                </div>
                                <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                     <OrderStatusBadge status={status} className="w-full justify-center h-9 text-xs" />
                                </div>
                           </CardContent>
                      </Card>
                 </div>
            </div>
        </div>
    )
}
