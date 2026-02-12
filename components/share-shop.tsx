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
  Globe,
  Image as ImageIcon,
  Upload,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface ShareShopProps {
  shopName: string
  shopSlug: string
}

export default function ShareShop({ shopName, shopSlug }: ShareShopProps) {
  // Ensure props are valid strings to prevent object rendering errors
  const safeShopName = typeof shopName === 'string' ? shopName : String(shopName || '')
  const safeShopSlug = typeof shopSlug === 'string' ? shopSlug : String(shopSlug || '')
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  
  // In a real app, you might want to use dynamic origin
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shopUrl = `${baseUrl}/${safeShopSlug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shopUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToWA = () => {
    window.open(`https://wa.me/?text=Ayo%20belanja%20di%20${encodeURIComponent(safeShopName)}!%20Cek%20katalognya%20di%20sini:%20${encodeURIComponent(shopUrl)}`, '_blank')
  }

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shopUrl)}&text=Ayo%20belanja%20di%20${encodeURIComponent(safeShopName)}!`, '_blank')
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
        downloadLink.download = `QR-${safeShopSlug}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  // Banner Maker State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [bannerType, setBannerType] = useState<'xbanner' | 'banner' | 'poster'>('xbanner')
  const [bannerConfig, setBannerConfig] = useState({
    qrSize: 150,
    qrX: 50, // Percentage
    qrY: 50, // Percentage
    showName: true,
    nameSize: 24,
    nameColor: '#000000',
    nameX: 50, // Percentage
    nameY: 80, // Percentage
  })
  const [customBanner, setCustomBanner] = useState<string | null>(null)
  const bannerRef = useRef<HTMLDivElement>(null)

  const bannerDefaults = {
    xbanner: { width: 300, height: 800, name: 'X-Banner (60x160)', ratio: 'aspect-[3/8]', bg: 'bg-linear-to-b from-blue-100 to-white' },
    banner: { width: 800, height: 300, name: 'Spanduk (3x1)', ratio: 'aspect-[8/3]', bg: 'bg-linear-to-r from-green-100 to-white' },
    poster: { width: 500, height: 700, name: 'Poster (A3)', ratio: 'aspect-[5/7]', bg: 'bg-linear-to-br from-purple-100 to-white' },
  }

  const handleDownloadBanner = async () => {
    if (!bannerRef.current) return
    
    // Simple implementation using canvas drawing
    // In a production app, html2canvas is recommended for better fidelity
    try {
        const container = bannerRef.current
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set dimensions based on the banner type defaults (high res)
        const typeConfig = bannerDefaults[bannerType]
        const scale = 2 // Higher resolution
        canvas.width = typeConfig.width * scale
        canvas.height = typeConfig.height * scale

        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // 1. Draw Background Image
        const bgImg = new Image();
        const bgLoaded = new Promise((resolve, reject) => {
            bgImg.onload = () => resolve(true);
            bgImg.onerror = () => resolve(false); // Resolve false on error to fallback
            
            // Use custom banner if available, otherwise default
            bgImg.src = customBanner || `/banner/${bannerType}-default.png`;
            
            // Enable CORS if images are external (not needed for local public folder usually but good practice)
            bgImg.crossOrigin = "anonymous"; 
        });

        const isBgLoaded = await bgLoaded;

        if (isBgLoaded) {
             ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            // Fallback Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
            if (bannerType === 'xbanner') { gradient.addColorStop(0, '#dbeafe'); gradient.addColorStop(1, '#ffffff'); }
            else if (bannerType === 'banner') { gradient.addColorStop(0, '#dcfce7'); gradient.addColorStop(1, '#ffffff'); }
            else { gradient.addColorStop(0, '#f3e8ff'); gradient.addColorStop(1, '#ffffff'); }
            
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // 2. Draw QR Code
        const qrSvg = container.querySelector('svg')
        if (qrSvg) {
            const svgData = new XMLSerializer().serializeToString(qrSvg)
            const img = new Image()
            await new Promise((resolve) => {
                img.onload = resolve
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
            })
            
            const qrW = bannerConfig.qrSize * scale
            const qrH = bannerConfig.qrSize * scale
            const qrX = (canvas.width * (bannerConfig.qrX / 100)) - (qrW / 2)
            const qrY = (canvas.height * (bannerConfig.qrY / 100)) - (qrH / 2)
            
            ctx.drawImage(img, qrX, qrY, qrW, qrH)
        }

        // 3. Draw Text
        if (bannerConfig.showName) {
            ctx.font = `bold ${bannerConfig.nameSize * scale}px sans-serif`
            ctx.fillStyle = bannerConfig.nameColor
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            const textX = canvas.width * (bannerConfig.nameX / 100)
            const textY = canvas.height * (bannerConfig.nameY / 100)
            ctx.fillText(safeShopName, textX, textY)
        }
        
        // Download
        const link = document.createElement('a')
        link.download = `${safeShopName}-${bannerType}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

    } catch (err) {
        console.error("Failed to generate banner", err)
        alert("Gagal membuat banner. Silakan coba lagi.")
    }
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
                 <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={downloadQR} className="h-9">
                        <Download className="mr-2 h-4 w-4" />
                        Save QR
                    </Button>
                    <Dialog open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-9 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Buat Banner
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/20">
                                <DialogTitle>Banner Maker</DialogTitle>
                                <DialogDescription>Buat materi promosi cetak untuk toko Anda dengan mudah.</DialogDescription>
                            </DialogHeader>
                            
                            <div className="flex-1 flex overflow-hidden">
                                {/* Preview Area */}
                                <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-8 flex items-center justify-center overflow-auto relative">
                                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                    
                                    <div 
                                        ref={bannerRef}
                                        className={cn(
                                            "relative shadow-2xl transition-all duration-500 bg-white flex items-center justify-center overflow-hidden",
                                            bannerDefaults[bannerType].ratio,
                                            bannerDefaults[bannerType].bg
                                        )}
                                        style={{ 
                                            width: bannerType === 'xbanner' ? '300px' : (bannerType === 'banner' ? '100%' : '500px'),
                                            maxWidth: '100%',
                                            aspectRatio: bannerType === 'xbanner' ? '3/8' : (bannerType === 'banner' ? '8/3' : '5/7')
                                        }}
                                    >
                                        {/* Background Image */}
                                        <img 
                                            src={customBanner || `/banner/${bannerType}-default.png`} 
                                            className="absolute inset-0 w-full h-full object-cover z-0" 
                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                            alt="Banner Background"
                                        />
                                        
                                        {/* Draggable Elements Simulation */}
                                        <div 
                                            className="absolute"
                                            style={{ 
                                                top: `${bannerConfig.qrY}%`, 
                                                left: `${bannerConfig.qrX}%`, 
                                                transform: 'translate(-50%, -50%)',
                                                width: `${bannerConfig.qrSize}px`,
                                                height: `${bannerConfig.qrSize}px`
                                            }}
                                        >
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <QRCodeSVG value={shopUrl} width="100%" height="100%" />
                                            </div>
                                        </div>

                                        {bannerConfig.showName && (
                                            <div 
                                                className="absolute text-center whitespace-nowrap font-bold"
                                                style={{ 
                                                    top: `${bannerConfig.nameY}%`, 
                                                    left: `${bannerConfig.nameX}%`, 
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: `${bannerConfig.nameSize}px`,
                                                    color: bannerConfig.nameColor
                                                }}
                                            >
                                                {safeShopName}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Controls Sidebar */}
                                <div className="w-80 border-l bg-background p-6 overflow-y-auto space-y-6 shrink-0 custom-scrollbar">
                                    <div className="space-y-3">
                                        <Label className="text-xs uppercase font-black text-muted-foreground">Tipe Banner</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['xbanner', 'banner', 'poster'] as const).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setBannerType(t)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-[10px] font-bold uppercase gap-1",
                                                        bannerType === t ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800 text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    <div className={cn("bg-current opacity-20", 
                                                        t === 'xbanner' ? 'w-3 h-8' : (t === 'banner' ? 'w-8 h-3' : 'w-5 h-7')
                                                    )} />
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Upload Section */}
                                    <div className="space-y-3">
                                        <Label className="text-xs uppercase font-black text-muted-foreground">Background Custom</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="relative w-full">
                                                    <Button variant="outline" className="w-full text-xs h-9 pointer-events-none">
                                                        <Upload className="mr-2 h-3.5 w-3.5" />
                                                        {customBanner ? 'Ganti Foto' : 'Upload Foto'}
                                                    </Button>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                const reader = new FileReader()
                                                                reader.onload = (e) => setCustomBanner(e.target?.result as string)
                                                                reader.readAsDataURL(file)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {customBanner && (
                                                <Button 
                                                    variant="destructive" size="icon" className="h-9 w-9 shrink-0"
                                                    onClick={() => setCustomBanner(null)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Upload desain {bannerType} Anda sendiri. Sistem akan menimpa QR & Nama Toko di atasnya.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs uppercase font-black text-muted-foreground">QR Code</Label>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>Ukuran</span>
                                                    <span>{bannerConfig.qrSize}px</span>
                                                </div>
                                                <Slider 
                                                    value={[bannerConfig.qrSize]} 
                                                    min={50} max={300} step={10}
                                                    onValueChange={([v]) => setBannerConfig(prev => ({ ...prev, qrSize: v }))} 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>Posisi Horizontal (X)</span>
                                                </div>
                                                <Slider 
                                                    value={[bannerConfig.qrX]} 
                                                    min={0} max={100} step={1}
                                                    onValueChange={([v]) => setBannerConfig(prev => ({ ...prev, qrX: v }))} 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>Posisi Vertikal (Y)</span>
                                                </div>
                                                <Slider 
                                                    value={[bannerConfig.qrY]} 
                                                    min={0} max={100} step={1}
                                                    onValueChange={([v]) => setBannerConfig(prev => ({ ...prev, qrY: v }))} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs uppercase font-black text-muted-foreground">Nama Toko</Label>
                                            <Button 
                                                variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full"
                                                onClick={() => setBannerConfig(prev => ({ ...prev, showName: !prev.showName }))}
                                            >
                                                {bannerConfig.showName ? <Check className="h-3 w-3 text-primary" /> : <div className="h-3 w-3 border rounded-sm" />}
                                            </Button>
                                        </div>
                                        
                                        {bannerConfig.showName && (
                                            <div className="space-y-3 animate-in slide-in-from-top-2">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                                        <span>Ukuran Font</span>
                                                        <span>{bannerConfig.nameSize}px</span>
                                                    </div>
                                                    <Slider 
                                                        value={[bannerConfig.nameSize]} 
                                                        min={12} max={100} step={2}
                                                        onValueChange={([v]) => setBannerConfig(prev => ({ ...prev, nameSize: v }))} 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                                        <span>Posisi X</span>
                                                    </div>
                                                    <Slider 
                                                        value={[bannerConfig.nameX]} 
                                                        min={0} max={100} step={1}
                                                        onValueChange={([v]) => setBannerConfig(prev => ({ ...prev, nameX: v }))} 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                                        <span>Posisi Y</span>
                                                    </div>
                                                    <Slider 
                                                        value={[bannerConfig.nameY]} 
                                                        min={0} max={100} step={1}
                                                        onValueChange={([v]) => setBannerConfig(prev => ({ ...prev, nameY: v }))} 
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                     <span className="text-[10px] text-muted-foreground">Warna:</span>
                                                     {['#000000', '#ffffff', '#ef4444', '#22c55e', '#3b82f6'].map(c => (
                                                        <button 
                                                            key={c}
                                                            onClick={() => setBannerConfig(prev => ({ ...prev, nameColor: c }))}
                                                            className={cn("w-5 h-5 rounded-full border shadow-sm", bannerConfig.nameColor === c && "ring-2 ring-offset-1 ring-primary")}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                     ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                            <div className="p-4 bg-muted/20 border-t flex justify-end gap-2 shrink-0">
                                <Button variant="outline" onClick={() => setIsBannerModalOpen(false)}>Batal</Button>
                                <Button onClick={handleDownloadBanner} className="min-w-[120px]">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                 </div>
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
