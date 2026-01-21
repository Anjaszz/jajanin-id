"use client"
import React from 'react'
import { cn } from "@/lib/utils"

function BadgeItem({ children, variant = 'default', className }: { children: React.ReactNode, variant?: string, className?: string }) {
    const classes = {
        default: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        destructive: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
    }
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight",
            (classes as any)[variant],
            className
        )}>
            {children}
        </span>
    )
}

export function OrderStatusBadge({ status, className }: { status: string, className?: string }) {
    switch (status) {
        case 'pending_payment': return <BadgeItem variant="warning" className={className}>Menunggu Bayar</BadgeItem>
        case 'pending_confirmation': return <BadgeItem variant="info" className={className}>Perlu Konfirmasi</BadgeItem>
        case 'paid': return <BadgeItem variant="success" className={className}>Lunas</BadgeItem>
        case 'accepted': return <BadgeItem variant="info" className={className}>Diproses</BadgeItem>
        case 'processing': return <BadgeItem variant="warning" className={className}>Sedang Disiapkan</BadgeItem>
        case 'ready': return <BadgeItem variant="success" className={className}>Siap Diambil</BadgeItem>
        case 'completed': return <BadgeItem variant="success" className={className}>Selesai</BadgeItem>
        case 'rejected': return <BadgeItem variant="destructive" className={className}>Ditolak</BadgeItem>
        case 'cancelled_by_seller': return <BadgeItem variant="destructive" className={className}>Dibatalkan Toko</BadgeItem>
        case 'cancelled_by_buyer': return <BadgeItem variant="destructive" className={className}>Dibatalkan Pembeli</BadgeItem>
        default: return <BadgeItem className={className}>{status}</BadgeItem>
    }
}
