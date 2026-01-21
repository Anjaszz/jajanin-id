"use client"

import { useState } from 'react'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateSystemSettings } from '@/app/actions/system-settings'
import { Loader2 } from 'lucide-react'

interface SystemSettingsFormProps {
  initialSettings: {
    platform_fee: number
    gateway_fee: number
  }
}

export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [platformFee, setPlatformFee] = useState(initialSettings.platform_fee)
  const [gatewayFee, setGatewayFee] = useState(initialSettings.gateway_fee)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateSystemSettings({
        platform_fee: Number(platformFee),
        gateway_fee: Number(gatewayFee)
      })

      if (result.success) {
        toast.success("Pengaturan berhasil disimpan")
      } else {
        toast.error(result.error || "Gagal menyimpan pengaturan")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Biaya Platform (Application Fee %)</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                step="0.1"
                value={platformFee} 
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
              />
              <Button variant="outline" disabled>%</Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Biaya yang diambil oleh YukJajan dari total transaksi.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Biaya Gateway (MDR %)</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                step="0.01"
                value={gatewayFee} 
                onChange={(e) => setGatewayFee(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
              />
              <Button variant="outline" disabled>%</Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Biaya standar Midtrans/Payment Gateway.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-6 pr-6">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 ml-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </CardFooter>
    </>
  )
}
