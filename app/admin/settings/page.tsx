import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Percent, ShieldCheck, Globe, Bell, Info } from 'lucide-react'
import { getSystemSettings } from '@/app/actions/system-settings'
import { SystemSettingsForm } from '@/components/admin/system-settings-form'

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings()

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 capitalize">
           Pengaturan <span className="text-blue-600">Sistem</span>
        </h1>
        <p className="text-muted-foreground text-lg">Konfigurasi parameter global platform YukJajan.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md overflow-hidden">
           <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Percent className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle>Biaya Platform & Gateway</CardTitle>
                    <CardDescription>Atur persentase potongan untuk setiap transaksi digital.</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <SystemSettingsForm initialSettings={settings} />
        </Card>

        <Card className="border-none shadow-md opacity-60">
           <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                    <Globe className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle>Pemeliharaan Sistem</CardTitle>
                    <CardDescription>Mode maintenance akan menghentikan seluruh aktivitas belanja sementara.</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dashed">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-slate-400" />
                    <span className="font-bold">Mode Pemeliharaan (Under Maintenance)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nonaktif</span>
                    <Button variant="outline" size="sm" disabled>Aktifkan</Button>
                 </div>
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-md opacity-60">
           <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                    <Bell className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle>Notifikasi Admin</CardTitle>
                    <CardDescription>Konfigurasi tujuan email/WhatsApp untuk setiap laporan sistem.</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-center py-4 italic text-muted-foreground">Fitur notifikasi admin sedang dalam pengembangan.</p>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
