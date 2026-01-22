"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

import * as React from 'react'

export default function VerifySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role: rawRole } = React.use(searchParams)
  const role = rawRole || 'buyer'
  const targetUrl = role === 'seller' ? '/dashboard' : '/'
  const targetLabel = role === 'seller' ? 'Masuk ke Dashboard Seller' : 'Mulai Belanja Sekarang'

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl animate-in zoom-in duration-500">
        <div className="h-2 bg-linear-to-r from-green-400 to-emerald-600" />
        <CardHeader className="pt-10">
          <div className="flex justify-center mb-6 relative">
            <div className="relative z-10 rounded-3xl bg-green-500 p-5 shadow-xl shadow-green-200 animate-bounce-subtle">
                <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
            <div className="absolute inset-0 bg-green-200 blur-3xl opacity-20 scale-150" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Verifikasi <span className="text-green-600">Berhasil!</span>
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-base pt-2">
            Akun Anda telah diaktifkan secara otomatis. Anda sekarang resmi menjadi bagian dari komunitas kami.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 italic text-slate-400 text-xs">
             "Kami telah menyiapkan segalanya untuk Anda. Silakan lanjutkan untuk menjelajahi fitur-fitur terbaik kami."
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-10 px-10">
          <Button 
            asChild 
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-lg transition-all group"
          >
            <Link href={targetUrl}>
                {targetLabel}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Satu Toko, Berjuta Kemudahan</p>
        </CardFooter>
      </Card>
      
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
