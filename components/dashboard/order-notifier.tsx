"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { ShoppingBag } from "lucide-react"

interface OrderNotifierProps {
  shopId: string
}

export function OrderNotifier({ shopId }: OrderNotifierProps) {
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Hidden audio element for notification sound
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
    audioRef.current = audio

    const channel = supabase
      .channel(`new-orders-${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          console.log("New order received!", payload)
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio play failed:", err))
          }

          // Show toast
          toast("Pesanan Baru Masuk!", {
            description: `Ada pesanan baru dengan ID #${payload.new.id.slice(0, 8)}`,
            icon: <ShoppingBag className="h-5 w-5 text-primary" />,
            action: {
              label: "Lihat Pesanan",
              onClick: () => window.location.href = `/dashboard/orders?tab=pending`
            },
            duration: 10000,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [shopId, supabase])

  return null
}
