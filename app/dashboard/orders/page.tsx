import { getSellerOrders } from '@/app/actions/seller-orders'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { OrderList } from '@/components/dashboard/order-list'
import { createClient } from '@/utils/supabase/server'

export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const { tab = 'pending' } = await searchParams
  
  // Fetch only the first 10 for the current tab
  const initialOrders = await getSellerOrders(1, 10, tab)
  
  // Get counts for tabs - using a separate quick query
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  const shopId = (shop as any)?.id

  // Fetch counts in parallel if possible, or just a few small queries
  const getCount = async (tabName: string) => {
    let query = supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shop_id', shopId)
    if (tabName === 'payment_pending') query = query.eq('status', 'pending_payment').contains('payment_details', { type: 'pos_transaction' })
    else if (tabName === 'pending') query = query.in('status', ['pending_confirmation', 'paid'])
    else if (tabName === 'processing') query = query.in('status', ['accepted', 'processing', 'ready'])
    else if (tabName === 'completed') query = query.eq('status', 'completed')
    else if (tabName === 'cancelled') query = query.in('status', ['rejected', 'cancelled_by_seller', 'cancelled_by_buyer'])
    const { count } = await query
    return count || 0
  }

  const [countPaymentPending, countPending, countProcessing, countCompleted, countCancelled] = await Promise.all([
    getCount('payment_pending'),
    getCount('pending'),
    getCount('processing'),
    getCount('completed'),
    getCount('cancelled')
  ])

  const tabs = [
    { id: 'payment_pending', label: 'Menunggu Bayar', count: countPaymentPending },
    { id: 'pending', label: 'Pesanan Masuk', count: countPending },
    { id: 'processing', label: 'Proses', count: countProcessing },
    { id: 'completed', label: 'Selesai', count: countCompleted },
    { id: 'cancelled', label: 'Batal', count: countCancelled },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Pesanan <span className="text-primary">Toko</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Pantau dan kelola semua pesanan masuk secara real-time.</p>
        </div>
        
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl w-fit gap-1">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "default" : "ghost"}
              asChild
              className={cn(
                "rounded-xl h-10 px-4 text-xs font-black uppercase tracking-wider transition-all",
                tab === t.id 
                  ? "bg-white text-primary shadow-sm hover:bg-white" 
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              )}
            >
              <Link href={`?tab=${t.id}`}>
                {t.label}
                {t.count > 0 && (
                  <span className={cn(
                    "ml-2 flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] px-1.5",
                    tab === t.id ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {t.count}
                  </span>
                )}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <OrderList initialOrders={initialOrders} tab={tab} />
      </div>
    </div>
  )
}
