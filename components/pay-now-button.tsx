'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    snap: any;
  }
}

interface PayNowButtonProps {
  orderId: string
  snapToken: string
  className?: string
}

export function PayNowButton({ orderId, snapToken, className }: PayNowButtonProps) {
  const [isPaying, setIsPaying] = useState(false)

  const handlePay = () => {
    if (typeof window !== 'undefined' && window.snap) {
      setIsPaying(true)
      window.snap.pay(snapToken, {
        onSuccess: (res: any) => {
          window.location.reload()
        },
        onPending: (res: any) => {
          window.location.reload()
        },
        onError: (res: any) => {
          alert('Pembayaran gagal, silakan coba lagi.')
          setIsPaying(false)
        },
        onClose: () => {
          setIsPaying(false)
        }
      })
    } else {
      alert('Sistem pembayaran belum siap. Mohon refresh halaman.')
    }
  }

  return (
    <Button 
      onClick={handlePay} 
      disabled={isPaying}
      className={className}
      size="lg"
    >
      {isPaying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Membuka Pembayaran...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Bayar Sekarang
        </>
      )}
    </Button>
  )
}
