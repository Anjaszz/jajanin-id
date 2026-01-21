import { getIncomeData } from "@/app/actions/finance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock, Calendar, Wallet, ShoppingBag, Minus } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { IncomeHistory } from "@/components/dashboard/income-history"
import { IncomeChart } from "@/components/dashboard/income-chart"

export default async function IncomePage() {
  const data = await getIncomeData()

  if (!data) return <div className="p-8 text-center text-muted-foreground italic">Toko belum tersedia.</div>

  const { transactions, totalIncome } = data

  // Monthly stats for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthIdx = now.getMonth()
  
  const monthlyData = months.map((month, idx) => {
    const amount = transactions
      .filter((tx: any) => {
        const txDate = new Date(tx.created_at)
        return txDate.getMonth() === idx && txDate.getFullYear() === currentYear
      })
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
    
    return { month, amount }
  })

  // Current vs Last Month Calculation
  const thisMonthIncome = monthlyData[currentMonthIdx].amount
  const lastMonthIncome = currentMonthIdx > 0 
    ? monthlyData[currentMonthIdx - 1].amount 
    : transactions
        .filter((tx: any) => {
          const txDate = new Date(tx.created_at)
          return txDate.getMonth() === 11 && txDate.getFullYear() === currentYear - 1
        })
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

  const monthDiff = thisMonthIncome - lastMonthIncome
  const monthPercent = lastMonthIncome > 0 ? (monthDiff / lastMonthIncome) * 100 : 0

  // Today vs Yesterday Calculation
  const today = new Date()
  today.setHours(0,0,0,0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayIncome = transactions
    .filter((tx: any) => {
      const txDate = new Date(tx.created_at)
      txDate.setHours(0,0,0,0)
      return txDate.getTime() === today.getTime()
    })
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

  const yesterdayIncome = transactions
    .filter((tx: any) => {
      const txDate = new Date(tx.created_at)
      txDate.setHours(0,0,0,0)
      return txDate.getTime() === yesterday.getTime()
    })
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

  const dayDiff = todayIncome - yesterdayIncome
  const dayPercent = yesterdayIncome > 0 ? (dayDiff / yesterdayIncome) * 100 : 0

  function GrowthIndicator({ percent, diff }: { percent: number, diff: number }) {
    if (diff === 0 && percent === 0) return (
      <div className="mt-4 flex items-center gap-1.5 text-slate-400">
        <Minus className="h-3 w-3" />
        <span className="text-[10px] font-black uppercase tracking-tighter">Stagnan</span>
      </div>
    )
    
    const isPositive = diff > 0
    return (
      <div className={cn(
        "mt-4 flex items-center gap-1",
        isPositive ? "text-green-400" : "text-red-400"
      )}>
        <div className={cn(
          "p-1 rounded-lg",
          isPositive ? "bg-green-400/10" : "bg-red-400/10"
        )}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        </div>
        <span className="text-[10px] font-black uppercase tracking-tight">
          {isPositive ? "+" : ""}{percent.toFixed(1)}% {isPositive ? "Naik" : "Turun"}
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Laporan <span className="text-green-600">Pemasukan</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-lg font-medium max-w-2xl">
          Analisis performa finansial toko Anda secara detail dan transparan.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Income */}
        <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Akumulasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{formatCurrency(totalIncome)}</div>
            <div className="mt-4 flex items-center gap-2 text-green-400">
               <div className="p-1 bg-green-400/10 rounded-lg">
                  <TrendingUp className="h-3.5 w-3.5" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-tighter">Performa Stabil</span>
            </div>
          </CardContent>
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Wallet className="h-24 w-24" />
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="border-none shadow-xl bg-white border border-green-50 rounded-3xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bulan Ini ({months[currentMonthIdx]})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900">{formatCurrency(thisMonthIncome)}</div>
            <GrowthIndicator percent={Math.abs(monthPercent)} diff={monthDiff} />
          </CardContent>
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
             <Calendar className="h-24 w-24" />
          </div>
        </Card>

        {/* Today's Income */}
        <Card className="border-none shadow-xl bg-green-600 text-white rounded-3xl overflow-hidden relative group hidden lg:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-green-200">Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{formatCurrency(todayIncome)}</div>
            <div className="mt-4 flex items-center gap-1">
               <div className="p-1 bg-white/20 rounded-lg">
                  {dayDiff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
               </div>
               <span className="text-[10px] font-black uppercase tracking-tight text-green-100">
                  {dayDiff >= 0 ? "+" : ""}{Math.abs(dayPercent).toFixed(1)}% vs Kemarin
               </span>
            </div>
          </CardContent>
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
             <TrendingUp className="h-24 w-24" />
          </div>
        </Card>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Chart Section - Full Width */}
        <IncomeChart data={monthlyData} />

        {/* History Section - Full Width */}
        <IncomeHistory initialTransactions={transactions} />
      </div>
    </div>
  )
}
