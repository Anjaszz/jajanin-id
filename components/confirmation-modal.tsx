'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'success'
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'default'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const confirmColors = {
    default: 'bg-primary hover:bg-primary/90',
    destructive: 'bg-destructive hover:bg-destructive/90',
    success: 'bg-green-600 hover:bg-green-700'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-card border rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex items-center gap-3 p-6 pt-0">
          <Button variant="ghost" className="flex-1 rounded-xl h-12" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            className={cn("flex-1 rounded-xl h-12 font-bold shadow-lg", confirmColors[variant])} 
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
