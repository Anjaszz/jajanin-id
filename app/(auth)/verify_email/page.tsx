
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
        </div>
        <CardTitle>Cek Email Anda</CardTitle>
        <CardDescription>
          Kami telah mengirimkan link verifikasi ke email yang Anda daftarkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
            Silakan klik link di email tersebut untuk mengaktifkan akun Anda.
            Jika tidak masuk, cek folder spam.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
            <Link href="/login">Kembali ke Login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
