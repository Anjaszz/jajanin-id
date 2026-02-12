"use client"

import { useState } from "react"
import { RatingModal } from "./rating-modal"
import { useRouter } from "next/navigation"

interface RatingTriggerProps {
  orderStatus: string
  orderId: string
  shopId: string
  shopName: string
  items: Array<{
    product_id: string
    name: string
  }>
}

export function RatingTrigger({
  orderStatus,
  orderId,
  shopId,
  shopName,
  items,
}: RatingTriggerProps) {
  const [isOpen, setIsOpen] = useState(orderStatus === 'completed')
  const router = useRouter()

  if (orderStatus !== 'completed') return null

  const handleClose = () => {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <RatingModal
      isOpen={isOpen}
      onClose={handleClose}
      orderId={orderId}
      shopId={shopId}
      shopName={shopName}
      items={items}
    />
  )
}
