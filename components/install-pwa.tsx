'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed the banner in this session
    const isDismissed = sessionStorage.getItem('pwa-banner-dismissed')
    if (isDismissed) return

    const handler = (e: any) => {
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      
      // Show the install banner if not already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (!isStandalone) {
         setIsVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
    setIsVisible(false)
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 shadow-[0_20px_50px_rgba(34,197,94,0.15)] rounded-xl px-6 py-4 md:w-[400px] flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        
        <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
           <Smartphone className="h-6 w-6 text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
           <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Install YukJajan</h4>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Akses kasir & belanja lebih cepat dari Home Screen.</p>
        </div>

        <div className="flex flex-col gap-1">
          <Button 
            size="sm" 
            onClick={handleInstallClick}
            className="h-8 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Pasang
          </Button>
          <button 
            onClick={handleDismiss}
            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border rounded-2xl px-3 py-1 font-bold uppercase tracking-tighter"
          >
            Nanti saja
          </button>
        </div>

        <button 
          onClick={handleDismiss}
          className="absolute top-1 right-1 text-slate-600 hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
