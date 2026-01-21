'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ConfirmationModal } from './confirmation-modal'
import { updateOrderStatus } from '@/app/actions/seller-orders'
import { cn } from '@/lib/utils'

interface CompleteOrderButtonProps {
  orderId: string
  className?: string
  onSuccess?: () => void
}

export function CompleteOrderButton({ orderId, className, onSuccess }: CompleteOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setIsPending(true)
    try {
      await updateOrderStatus(orderId, 'completed')
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (error) {
      console.error('Failed to complete order:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={cn("bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-600/20", className)}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Selesaikan Pesanan
      </Button>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleComplete}
        title="Selesaikan Pesanan?"
        description="Pastikan pesanan sudah diterima dengan baik. Setelah diselesaikan, pesanan tidak dapat dibatalkan."
        confirmText="Ya, Selesai"
        cancelText="Belum"
        variant="success"
      />
    </>
  )
}
