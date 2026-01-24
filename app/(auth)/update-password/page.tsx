'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UpdatePasswordSchema } from '@/types/auth-schema'
import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShieldCheck } from 'lucide-react'

type UpdatePasswordForm = z.infer<typeof UpdatePasswordSchema>

function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'buyer'
  
  const form = useForm<UpdatePasswordForm>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: UpdatePasswordForm) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('password', data.password)

    const result = await updatePassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setSuccess(result.success)
      setIsLoading(false)
      // Redirect to specific login page after 3 seconds
      setTimeout(() => {
        if (role === 'admin') {
          router.push('/admin/login')
        } else if (role === 'seller') {
          router.push('/seller/login')
        } else {
          router.push('/buyer/login')
        }
      }, 3000)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center bg-primary/5 rounded-t-xl pb-8 border-b border-primary/10">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
           <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Atur Ulang Password</CardTitle>
        <CardDescription>
          Masukkan password baru Anda di bawah ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center font-medium">
                {error}
            </div>
        )}
        {success && (
            <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md text-center font-medium">
                {success}. Anda akan diarahkan ke halaman login sebentar lagi.
            </div>
        )}
        
        {!success && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password Baru</Label>
                <PasswordInput 
                    id="password" 
                    {...form.register('password')}
                    disabled={isLoading}
                />
                {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <PasswordInput 
                    id="confirmPassword" 
                    {...form.register('confirmPassword')}
                    disabled={isLoading}
                />
                {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button className="w-full h-11 font-bold" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Password
              </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl shadow-primary/5">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    }>
      <UpdatePasswordForm />
    </Suspense>
  )
}
