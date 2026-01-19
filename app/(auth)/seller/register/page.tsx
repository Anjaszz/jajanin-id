'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { SignupSchema } from '@/types/auth-schema'
import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Store } from 'lucide-react'

type SignupForm = z.infer<typeof SignupSchema>

export default function SellerRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: 'Seller Baru', // Default placeholder name, since we removed the input
      email: '',
      password: '',
      role: 'seller', 
    },
  })

  async function onSubmit(data: SignupForm) {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', 'Seller Baru') // Send placeholder
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('role', 'seller') 

    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center bg-primary/5 rounded-t-xl pb-8 border-b border-primary/10">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
           <Store className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Daftar Toko Baru</CardTitle>
        <CardDescription>
          Mulai bisnis online Anda sekarang. Gratis.
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
            <Label htmlFor="email">Email Bisnis</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="bisnis@email.com" 
                {...form.register('email')}
                disabled={isLoading}
            />
            {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
            </div>
            <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
                id="password" 
                type="password" 
                {...form.register('password')}
                disabled={isLoading}
            />
             {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
            </div>
            <Button className="w-full h-11 font-bold" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Akun Seller
            </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-6 bg-muted/20 rounded-b-xl">
        <div className="text-sm text-muted-foreground text-center">
          Sudah punya akun?{' '}
          <Link href="/seller/login" className="text-primary hover:underline underline-offset-4 font-bold">
            Masuk disini
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
