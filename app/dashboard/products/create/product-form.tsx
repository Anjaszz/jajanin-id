'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/app/actions/seller-products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Database } from '@/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']

export default function ProductForm({ categories }: { categories: Category[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const router = useRouter()

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files) return

    // Limit to 5 files
    const selectedFiles = Array.from(files).slice(0, 5)
    
    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    
    // Revoke old previews to avoid memory leaks
    previews.forEach(url => URL.revokeObjectURL(url))
    
    setPreviews(newPreviews)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await createProduct(formData)
    
    if (result?.error) {
        setError(result.error)
        setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Tambah Produk Baru</CardTitle>
          <CardDescription>
            Informasi lengkap produk yang akan dijual.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
           <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
           </Link>
        </Button>
      </CardHeader>
      <CardContent>
           {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 wrap-break-word font-medium border border-destructive/20">
                 {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
          )}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Nama Produk*</Label>
            <Input id="name" name="name" placeholder="Contoh: Kopi Susu Aren" required disabled={isLoading} className="h-11" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category_id" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Kategori (Opsional)</Label>
            <select 
              id="category_id" 
              name="category_id" 
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="none">Tanpa Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="price" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Harga (Rp)*</Label>
                  <Input id="price" name="price" type="number" min="0" placeholder="15000" required disabled={isLoading} className="h-11" />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Stok Awal*</Label>
                  <Input id="stock" name="stock" type="number" min="0" placeholder="100" required disabled={isLoading} className="h-11" />
               </div>
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="image" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Foto Produk (Maks 5)</Label>
            <div className="space-y-4">
               <Input 
                 id="image" 
                 name="image" 
                 type="file" 
                 accept="image/*" 
                 multiple 
                 onChange={onImageChange}
                 disabled={isLoading} 
                 className="h-11 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
               />
               
               {previews.length > 0 && (
                 <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {previews.map((src, i) => (
                      <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted group">
                        <img src={src} alt={`Preview ${i+1}`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-[10px] text-white font-bold uppercase">Gambar {i+1}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
               <p className="text-xs text-muted-foreground">Format: JPG, PNG • Ukuran file maks 2MB per gambar.</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Deskripsi (Opsional)</Label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="description" 
              name="description" 
              placeholder="Penjelasan detail produk agar pembeli tertarik..." 
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isLoading} className="h-11 px-8 shadow-lg shadow-primary/20">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sedang Menyimpan...
                    </>
                  ) : (
                    "Simpan Produk"
                  )}
              </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
