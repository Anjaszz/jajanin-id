
import { getAdminUsers } from '@/app/actions/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Store, Mail, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'seller' } = await searchParams
  const allUsers = await getAdminUsers()

  // Filter out admins and split by role
  const filteredUsers = allUsers.filter(user => {
    if (user.role === 'admin') return false
    return user.role === tab
  })

  const tabs = [
    { id: 'seller', label: 'Penjual', count: allUsers.filter(u => u.role === 'seller').length },
    { id: 'buyer', label: 'Pembeli', count: allUsers.filter(u => u.role === 'buyer').length },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 capitalize">
             Kelola <span className="text-blue-600">Pengguna</span>
          </h1>
          <p className="text-muted-foreground text-lg">Daftar pengguna aktif di platform YukJajan.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {tabs.map((t) => (
            <Link 
              key={t.id}
              href={`?tab=${t.id}`}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all relative flex items-center gap-2",
                tab === t.id ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {t.label}
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full",
                tab === t.id ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
              )}>
                {t.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl">{user.name || 'Anonymous'}</h3>
                        <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email || user.id.slice(0, 18) + '...'}</span>
                         {user.shops?.[0] && (
                           <span className="flex items-center gap-1 text-blue-600 font-medium">
                             <Store className="h-3 w-3" /> {user.shops[0].name}
                           </span>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-xl px-4 border-slate-200">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="rounded-xl px-4 border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Link href={`/admin/users/${user.id}`}>
                        Lihat Detail
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed shadow-sm">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                <Search className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-2xl font-bold text-slate-400">Tidak ada {tab === 'seller' ? 'Penjual' : 'Pembeli'}</h3>
             <p className="text-muted-foreground mt-1">Gunakan tab di atas untuk berpindah kategori.</p>
          </div>
        )}
      </div>
    </div>
  )
}
