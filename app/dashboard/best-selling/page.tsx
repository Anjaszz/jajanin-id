import { getBestSellingProducts } from "@/app/actions/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Trophy, ShoppingCart, Package } from "lucide-react";
import Image from "next/image";
import { PeriodSelector } from "@/components/dashboard/best-selling-tabs";
import { Suspense } from "react";

export default async function BestSellingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "today" } = await searchParams;
  const res = await getBestSellingProducts(period as any);

  if (!res.success) {
    return <div className="p-8 text-center text-red-500 italic">Gagal memuat data: {res.error}</div>;
  }

  const products = res.data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-20 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Produk <span className="text-green-600">Terlaris</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-medium max-w-2xl">
            Pantau produk yang paling banyak diminati oleh pelanggan Anda.
          </p>
        </div>

        {/* Period Selector - Client component to handle active state tab hydration */}
        <div className="w-full lg:w-auto">
          <Suspense fallback={<div className="h-12 w-full sm:w-64 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />}>
            <PeriodSelector />
          </Suspense>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <Card key={product.id} className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Package className="h-10 sm:h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-md",
                    index === 0 ? "bg-yellow-400 text-white" : 
                    index === 1 ? "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200" :
                    index === 2 ? "bg-orange-400 text-white" : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                  )}>
                    {index < 3 ? <Trophy className="h-4 w-4 sm:h-5 sm:w-5" /> : <span className="font-black text-[10px] sm:text-sm">#{index + 1}</span>}
                  </div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex flex-col min-h-12 sm:min-h-14">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">ID: {product.id.slice(0, 8)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-green-50 dark:bg-green-950/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                      <p className="text-[9px] sm:text-[10px] font-black text-green-600/60 dark:text-green-400/60 uppercase tracking-tighter">Terjual</p>
                      <p className="text-lg sm:text-xl font-black text-green-700 dark:text-green-400">{product.total_sold} <span className="text-[10px] sm:text-xs">Pcs</span></p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                      <p className="text-[9px] sm:text-[10px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-tighter">Omzet</p>
                      <p className="text-base sm:text-lg font-black text-blue-700 dark:text-blue-400 leading-tight" suppressHydrationWarning>
                        {formatCurrency(product.total_revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-8 sm:p-12 py-16 sm:py-20">
          <CardContent className="flex flex-col items-center justify-center text-center gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
                <ShoppingCart className="h-10 sm:h-12 text-slate-300 dark:text-slate-700" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Belum Ada Penjualan</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada produk yang terjual dalam periode ini.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
