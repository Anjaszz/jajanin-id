import { getPublicOrderDetails } from "@/app/actions/public-orders"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle2, XCircle, MapPin, Phone, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { CompleteOrderButton } from "@/components/complete-order-button"
import { PayNowButton } from "@/components/pay-now-button"
import Script from "next/script"

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const order = await getPublicOrderDetails(orderId)

  if (!order) {
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusInfo = (status: string, scheduledFor?: string | null) => {
    const isScheduled = !!scheduledFor
    
    switch (status) {
      case 'pending_payment': return { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" /> }
      case 'paid': return { label: isScheduled ? 'Sudah Dijadwalkan' : 'Sudah Dibayar', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-4 w-4" /> }
      case 'pending_confirmation': return { label: 'Menunggu Konfirmasi', color: 'bg-orange-100 text-orange-700', icon: <Clock className="h-4 w-4" /> }
      case 'accepted': 
        if (isScheduled) {
           const formattedDate = new Date(scheduledFor!).toLocaleString('id-ID', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
           })
           return { label: `Dijadwalkan: ${formattedDate}`, color: 'bg-blue-600 text-white', icon: <Clock className="h-4 w-4" /> }
        }
        return { label: 'Sedang Diproses', color: 'bg-green-100 text-green-700', icon: <RefreshCw className="h-4 w-4 animate-spin" /> }
      case 'processing': return { label: 'Sedang Diproses', color: 'bg-indigo-100 text-indigo-700', icon: <RefreshCw className="h-4 w-4 animate-spin" /> }
      case 'ready': return { label: 'Siap Diambil/Dikirim', color: 'bg-teal-100 text-teal-700', icon: <ShoppingBag className="h-4 w-4" /> }
      case 'completed': return { label: 'Selesai', color: 'bg-green-600 text-white', icon: <CheckCircle2 className="h-4 w-4" /> }
      case 'rejected': return { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> }
      case 'cancelled_by_seller':
      case 'cancelled_by_buyer': return { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-4 w-4" /> }
      default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: null }
    }
  }

  const statusInfo = getStatusInfo(order.status, order.scheduled_for)
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

  return (
    <>
      {order.payment_method === 'gateway' && order.snap_token && (
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={clientKey}
          strategy="afterInteractive"
        />
      )}
      <div className="min-h-screen bg-muted/20 py-12 px-4">
      <div className="container max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
           <Button variant="ghost" asChild className="-ml-4">
              <Link href={`/${order.shops.slug}`}>
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Kembali ke Toko
              </Link>
           </Button>
           <p className="text-xs text-muted-foreground font-mono">ID: {order.id.slice(0, 8)}</p>
        </div>

        {/* Status Card */}
        <Card className="border-none shadow-xl overflow-hidden">
           <div className={cn("h-2 w-full", statusInfo.color.split(' ')[0])} />
           <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                 <div className={cn("p-3 rounded-full", statusInfo.color)}>
                    {statusInfo.icon}
                 </div>
              </div>
              <CardTitle className="text-2xl font-black">{statusInfo.label}</CardTitle>
              <CardDescription>
                 Dibuat pada {new Date(order.created_at).toLocaleString('id-ID', { 
                    dateStyle: 'long', 
                    timeStyle: 'short' 
                 })}
              </CardDescription>
              {order.payment_method === 'gateway' && order.status === 'pending_payment' && order.snap_token && (
                 <div className="pt-4 px-6 pb-2">
                    <PayNowButton orderId={order.id} snapToken={order.snap_token} className="w-full" />
                 </div>
              )}
              {order.status === 'ready' && (
                 <div className="pt-4 px-6 pb-2">
                    <CompleteOrderButton orderId={order.id} className="w-full" />
                 </div>
              )}
            </CardHeader>
             {/* Refund Notification Top */}
             {(order.status === 'rejected' || order.status === 'cancelled_by_seller' || order.status === 'cancelled_by_buyer') && 
              ['gateway', 'balance'].includes(order.payment_method) && (
                <div className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm flex gap-4 text-yellow-800 text-left">
                   <div className="shrink-0 mt-1 bg-yellow-100 p-2 rounded-full h-fit">
                      <RefreshCw className="h-5 w-5 text-yellow-700" />
                   </div>
                   {order.buyer_id ? (
                    <div>
                        <p className="font-bold text-lg">Dana Dikembalikan</p>
                        <p className="text-yellow-700/90 mt-1 mb-2">
                           Dana sebesar <span className="font-black bg-yellow-200/50 px-1 rounded">{formatCurrency(Number(order.total_amount))}</span> telah dikembalikan ke saldo dompet Anda.
                        </p>
                        <Button asChild size="sm" variant="outline" className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900 font-bold h-8 text-xs rounded-lg shadow-sm">
                           <Link href="/buyer/profile">
                              Cek Saldo Saya
                           </Link>
                        </Button>
                    </div>
                   ) : (
                    <div>
                        <p className="font-bold text-lg">Dana Disimpan Sementara</p>
                        <p className="text-yellow-700/90 mt-1 mb-2">
                           Dana sebesar <span className="font-black bg-yellow-200/50 px-1 rounded">{formatCurrency(Number(order.total_amount))}</span> telah aman disimpan di sistem.
                        </p>
                        <p className="text-xs text-yellow-700/80 mb-3 leading-relaxed">
                           Silakan <span className="font-bold">Daftar Akun</span> menggunakan email <span className="font-black underline decoration-yellow-500/50">{order.guest_info?.email}</span> untuk mengklaim saldo ini.
                        </p>
                        <Button asChild size="sm" className="bg-yellow-600 border-none text-white hover:bg-yellow-700 font-bold h-9 text-xs rounded-lg shadow-md transition-all active:scale-95">
                           <Link href="/buyer/register">
                              Daftar & Klaim Saldo
                           </Link>
                        </Button>
                    </div>
                   )}
                </div>
             )}
         </Card>

        {/* Shop Info */}
        <Card className="border-none shadow-lg">
           <CardHeader>
              <CardTitle className="text-lg">Informasi Toko</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                 <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
                 <div>
                    <p className="font-bold">{order.shops.name}</p>
                    <p className="text-sm text-muted-foreground">{order.shops.address}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <Phone className="h-5 w-5 text-primary" />
                 <p className="text-sm font-medium">{order.shops.whatsapp}</p>
              </div>
           </CardContent>
           <CardFooter className="bg-muted/30 border-t p-4">
              <Button variant="outline" className="w-full" asChild>
                 <a href={`https://wa.me/${order.shops.whatsapp.replace(/\D/g, '')}?text=Halo%20${order.shops.name},%20saya%20ingin%20tanya%20tentang%20pesanan%20saya%20dengan%20ID%20${order.id.slice(0, 8)}`} target="_blank">
                    Tanya Penjual via WhatsApp
                 </a>
              </Button>
           </CardFooter>
        </Card>

        {/* Order Items */}
        <Card className="border-none shadow-lg">
           <CardHeader>
              <CardTitle className="text-lg">Detail Pesanan</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              {order.order_items.map((item: any) => (
                 <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0 border">
                       {item.products?.image_url && <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold truncate">{item.products?.name || 'Produk'}</p>
                       <div className="flex flex-wrap gap-2 mt-1">
                           {item.product_variants && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">Varian: {item.product_variants.name}</span>
                           )}
                           {item.selected_addons && item.selected_addons.map((a: any, i: number) => (
                              <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border font-medium">+{a.name}</span>
                           ))}
                        </div>
                       <p className="text-sm text-muted-foreground mt-1">{item.quantity}x {formatCurrency(item.price_at_purchase)}</p>
                    </div>
                    <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                 </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground transition-all">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                 </div>
                 {order.gateway_fee > 0 && (
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Layanan</span>
                        <span className="font-medium">{formatCurrency(order.gateway_fee)}</span>
                     </div>
                 )}
                 <div className="flex justify-between font-black text-xl pt-2 border-t text-primary">
                    <span>Total Bayar</span>
                    <span>{formatCurrency(Number(order.total_amount) + Number(order.gateway_fee))}</span>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Buyer Info */}
        <Card className="border-none shadow-lg">
           <CardHeader>
              <CardTitle className="text-lg">Informasi Pembeli</CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                 <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Nama</p>
                 <p className="font-bold">{order.guest_info?.name || 'Customer'}</p>
              </div>
              <div>
                 <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">WhatsApp</p>
                 <p className="font-bold">{order.guest_info?.phone || '-'}</p>
              </div>
              <div>
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Metode Pembayaran</p>
                  <p className="font-bold uppercase">
                     {order.payment_method === 'gateway' ? 'Digital / QRIS' : 
                      order.payment_method === 'balance' ? 'Saldo Dompet' : 'Tunai / Cash'}
                  </p>
               </div>
               

              {order.scheduled_for && (
                 <div>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Dijadwalkan Untuk</p>
                    <p className="font-bold">{new Date(order.scheduled_for).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                 </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
