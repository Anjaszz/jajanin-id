'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Check, Loader2 } from 'lucide-react'
import { syncWalletBalance } from '@/app/actions/wallet'
import { useRouter } from 'next/navigation'

export function SyncWalletButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncWalletBalance()
      if (result.success) {
        setIsSuccess(true)
        router.refresh()
        setTimeout(() => setIsSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to sync wallet:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSync}
      disabled={isSyncing}
      className="bg-background/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold dark:text-white"
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isSuccess ? (
        <Check className="h-4 w-4 mr-2 text-green-500" />
      ) : (
        <RefreshCcw className="h-4 w-4 mr-2" />
      )}
      {isSyncing ? 'Sinkronisasi...' : isSuccess ? 'Sinkron Berhasil' : 'Sinkron Saldo'}
    </Button>
  )
}
