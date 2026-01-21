"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminNavItemProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}

export function AdminNavItem({ href, icon, children }: AdminNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
        isActive 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      <div className={cn(
        "transition-colors",
        isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"
      )}>
        {icon}
      </div>
      {children}
    </Link>
  )
}
