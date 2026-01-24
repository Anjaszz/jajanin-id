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
    console.log("OrderNotifier: Initializing subscription for shop:", shopId)
    
    // Hidden audio element for notification sound
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
    audio.preload = "auto"
    audioRef.current = audio

    const channel = supabase
      .channel(`realtime-orders-${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          console.log("OrderNotifier: NEW ORDER RECEIVED!", payload)
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.warn("OrderNotifier: Audio play failed (user interaction might be needed):", err))
          }

          // Show toast
          toast.success("Pesanan Baru!", {
            description: `Pesanan #${payload.new.id.slice(0, 8)} telah masuk.`,
            icon: <ShoppingBag className="h-5 w-5" />,
            action: {
              label: "Buka Pesanan",
              onClick: () => window.location.href = `/dashboard/orders?tab=pending`
            },
            duration: 15000,
          })
        }
      )
      .subscribe((status) => {
        console.log("OrderNotifier: Subscription status:", status)
        if (status === 'CHANNEL_ERROR') {
          console.error("OrderNotifier: System failed to connect to real-time. Please ensure 'Realtime' is enabled for 'orders' table in Supabase Dashboard.")
        }
      })

    return () => {
      console.log("OrderNotifier: Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [shopId, supabase])

  return null
}
