'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { LoginSchema } from '@/types/auth-schema'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShoppingCart } from 'lucide-react'

type LoginForm = z.infer<typeof LoginSchema>

export default function BuyerLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginForm) {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } 
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center pb-8 border-b">
        <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-2">
           <ShoppingCart className="h-6 w-6 text-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Masuk Pembeli</CardTitle>
        <CardDescription>
          Lihat riwayat pesanan dan checkout lebih cepat.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center font-medium">
                {error}
            </div>
        )}
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
            <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput 
                id="password" 
                {...form.register('password')}
                disabled={isLoading}
            />
             {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
            </div>
            <Button className="w-full h-11 font-bold" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
            </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-6 bg-muted/20">
        <div className="text-sm text-muted-foreground text-center">
          Belum punya akun?{' '}
          <Link href="/buyer/register" className="text-primary hover:underline underline-offset-4 font-bold">
            Daftar Pembeli
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
} 
