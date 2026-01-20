'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Package, Store, Loader2 } from "lucide-react"
import { getBuyerOrders } from '@/app/actions/buyer'

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState(false)

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Menunggu Pembayaran'
      case 'pending_confirmation': return 'Perlu Konfirmasi'
      case 'paid': return 'Sudah Dibayar'
      case 'accepted': return 'Diterima'
      case 'processing': return 'Sedang Proses'
      case 'ready': return 'Siap Diambil'
      case 'completed': return 'Selesai'
      case 'rejected': return 'Ditolak'
      case 'cancelled_by_seller':
      case 'cancelled_by_buyer': return 'Dibatalkan'
      default: return status.replace('_', ' ')
    }
  }

  useEffect(() => {
    // If we have initial orders (meaning user is logged in), don't do anything
    if (initialOrders.length > 0) return

    // Check if there are guest orders in localStorage
    const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
    if (guestOrders.length > 0) {
      setLoading(true)
      const orderIds = guestOrders.map((o: any) => o.id)
      
      getBuyerOrders(orderIds).then(data => {
        setOrders(data)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [initialOrders])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat pesanan Anda...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 border-none rounded-3xl bg-card shadow-sm">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
           <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-bold text-xl">Belum ada pesanan</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto mb-8">
           Anda belum memiliki riwayat pesanan. Jika Anda pernah memesan melalui perangkat lain, silakan masuk ke akun Anda.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
           <Button asChild className="rounded-full px-8">
              <Link href="/buyer/login">Masuk</Link>
           </Button>
           <Button variant="outline" asChild className="rounded-full px-8">
              <Link href="/">Mulai Belanja</Link>
           </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 pb-20">
      {orders.map((order: any) => (
        <Card key={order.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group">
          <CardHeader className="bg-muted/40 p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
              <span className="mx-1">•</span>
              <span className="font-mono text-[10px]">#{order.id.slice(0, 8)}</span>
            </div>
            <Badge 
              variant={order.status === 'paid' || order.status === 'completed' ? 'default' : 'secondary'} 
              className={cn(
                "rounded-full uppercase text-[10px] font-bold px-3",
                (order.status === 'paid' || order.status === 'completed' || order.status === 'accepted') && "bg-green-500 hover:bg-green-600 text-white border-none",
                order.status === 'pending_payment' && "bg-yellow-500 hover:bg-yellow-600 text-white border-none",
                (order.status === 'rejected' || order.status.startsWith('cancelled')) && "bg-red-500 hover:bg-red-600 text-white border-none"
              )}
            >
              {getStatusLabel(order.status)}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="font-bold text-lg leading-none">{order.shop?.name}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Klik detail untuk info lengkap</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-full">
                  <Link href={`/orders/${order.id}`}>
                      Detail
                  </Link>
                </Button>
             </div>
             
             <div className="h-1 bg-muted/30 rounded-full my-4" />
             
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Belanja</p>
                   <p className="font-black text-xl text-primary">{formatCurrency(order.total_amount)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-medium text-muted-foreground">
                      {order.items?.length || 0} Item dipesan
                   </p>
                </div>
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
