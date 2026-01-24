'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ForgotPasswordSchema } from '@/types/auth-schema'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react'

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>

function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'buyer'
  
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: ForgotPasswordForm) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('role', role)

    const result = await resetPassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setSuccess(result.success)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center bg-primary/5 rounded-t-xl pb-8 border-b border-primary/10">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
           <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email Anda untuk menerima instruksi reset password.
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
                {success}
            </div>
        )}
        
        {!success && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@email.com" 
                  {...form.register('email')}
                  disabled={isLoading}
              />
              {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
              </div>
              <Button className="w-full h-11 font-bold" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Instruksi Reset
              </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/20 rounded-b-xl">
        <button 
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-colors mt-2 w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      </CardFooter>
    </Card>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl shadow-primary/5">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}
