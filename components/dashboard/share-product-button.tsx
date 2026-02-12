"use client"

import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShareProductButtonProps {
  shopSlug: string
  productId: string
  productName: string
}

export function ShareProductButton({ shopSlug, productId, productName }: ShareProductButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${shopSlug}?productId=${productId}`
    const shareData = {
      title: productName,
      text: `Yuk cek ${productName} di toko kami!`,
      url: shareUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Berhasil dibagikan!')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
          copyToClipboard(shareUrl)
        }
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success('Link produk berhasil disalin!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleShare}
      className="rounded-xl h-10 w-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
      title="Bagikan Produk"
    >
      {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
    </Button>
  )
}
