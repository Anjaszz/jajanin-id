'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Power, Loader2 } from 'lucide-react'
import { ConfirmationModal } from '../confirmation-modal'
import { toggleProductStatus } from '@/app/actions/seller-products'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ToggleProductStatusButtonProps {
  productId: string
  isActive: boolean
  isShopDeactivated: boolean
}

export function ToggleProductStatusButton({ 
  productId, 
  isActive, 
  isShopDeactivated 
}: ToggleProductStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    setIsPending(true)
    try {
      const result = await toggleProductStatus(productId, isActive)
      if (result.success) {
        toast.success(isActive ? "Produk dinonaktifkan" : "Produk diaktifkan")
      } else {
        toast.error(result.error || "Gagal mengubah status produk")
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsPending(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button 
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline" 
        size="icon" 
        disabled={isShopDeactivated || isPending}
        className={cn(
            "rounded-xl h-10 w-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-sm",
            isActive ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30" : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title={isActive ? "Nonaktifkan" : "Aktifkan"}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Power className="h-4 w-4" />
        )}
      </Button>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleToggle}
        title={isActive ? "Nonaktifkan Produk?" : "Aktifkan Produk?"}
        description={
          isActive 
            ? "Produk ini akan disembunyikan dari katalog toko Anda dan pembeli tidak akan bisa melihatnya."
            : "Produk ini akan kembali muncul di katalog toko Anda dan siap dipesan oleh pembeli."
        }
        confirmText={isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        cancelText="Batal"
        variant={isActive ? "destructive" : "success"}
      />
    </>
  )
}
