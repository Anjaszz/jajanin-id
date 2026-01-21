"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateOrderStatus, deletePosOrder } from "@/app/actions/seller-orders"
import { toast } from "sonner"
import { Loader2, CreditCard, Banknote, Receipt, CheckCircle2, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const DetailCountdownTimer = ({ createdAt, onExpire }: { createdAt: string, onExpire?: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [isExpired, setIsExpired] = useState(false)
    
    useEffect(() => {
        const expiryTime = new Date(createdAt).getTime() + 60 * 60 * 1000 

        const updateTimer = () => {
            const now = new Date().getTime()
            const distance = expiryTime - now

            if (distance < 0) {
                if (!isExpired) {
                    setIsExpired(true)
                    setTimeLeft("Expired")
                    if (onExpire) onExpire()
                }
                return
            }

            const maxDuration = 60 * 60 * 1000
            const effectiveDistance = distance > maxDuration ? maxDuration : distance

            const minutes = Math.floor(effectiveDistance / (1000 * 60))
            const seconds = Math.floor((effectiveDistance % (1000 * 60)) / 1000)

            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }

        updateTimer() // Initial call
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [createdAt, isExpired, onExpire])

    if (isExpired) return null

    return (
         <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-100 mb-4 animate-pulse">
            <div className="flex items-center gap-2 text-red-600">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold">Sisa Waktu Pembayaran</span>
            </div>
            <span className="text-lg font-black font-mono text-red-600">{timeLeft}</span>
        </div>
    )
}

interface OrderDetailActionsProps {
    orderId: string
    status: string
    paymentMethod: string
    snapToken?: string | null
    createdAt: string
}

export function OrderDetailActions({ orderId, status, paymentMethod, snapToken, createdAt }: OrderDetailActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleUpdateStatus = async (newStatus: string) => {
        setIsLoading(true)
        try {
            const result = await updateOrderStatus(orderId, newStatus)
            if (result.success) {
                toast.success("Status pesanan diperbarui")
                router.refresh()
            } else {
                toast.error("Gagal memperbarui status")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan")
        } finally {
            setIsLoading(false)
        }
    }

    // Payment Gateway Logic (Placeholder for now)
    const handlePayWithMidtrans = () => {
        if (snapToken) {
           // If we have snap token, trigger snap
           if (typeof window !== 'undefined' && (window as any).snap) {
                (window as any).snap.pay(snapToken, {
                    onSuccess: function(result: any){
                        toast.success("Pembayaran Berhasil!")
                        handleUpdateStatus('completed') // Or 'completed' directly
                    },
                    onPending: function(result: any){
                        toast.info("Menunggu pembayaran...")
                    },
                    onError: function(result: any){
                        toast.error("Pembayaran Gagal")
                    }
                })
           } else {
               toast.error("Snap library not loaded")
           }
        } else {
            // No token, maybe create one?
            // For POS, we definitely update to completed manually for now
            toast.info("Fitur Pembayaran Digital (Simulasi): Klik Konfirmasi untuk menyelesaikan.")
        }
    }

    // Auto trigger payment if newly created digital order
    const autoTriggerRef = useState(false)
    if (typeof window !== 'undefined' && !autoTriggerRef[0] && status === 'pending_payment' && paymentMethod === 'gateway' && snapToken) {
         // Tiny delay to ensure UI ready
         setTimeout(() => {
             handlePayWithMidtrans()
         }, 500)
         autoTriggerRef[1](true)
    }

    if (status === 'completed') {
        return (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 text-green-700">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                    <h4 className="font-bold text-sm">Transaksi Selesai</h4>
                    <p className="text-xs opacity-80">Pembayaran telah diterima dan pesanan selesai.</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto bg-white hover:bg-green-100 border-green-200 text-green-700 font-bold text-xs" onClick={() => window.print()}>
                    <Receipt className="mr-2 h-3.5 w-3.5" />
                    Cetak Struk
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-4">
            <h3 className="font-black text-sm text-slate-900">Tindakan Pesanan</h3>
            
             {status === 'pending_payment' && paymentMethod === 'gateway' && (
                <DetailCountdownTimer 
                    createdAt={createdAt}
                    onExpire={async () => {
                        const res = await deletePosOrder(orderId)
                        if (res.success) {
                            toast.error("Waktu Habis! Pesanan dihapus.")
                            router.push('/dashboard/pos')
                        }
                    }}
                />
             )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {status === 'pending_payment' && (
                    <>
                         {paymentMethod === 'gateway' ? (
                            <Button 
                                onClick={handlePayWithMidtrans}
                                disabled={isLoading}
                                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-900/10 col-span-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                Bayar via QRIS/Digital
                            </Button>
                         ) : (
                             <Button 
                                onClick={() => handleUpdateStatus('completed')}
                                disabled={isLoading}
                                variant="outline"
                                className="h-12 rounded-xl border-2 border-primary/10 hover:bg-primary/5 text-primary font-bold col-span-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Tandai Selesai (Manual)
                            </Button>
                         )}
                    </>
                )}

                {['pending_confirmation', 'paid', 'processing'].includes(status) && (
                     <Button 
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={isLoading}
                        className="h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                    >
                         {isLoading ? <Loader2 className="animate-spin" /> : "Selesaikan Pesanan"}
                    </Button>
                )}

                 {/* Cancel Option */}
                 {!['completed', 'cancelled_by_seller', 'cancelled_by_buyer', 'rejected'].includes(status) && (
                     <Button 
                        onClick={() => handleUpdateStatus('cancelled_by_seller')}
                        disabled={isLoading}
                        variant="ghost"
                        className="h-12 rounded-xl text-destructive hover:bg-red-50 font-bold"
                    >
                        Batalkan Pesanan
                    </Button>
                 )}
            </div>
        </div>
    )
}
