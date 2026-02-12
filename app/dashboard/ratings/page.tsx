import { getSellerOrders } from '@/app/actions/seller-orders'
import { Card } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { Star, MessageSquare, Calendar as CalendarIcon, User } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default async function RatingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  const shopId = (shop as any)?.id

  // Fetch all ratings for this shop (both shop and product)
  const { data: ratings, error } = await (supabase.from("ratings") as any)
    .select(`
        *,
        products (name),
        profiles (name),
        orders (guest_info)
    `)
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching ratings:", error)
    // Handle error gracefully, e.g., return empty array or show error message
    // returning empty array for now as it handles the UI without crashing
  }

  const shopRatings = (ratings || []).filter((r: any) => r.type === "shop")
  const productRatings = (ratings || []).filter((r: any) => r.type === "product")

  const avgShopRating = shopRatings.length > 0 
    ? (shopRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / shopRatings.length).toFixed(1)
    : "0.0"

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Ulasan <span className="text-primary">Pelanggan</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          Lihat masukan dan penilaian dari para pembeli Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-3xl border-none shadow-xl bg-primary text-white flex flex-col items-center justify-center text-center">
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Rating Toko</p>
          <div className="flex items-center gap-3">
             <Star className="h-10 w-10 fill-white text-white" />
             <span className="text-5xl font-black">{avgShopRating}</span>
          </div>
          <p className="text-xs font-bold mt-2 opacity-80">{shopRatings.length} Ulasan Total</p>
        </Card>

        <Card className="p-6 rounded-3xl border-none shadow-lg bg-white dark:bg-slate-900 col-span-2">
           <h3 className="font-black text-lg mb-4">Ringkasan Rating</h3>
           <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(star => {
                const count = (ratings || []).filter((r: any) => r.rating === star).length
                const percentage = ratings && ratings.length > 0 ? (count / ratings.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                       <span className="text-sm font-black">{star}</span>
                       <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-8 text-right">{count}</span>
                  </div>
                )
              })}
           </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-xl flex items-center gap-2">
            Semua Ulasan
            <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">
                {(ratings || []).length}
            </span>
        </h3>

        <div className="grid gap-4">
          {(ratings || []).length > 0 ? (
            ratings?.map((rating: any) => (
              <Card key={rating.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">
                            {rating.profiles?.name || rating.orders?.guest_info?.name || "Pelanggan"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star 
                                        key={s} 
                                        className={cn(
                                            "h-3 w-3", 
                                            s <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                                        )} 
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(rating.created_at), 'dd MMM yyyy', { locale: id })}
                            </span>
                        </div>
                      </div>

                      <div className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit",
                        rating.type === 'shop' 
                            ? "bg-blue-50 text-blue-600 border border-blue-100" 
                            : "bg-purple-50 text-purple-600 border border-purple-100"
                      )}>
                        {rating.type === 'shop' ? "Ulasan Toko" : `Produk: ${rating.products?.name}`}
                      </div>
                    </div>

                    {rating.comment ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic">
                                "{rating.comment}"
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 font-bold">Tidak ada komentar.</p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-black">Belum ada ulasan</h3>
                <p className="text-slate-400 text-sm mt-1">Ulasan dari pelanggan akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
