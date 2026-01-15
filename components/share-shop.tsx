'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Copy, 
  Share2, 
  Download, 
  Check, 
  MessageCircle, 
  Send, 
  Facebook,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ShareShopProps {
  shopName: string
  shopSlug: string
}

export default function ShareShop({ shopName, shopSlug }: ShareShopProps) {
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  
  // In a real app, you might want to use dynamic origin
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shopUrl = `${baseUrl}/${shopSlug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shopUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToWA = () => {
    window.open(`https://wa.me/?text=Ayo%20belanja%20di%20${encodeURIComponent(shopName)}!%20Cek%20katalognya%20di%20sini:%20${encodeURIComponent(shopUrl)}`, '_blank')
  }

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shopUrl)}&text=Ayo%20belanja%20di%20${encodeURIComponent(shopName)}!`, '_blank')
  }

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width + 40
      canvas.height = img.height + 40
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 20, 20)
        
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `QR-${shopSlug}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Card className="shadow-lg border-none bg-linear-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <Share2 className="h-5 w-5 text-primary" />
           Bagikan Toko
        </CardTitle>
        <CardDescription>Ajak pelanggan berbelanja dengan membagikan link atau QR Code toko Anda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Link Section */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Link Toko</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                readOnly 
                value={shopUrl} 
                className="pr-10 bg-background/50 h-11 font-medium text-primary"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Globe className="h-4 w-4 text-muted-foreground opacity-50" />
              </div>
            </div>
            <Button 
              onClick={copyToClipboard} 
              variant={copied ? "success" : "default"} 
              className="h-11 px-4 shadow-lg shadow-primary/20"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
           {/* QR Section */}
           <div className="space-y-4 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">QR Pesanan</p>
              <div className="flex flex-col items-center md:items-start gap-4">
                 <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-inner border">
                    <QRCodeSVG value={shopUrl} size={150} level="H" />
                 </div>
                 <Button variant="outline" size="sm" onClick={downloadQR} className="h-9">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                 </Button>
              </div>
           </div>

           {/* Social Section */}
           <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Media Sosial</p>
              <div className="grid grid-cols-2 gap-3">
                 <Button onClick={shareToWA} className="bg-[#25D366] hover:bg-[#20ba59] text-white border-none h-11">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                 </Button>
                 <Button onClick={shareToTelegram} className="bg-[#0088cc] hover:bg-[#0077b3] text-white border-none h-11">
                    <Send className="mr-2 h-4 w-4" />
                    Telegram
                 </Button>
                 <Button 
                    className="col-span-2 bg-[#1877F2] hover:bg-[#166fe5] text-white border-none h-11"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shopUrl)}`, '_blank')}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                 </Button>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
