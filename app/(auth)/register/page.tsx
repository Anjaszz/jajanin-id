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
import { Loader2 } from 'lucide-react'

type SignupForm = z.infer<typeof SignupSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'buyer', // Default to buyer, can be switched later or added as a field if mixed registration
    },
  })

  async function onSubmit(data: SignupForm) {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('role', 'seller') // For now, let's force Seller registration for the "Daftar Penjual" flow. 
                                      // Or we can add a toggle.
                                      // Based on landing page "Daftar Penjual", we assume seller.

    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
        <CardDescription>
          Mulai jualan online dengan mudah
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
            </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input 
                id="name" 
                placeholder="John Doe" 
                {...form.register('name')}
                disabled={isLoading}
            />
            {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
            </div>
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
            <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar Sekarang
            </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary hover:underline underline-offset-4">
            Masuk disini
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
