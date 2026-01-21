"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface IncomeChartProps {
  data: {
    month: string
    amount: number
  }[]
}

export function IncomeChart({ data }: IncomeChartProps) {
  return (
    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-black tracking-tight">Grafik Pemasukan Bulanan</CardTitle>
        <CardDescription className="text-xs font-medium">Visualisasi pendapatan toko Anda tahun ini</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rp ${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border-none">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].payload.month}</p>
                        <p className="text-sm font-black whitespace-nowrap">
                          {formatCurrency(payload[0].value as number)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="amount"
                radius={[6, 6, 0, 0]}
                barSize={30}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === data.length - 1 ? "#16a34a" : "#dcfce7"} 
                    className="hover:fill-green-500 transition-colors duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
