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
  
  // State for image previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
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

    // Grab files directly from DOM inputs since they are not controlled by react-hook-form
    const logoInput = document.getElementById('logo') as HTMLInputElement;
    if (logoInput?.files?.[0]) {
        formData.append('logo', logoInput.files[0]);
    } else {
        // Validation: Logo is required
        setError("Logo toko wajib diupload");
        setIsLoading(false);
        return;
    }

    const coverInput = document.getElementById('cover_image') as HTMLInputElement;
    if (coverInput?.files?.[0]) {
        formData.append('cover_image', coverInput.files[0]);
    }

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="logo">Logo Toko (Wajib)</Label>
                        <div className="flex flex-col gap-3">
                            {logoPreview ? (
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary mx-auto group">
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setLogoPreview(null)
                                            const input = document.getElementById('logo') as HTMLInputElement
                                            if (input) input.value = ''
                                        }}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                                    >
                                        Ganti
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed flex items-center justify-center mx-auto text-muted-foreground">
                                    <Store className="w-8 h-8 opacity-50" />
                                </div>
                            )}
                            <Input 
                                id="logo" 
                                type="file"
                                accept="image/*"
                                name="logo"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setLogoPreview(URL.createObjectURL(file))
                                    }
                                }}
                                required
                                disabled={isLoading}
                                className="text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">Format: JPG, PNG. Maks 2MB.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cover_image">Foto Sampul (Opsional)</Label>
                        <div className="flex flex-col gap-3">
                            {coverPreview ? (
                                <div className="relative w-full aspect-video rounded-md overflow-hidden border border-input group">
                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setCoverPreview(null)
                                            const input = document.getElementById('cover_image') as HTMLInputElement
                                            if (input) input.value = ''
                                        }}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                                    >
                                        Ganti
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-md bg-muted border-2 border-dashed flex items-center justify-center text-muted-foreground">
                                    <span className="text-xs">Preview Sampul</span>
                                </div>
                            )}
                            <Input 
                                id="cover_image" 
                                type="file" 
                                accept="image/*"
                                name="cover_image"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setCoverPreview(URL.createObjectURL(file))
                                    }
                                }}
                                disabled={isLoading}
                                className="text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">Format: JPG, PNG. Disarankan 16:9.</p>
                    </div>
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
