'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestWithdrawal } from '@/app/actions/withdrawals'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function WithdrawalForm({ balance }: { balance: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await requestWithdrawal(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 3000)
    } else {
      setError(result.error || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <>
      <Button 
        variant="secondary" 
        className="h-12 px-6 font-bold shadow-lg shadow-black/10"
        onClick={() => setIsOpen(true)}
      >
        Tarik Saldo
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Tarik Saldo</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Dana akan dikirimkan ke rekening bank Anda dalam 1-3 hari kerja.
              </p>

              {success ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-green-700">Permintaan Dikirim!</h3>
                    <p className="text-sm text-muted-foreground">Admin akan segera memverifikasi penarikan Anda.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Jumlah Penarikan (Min. Rp 50.000)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                      <Input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        placeholder="0" 
                        className="pl-10 h-11"
                        min={50000}
                        max={balance}
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Maksimal tarik: <span className="font-bold text-foreground">Rp {balance.toLocaleString('id-ID')}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Input id="bankName" name="bankName" placeholder="Contoh: BCA, Mandiri, BRI" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="accountNumber">Nomor Rekening</Label>
                        <Input id="accountNumber" name="accountNumber" placeholder="123456789" required />
                     </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="accountHolder">Nama Pemilik</Label>
                        <Input id="accountHolder" name="accountHolder" placeholder="Sesuai buku tabungan" required />
                     </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 rounded-xl"
                      onClick={() => setIsOpen(false)}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 rounded-xl font-bold"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Konfirmasi
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
