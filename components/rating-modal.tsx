"use client"

import { useState } from "react"
import { Star, MessageSquare, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { submitRating } from "@/app/actions/ratings"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  shopId: string
  shopName: string
  items: Array<{
    product_id: string
    name: string
  }>
}

export function RatingModal({
  isOpen,
  onClose,
  orderId,
  shopId,
  shopName,
  items,
}: RatingModalProps) {
  const [step, setStep] = useState(1) // 1: Shop, 2+: Products, Last: Success
  const [shopRating, setShopRating] = useState(0)
  const [shopComment, setShopComment] = useState("")
  const [productRatings, setProductRatings] = useState<Record<string, { rating: number; comment: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleProductRatingChange = (productId: string, rating: number) => {
    setProductRatings(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }))
  }

  const handleProductCommentChange = (productId: string, comment: string) => {
    setProductRatings(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }))
  }

  const handleSubmit = async () => {
    if (shopRating === 0) {
      toast.error("Berikan rating untuk toko terlebih dahulu")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Submit Shop Rating
      await submitRating({
        order_id: orderId,
        shop_id: shopId,
        rating: shopRating,
        comment: shopComment,
        type: "shop"
      })

      // 2. Submit Product Ratings
      for (const item of items) {
        const pRating = productRatings[item.product_id]
        if (pRating && pRating.rating > 0) {
          await submitRating({
            order_id: orderId,
            shop_id: shopId,
            product_id: item.product_id,
            rating: pRating.rating,
            comment: pRating.comment || "",
            type: "product"
          })
        }
      }

      setStep(items.length + 2) // Move to success step
      toast.success("Terima kasih atas ulasan Anda!")
    } catch (error) {
      toast.error("Gagal mengirim ulasan")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, onRate: (rating: number) => void) => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            className="group transition-transform active:scale-90"
          >
            <Star
              className={cn(
                "h-10 w-10 transition-colors",
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-200 group-hover:text-yellow-200"
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  const isLastProductStep = step === items.length + 1

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl overflow-hidden p-0 bg-white">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center text-primary leading-tight">
              Ulasan Pesanan
            </DialogTitle>
            <DialogDescription className="text-center font-bold text-slate-500">
              {step <= items.length + 1 ? `Langkah ${step} dari ${items.length + 1}` : "Selesai!"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Shop Rating */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <p className="font-black text-lg">Bagaimana pelayanan di {shopName}?</p>
                <p className="text-sm text-slate-500">Bantu kami meningkatkan kualitas layanan ya!</p>
              </div>

              {renderStars(shopRating, setShopRating)}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Komentar (Opsional)
                </label>
                <Textarea
                  placeholder="Ceritakan pengalamanmu belanja di sini..."
                  value={shopComment}
                  onChange={(e) => setShopComment(e.target.value)}
                  className="rounded-2xl border-slate-200 focus:ring-primary/20 resize-none h-24"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={shopRating === 0}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20"
              >
                Lanjut ke Rating Produk
              </Button>
            </div>
          )}

          {/* Steps for Products */}
          {items.map((item, index) => {
            const currentStep = index + 2
            if (step !== currentStep) return null

            const pRating = productRatings[item.product_id]?.rating || 0
            const pComment = productRatings[item.product_id]?.comment || ""

            return (
              <div key={item.product_id} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                  <p className="font-black text-lg">Gimana rasa {item.name}?</p>
                  <p className="text-sm text-slate-500">Penilaianmu sangat berharga!</p>
                </div>

                {renderStars(pRating, (val) => handleProductRatingChange(item.product_id, val))}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" />
                    Komentar (Opsional)
                  </label>
                  <Textarea
                    placeholder="Apa yang paling kamu suka dari produk ini?"
                    value={pComment}
                    onChange={(e) => handleProductCommentChange(item.product_id, e.target.value)}
                    className="rounded-2xl border-slate-200 focus:ring-primary/20 resize-none h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                        className="h-14 rounded-2xl font-bold"
                    >
                        Kembali
                    </Button>
                    <Button
                        onClick={() => {
                            if (isLastProductStep) {
                                handleSubmit()
                            } else {
                                setStep(step + 1)
                            }
                        }}
                        disabled={isSubmitting}
                        className="h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            isLastProductStep ? "Kirim Ulasan" : "Selanjutnya"
                        )}
                    </Button>
                </div>
              </div>
            )
          })}

          {/* Success Step */}
          {step > items.length + 1 && (
            <div className="text-center space-y-6 py-10 animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
               </div>
               <div>
                  <h3 className="text-2xl font-black">Terima Kasih!</h3>
                  <p className="text-slate-500 mt-2 font-medium">Ulasanmu telah berhasil dikirim.</p>
               </div>
               <Button
                onClick={onClose}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm"
               >
                 Tutup Halaman
               </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
