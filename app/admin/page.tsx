
import { getPendingWithdrawals, processWithdrawal } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Banknote, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Building,
  Info
} from 'lucide-react'

// Local components for the admin view
const WithdrawalCard = ({ withdrawal }: { withdrawal: any }) => {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
      <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Pending Request</span>
        </div>
        <span className="text-xs text-muted-foreground">{new Date(withdrawal.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
      </div>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Account Holder</Label>
                <div className="flex items-center gap-2 font-bold text-lg">
                  <User className="h-4 w-4 text-blue-500" />
                  {withdrawal.account_holder}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Bank Name</Label>
                    <p className="font-medium">{withdrawal.bank_name}</p>
                 </div>
                 <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Account Number</Label>
                    <p className="font-mono bg-muted inline-block px-1.5 rounded">{withdrawal.account_number}</p>
                 </div>
              </div>
              <div>
                 <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Shop Details</Label>
                 <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{withdrawal.wallet?.shop?.name || 'Unknown Shop'}</span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-blue-100">
              <Label className="text-[10px] uppercase font-bold text-blue-600 mb-2 block">Total Withdrawal</Label>
              <div className="text-4xl font-bold tracking-tighter text-blue-700">
                Rp {Number(withdrawal.amount).toLocaleString('id-ID')}
              </div>
              
              <div className="flex gap-2 mt-8 w-full">
                 <form action={async (formData) => {
                   'use server'
                   await processWithdrawal(withdrawal.id, 'rejected', formData.get('reason') as string)
                 }} className="flex-1 flex gap-2">
                    <Input name="reason" placeholder="Reject reason..." className="text-xs bg-white h-9" />
                    <Button variant="outline" size="sm" className="bg-white border-red-200 text-red-600 hover:bg-red-50 h-9">
                      <XCircle className="h-4 w-4" />
                    </Button>
                 </form>
                 <form action={async () => {
                   'use server'
                   await processWithdrawal(withdrawal.id, 'approved')
                 }}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9">
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                 </form>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Dummy/Reused UI Components locally to avoid missing imports in new page
const Label = ({ children, className }: any) => <span className={`text-sm font-medium leading-none ${className}`}>{children}</span>
const Input = ({ ...props }: any) => <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />

export default async function AdminDashboard() {
  const pendingRequests = await getPendingWithdrawals()

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 capitalize">
           Pending <span className="text-blue-600">Withdrawals</span>
        </h1>
        <p className="text-muted-foreground text-lg">Process payments for sellers in the marketplace.</p>
      </div>

      <div className="grid gap-6">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((req) => (
            <WithdrawalCard key={req.id} withdrawal={req} />
          ))
        ) : (
          <div className="bg-card border-none shadow-sm rounded-3xl p-16 text-center">
             <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Banknote className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-2xl font-bold mb-2">No pending withdrawals</h3>
             <p className="text-muted-foreground max-w-sm mx-auto">Great! All withdrawal requests have been processed.</p>
          </div>
        )}
      </div>

      <Card className="bg-slate-900 border-none rounded-3xl text-white overflow-hidden relative">
         <CardHeader className="relative z-10 pt-10 px-10">
            <CardTitle className="text-2xl">Langkah Keamanan</CardTitle>
            <CardDescription className="text-slate-400">Pastikan Anda memverifikasi nomor rekening sebelum menyetujui penarikan besar.</CardDescription>
         </CardHeader>
         <CardContent className="relative z-10 px-10 pb-10 space-y-4">
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
               <Info className="h-6 w-6 text-blue-400 shrink-0" />
               <p className="text-sm text-slate-300">Penarikan yang disetujui akan langsung mengurangi saldo dompet sistem secara permanen.</p>
            </div>
         </CardContent>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
      </Card>
    </div>
  )
}
