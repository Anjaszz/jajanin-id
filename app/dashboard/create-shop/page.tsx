'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createShop } from '@/app/actions/shop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Store } from 'lucide-react'

// Duplicate schema for client validation match
const CreateShopSchema = z.object({
  name: z.string().min(3, { message: "Nama toko minimal 3 karakter" }),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().optional(),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  google_maps_link: z.string().url("Link Google Maps harus berupa URL valid").optional().or(z.literal("")),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
})

type CreateShopForm = z.infer<typeof CreateShopSchema>

export default function CreateShopPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<CreateShopForm>({
    resolver: zodResolver(CreateShopSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      address: '',
      google_maps_link: '',
      whatsapp: '',
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    form.setValue('name', name)
    form.setValue('slug', slug)
  }

  async function onSubmit(data: CreateShopForm) {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('slug', data.slug)
    formData.append('address', data.address)
    formData.append('whatsapp', data.whatsapp)
    if (data.google_maps_link) formData.append('google_maps_link', data.google_maps_link)
    if (data.description) formData.append('description', data.description)

    const result = await createShop(formData)
    
    if (result?.error) {
        // Handle specific object errors or string error
        if (typeof result.error === 'string') {
             setError(result.error)
        } else {
            setError("Gagal membuat toko. Periksa kembali inputan Anda.")
        }
        setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
        <Card className="w-full max-w-lg">
        <CardHeader>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Store className="w-6 h-6 text-primary" />
                </div>
            </div>
            <CardTitle>Buat Toko Pertama Anda</CardTitle>
            <CardDescription>
            Lengkapi data di bawah ini untuk mulai berjualan.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Nama Toko*</Label>
                <Input 
                    id="name" 
                    placeholder="Contoh: Kopi Kenangan Senja" 
                    {...form.register('name')}
                    onChange={handleNameChange}
                    disabled={isLoading}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
                </div>
                
                <div className="grid gap-2">
                <Label htmlFor="slug">Link Toko (URL)*</Label>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted p-2 rounded-md border">
                    <span className="whitespace-nowrap">shop/</span>
                    <input 
                        className="bg-transparent outline-none w-full text-foreground"
                        {...form.register('slug')}
                        disabled={isLoading}
                    />
                </div>
                {form.formState.errors.slug && (
                    <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                )}
                </div>

                <div className="grid gap-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp*</Label>
                <Input 
                    id="whatsapp" 
                    placeholder="081234567890" 
                    {...form.register('whatsapp')}
                    disabled={isLoading}
                />
                {form.formState.errors.whatsapp && (
                    <p className="text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>
                )}
                </div>

                <div className="grid gap-2">
                <Label htmlFor="address">Alamat Lengkap Toko*</Label>
                <textarea 
                    id="address" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Jl. Merdeka No. 123, Jakarta Selatan" 
                    {...form.register('address')}
                    disabled={isLoading}
                />
                {form.formState.errors.address && (
                    <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
                )}
                </div>

                <div className="grid gap-2">
                <Label htmlFor="google_maps_link">Link Google Maps (Opsional)</Label>
                <Input 
                    id="google_maps_link" 
                    placeholder="https://goo.gl/maps/..." 
                    {...form.register('google_maps_link')}
                    disabled={isLoading}
                />
                {form.formState.errors.google_maps_link && (
                    <p className="text-xs text-destructive">{form.formState.errors.google_maps_link.message}</p>
                )}
                </div>

                <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi Singkat (Opsional)</Label>
                <Input 
                    id="description" 
                    placeholder="Jual kopi dan aneka camilan..." 
                    {...form.register('description')}
                    disabled={isLoading}
                />
                </div>

                <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Buat Toko Sekarang
                </Button>
            </form>
        </CardContent>
        </Card>
    </div>
  )
}
