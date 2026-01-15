'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ChevronRight, Clock, ArrowLeft } from 'lucide-react'

export default function GuestOrdersClient({ shopSlug }: { shopSlug: string }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
    setOrders(savedOrders)
  }, [])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3">
        <div className="container max-w-2xl px-0 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${shopSlug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-heading font-bold text-lg">Pesanan Saya</h1>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-6 space-y-6">
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order: any) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="bg-primary/10 p-2 rounded-xl">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                       </div>
                       <div>
                          <p className="font-bold">{order.shopName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <Clock className="h-3 w-3" />
                             <span>{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                             <span>•</span>
                             <span className="font-mono uppercase">{order.id.slice(0, 8)}</span>
                          </div>
                       </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">Belum ada pesanan</p>
                <p className="text-sm text-muted-foreground">Pesanan yang Anda buat sebagai tamu akan muncul di sini.</p>
              </div>
              <Button asChild variant="outline" className="mt-4">
                 <Link href={`/${shopSlug}`}>Mulai Belanja</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
