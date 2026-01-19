import { getSellerOrders, updateOrderStatus } from '@/app/actions/seller-orders'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Clock, CheckCircle2, XCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { CompleteOrderButton } from '@/components/complete-order-button'

function BadgeItem({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) {
    const classes = {
        default: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        destructive: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
    }
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${(classes as any)[variant]}`}>{children}</span>
}

export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const { tab = 'pending' } = await searchParams
  const allOrders = await getSellerOrders()

  // Tab dynamic filtering
  const filteredOrders = allOrders.filter(order => {
    switch (tab) {
      case 'pending': 
        return ['pending_confirmation', 'paid', 'pending_payment'].includes(order.status)
      case 'processing':
        return ['accepted', 'processing', 'ready'].includes(order.status)
      case 'completed':
        return order.status === 'completed'
      case 'cancelled':
        return ['rejected', 'cancelled_by_seller', 'cancelled_by_buyer'].includes(order.status)
      default:
        return true
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment': return <BadgeItem variant="warning">Menunggu Bayar</BadgeItem>
      case 'pending_confirmation': return <BadgeItem variant="info">Perlu Konfirmasi</BadgeItem>
      case 'paid': return <BadgeItem variant="success">Sudah Dibayar</BadgeItem>
      case 'accepted': return <BadgeItem variant="info">Diterima</BadgeItem>
      case 'processing': return <BadgeItem variant="warning">Sedang Proses</BadgeItem>
      case 'ready': return <BadgeItem variant="success">Siap Diambil</BadgeItem>
      case 'completed': return <BadgeItem variant="success">Selesai</BadgeItem>
      case 'rejected': return <BadgeItem variant="destructive">Ditolak</BadgeItem>
      default: return <BadgeItem>{status}</BadgeItem>
    }
  }

  const tabs = [
    { id: 'pending', label: 'Menunggu', count: allOrders.filter(o => ['pending_confirmation', 'paid', 'pending_payment'].includes(o.status)).length },
    { id: 'processing', label: 'Proses', count: allOrders.filter(o => ['accepted', 'processing', 'ready'].includes(o.status)).length },
    { id: 'completed', label: 'Selesai', count: allOrders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', label: 'Batal', count: allOrders.filter(o => ['rejected', 'cancelled_by_seller', 'cancelled_by_buyer'].includes(o.status)).length },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Pesanan Toko</h1>
          <p className="text-muted-foreground mt-1">Kelola pesanan pelanggan dari satu tempat.</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-xl border">
          {tabs.map((t) => (
            <Link 
              key={t.id}
              href={`?tab=${t.id}`}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all relative",
                tab === t.id ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-2 bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                  {t.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: any) => (
            <Card key={order.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group">
              <div className="md:flex">
                <div className="p-6 flex-1 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                         </div>
                         <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block leading-none mb-1">ID PESANAN</span>
                            <span className="font-mono text-xs">#{order.id.slice(0, 8)}</span>
                         </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                         {getStatusBadge(order.status)}
                         <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                         </span>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Pelanggan</Label>
                          <h3 className="font-bold text-lg">{order.guest_info?.name || 'Pelanggan Terdaftar'}</h3>
                          <div className="text-sm font-medium">
                             <a href={`https://wa.me/${order.guest_info?.phone}`} target="_blank" className="text-primary hover:underline">
                               {order.guest_info?.phone || '-'}
                             </a>
                          </div>
                        </div>
                        
                        <div>
                           <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Pembayaran</Label>
                           <div className="text-sm">
                              {order.payment_method === 'gateway' ? (
                                <span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-blue-100 uppercase text-[10px]">
                                   GATEWAY
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded border border-slate-200 uppercase text-[10px]">
                                   TUNAI
                                </span>
                              )}
                           </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground block">Item</Label>
                         <div className="space-y-2">
                           {order.order_items.map((item: any) => (
                             <div key={item.id} className="text-sm flex justify-between items-center bg-card p-2 rounded-lg border shadow-xs">
                                <span className="font-medium">{item.quantity}x {item.products?.name}</span>
                             </div>
                           ))}
                         </div>
                         <div className="pt-2 border-t flex justify-between items-center text-primary">
                            <span className="font-bold">Total</span>
                            <span className="text-xl font-black">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-muted/10 p-6 md:border-l w-full md:w-64 flex flex-col gap-2 justify-center">
                   {['pending_confirmation', 'paid'].includes(order.status) && (
                      <div className="space-y-2">
                         <form action={async () => {
                           'use server'
                           await updateOrderStatus(order.id, 'accepted')
                         }}>
                           <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">Terima</Button>
                         </form>
                         <form action={async () => {
                           'use server'
                           await updateOrderStatus(order.id, 'rejected')
                         }}>
                           <Button variant="outline" className="w-full text-destructive border-red-200 hover:bg-red-50">Tolak</Button>
                         </form>
                      </div>
                   )}
                   {order.status === 'accepted' && (
                      <form action={async () => {
                        'use server'
                        await updateOrderStatus(order.id, 'ready')
                      }}>
                        <Button className="w-full bg-primary shadow-lg shadow-primary/20">Siap Diambil</Button>
                      </form>
                   )}
                   {order.status === 'ready' && (
                      <CompleteOrderButton orderId={order.id} className="w-full" />
                   )}
                   {order.status === 'completed' && (
                      <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 font-bold text-sm">
                         <CheckCircle2 className="h-5 w-5" />
                         <span>Selesai</span>
                      </div>
                   )}
                   {order.status === 'rejected' && (
                      <div className="flex items-center justify-center gap-2 text-destructive bg-red-50 p-3 rounded-xl border border-red-100 font-bold text-sm">
                         <XCircle className="h-5 w-5" />
                         <span>Ditolak</span>
                      </div>
                   )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border border-dashed shadow-xs">
             <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <Search className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-2xl font-bold">Tidak ada pesanan</h3>
             <p className="text-muted-foreground mt-1">Gunakan tab filter untuk melihat status lainnya.</p>
          </div>
        )}
      </div>
    </div>
  )
}
