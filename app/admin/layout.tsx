
import { isAdmin } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Banknote, 
  Users, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'

import { signOutSeller } from '@/app/actions/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-slate-900 text-white px-4 py-8 md:flex">
        <div className="mb-10 flex items-center gap-2 px-2 font-heading font-bold text-2xl tracking-tight">
          <ShieldCheck className="h-8 w-8 text-blue-400" />
          <span>Admin Panel</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <AdminNavItem href="/admin" icon={<LayoutDashboard className="h-5 w-5" />}>
            Overview
          </AdminNavItem>
          <AdminNavItem href="/admin/withdrawals" icon={<Banknote className="h-5 w-5" />}>
            Withdrawals
          </AdminNavItem>
          <AdminNavItem href="/admin/users" icon={<Users className="h-5 w-5" />}>
            Manage Users
          </AdminNavItem>
          <AdminNavItem href="/admin/settings" icon={<Settings className="h-5 w-5" />}>
            Global Settings
          </AdminNavItem>
        </nav>

        <form action={signOutSeller}>
           <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <LogOut className="h-5 w-5" />
              Keluar Admin
           </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Dashboard</span>
           </div>
        </header>

        <div className="flex-1 p-8">
            {children}
        </div>
      </main>
    </div>
  )
}

function AdminNavItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white group"
    >
      <div className="text-slate-500 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      {children}
    </Link>
  )
}
