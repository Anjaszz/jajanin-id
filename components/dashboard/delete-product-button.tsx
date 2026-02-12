'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { ConfirmationModal } from '../confirmation-modal'
import { deleteProduct } from '@/app/actions/seller-products'
import { toast } from 'sonner'

interface DeleteProductButtonProps {
  productId: string
  productName: string
  disabled: boolean
}

export function DeleteProductButton({ 
  productId, 
  productName,
  disabled 
}: DeleteProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteProduct(productId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Produk "${productName}" berhasil dihapus`)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error("Terjadi kesalahan sistem saat menghapus produk")
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
        disabled={disabled || isPending}
        className="rounded-xl h-10 w-10 text-destructive border-red-100 dark:border-red-900/50 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shadow-sm"
        title="Hapus Produk"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Produk?"
        description={`Apakah Anda yakin ingin menghapus produk "${productName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  )
}
