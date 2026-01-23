'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct, updateProduct } from '@/app/actions/seller-products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, ChevronDown, Check, Tag, Search } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['categories']['Row']

const formatRupiah = (value: string | number) => {
  if (!value) return ''
  const number = typeof value === 'string' ? value.replace(/\D/g, '') : value.toString()
  return new Intl.NumberFormat('id-ID').format(parseInt(number))
}

const parseNumber = (value: string) => {
  if (typeof value !== 'string') return ''
  return value.replace(/\D/g, '')
}

export default function ProductForm({ 
  categories, 
  initialData 
}: { 
  categories: Category[], 
  initialData?: any 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [previews, setPreviews] = useState<string[]>(initialData?.images || [])
  const [displayPrice, setDisplayPrice] = useState(formatRupiah(initialData?.price || ''))
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.category_id || '')
  const [openCategory, setOpenCategory] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )
  
  // Variant States
  const [hasVariants, setHasVariants] = useState(initialData?.product_variants?.length > 0 || false)
  const [variants, setVariants] = useState<{name: string, price: string, stock: string}[]>(
    initialData?.product_variants?.map((v: any) => ({
      name: v.name,
      price: formatRupiah(v.price_override ?? initialData.price),
      stock: v.stock.toString()
    })) || []
  )

  // Addon States
  const [hasAddons, setHasAddons] = useState(initialData?.product_addons?.length > 0 || false)
  const [addons, setAddons] = useState<{name: string, price: string}[]>(
    initialData?.product_addons?.map((a: any) => ({
      name: a.name,
      price: formatRupiah(a.price)
    })) || []
  )

  const router = useRouter()

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants]
    let newValue = value
    if (field === 'price') {
      newValue = formatRupiah(value)
    }
    newVariants[index] = { ...newVariants[index], [field]: newValue }
    setVariants(newVariants)
  }

  const addAddon = () => {
    setAddons([...addons, { name: '', price: '' }])
  }

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index))
  }

  const updateAddon = (index: number, field: string, value: string) => {
    const newAddons = [...addons]
    let newValue = value
    if (field === 'price') {
      newValue = formatRupiah(value)
    }
    newAddons[index] = { ...newAddons[index], [field]: newValue }
    setAddons(newAddons)
  }

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files) return

    const selectedFiles = Array.from(files).slice(0, 5)
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    
    // Combine with existing previews if not exceeding limit
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 5))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    
    if (!selectedCategoryId) {
        setError("Silakan pilih kategori produk terlebih dahulu.")
        setIsLoading(false)
        return
    }
    formData.set('category_id', selectedCategoryId)
    
    if (initialData) {
        formData.append('existing_images', JSON.stringify(previews.filter(p => p.startsWith('http'))))
    }

    if (hasVariants && variants.length > 0) {
        const firstVariant = variants[0]
        formData.set('price', parseNumber(firstVariant.price))
        formData.set('stock', firstVariant.stock)

        const cleanVariants = variants.map(v => ({
            ...v,
            price: parseNumber(v.price)
        }))
        formData.append('variants', JSON.stringify(cleanVariants))
    } else {
        const cleanPrice = parseNumber(displayPrice)
        formData.set('price', cleanPrice)
    }

    if (hasAddons && addons.length > 0) {
        const cleanAddons = addons.map(a => ({
            ...a,
            price: parseNumber(a.price)
        }))
        formData.append('addons', JSON.stringify(cleanAddons))
    }

    const result = initialData 
        ? await updateProduct(initialData.id, formData)
        : await createProduct(formData)
    
    if (result?.error) {
        setError(result.error)
        setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{initialData ? 'Edit Produk' : 'Tambah Produk Baru'}</CardTitle>
          <CardDescription>
            {initialData ? 'Perbarui informasi produk Anda.' : 'Informasi lengkap produk yang akan dijual.'}
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
                 {error && typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
          )}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex bg-muted p-1 rounded-xl w-fit">
            <button
               type="button"
               onClick={() => setHasVariants(false)}
               className={cn(
                 "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                 !hasVariants ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
               )}
            >
               Produk Standar
            </button>
            <button
               type="button"
               onClick={() => {
                 setHasVariants(true)
                 if (variants.length === 0) setVariants([{ name: '', price: '', stock: '' }])
               }}
               className={cn(
                 "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                 hasVariants ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
               )}
            >
               Produk dengan Varian
            </button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Nama Produk*</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData?.name}
              placeholder="Contoh: Kopi Susu Aren" 
              required 
              disabled={isLoading} 
              className="h-11" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category_id" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Kategori*</Label>
            <Popover open={openCategory} onOpenChange={setOpenCategory}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        role="combobox"
                        aria-expanded={openCategory}
                        className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm transition-all focus:ring-4 focus:ring-primary/10 hover:border-primary/30"
                        disabled={isLoading}
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary/60" />
                            {selectedCategoryId 
                                ? categories.find((cat) => cat.id === selectedCategoryId)?.name 
                                : <span className="text-muted-foreground font-medium">Pilih Kategori...</span>
                            }
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-2 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-md">
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Cari kategori..."
                            className="h-10 pl-9 border-none bg-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategoryId(cat.id)
                                        setOpenCategory(false)
                                    }}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
                                        selectedCategoryId === cat.id 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                            : "text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {cat.name}
                                    {selectedCategoryId === cat.id && <Check className="h-4 w-4" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-xs text-muted-foreground font-medium">
                                    {categorySearch ? "Kategori tidak ditemukan." : "Belum ada kategori."}
                                </p>
                                {!categorySearch && (
                                    <Button variant="link" size="sm" asChild className="h-auto p-0 text-[10px] font-black uppercase tracking-widest mt-2">
                                        <Link href="/admin/categories">Kelola Kategori Admin</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            <input type="hidden" name="category_id" value={selectedCategoryId} />
          </div>

          {!hasVariants ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                 <div className="grid gap-2">
                    <Label htmlFor="price-display" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Harga (Rp)*</Label>
                    <Input 
                      id="price-display" 
                      type="text" 
                      inputMode="numeric"
                      placeholder="15.000" 
                      value={displayPrice}
                      onChange={(e) => setDisplayPrice(formatRupiah(e.target.value))}
                      required={!hasVariants} 
                      disabled={isLoading} 
                      className="h-11 font-bold text-lg" 
                    />
                    <input type="hidden" name="price" value={parseNumber(displayPrice)} />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="stock" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Stok Awal*</Label>
                    <Input 
                      id="stock" 
                      name="stock" 
                      type="number" 
                      min="0" 
                      defaultValue={initialData?.stock}
                      placeholder="100" 
                      required={!hasVariants} 
                      disabled={isLoading} 
                      className="h-11" 
                    />
                 </div>
            </div>
          ) : (
             <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium animate-in fade-in slide-in-from-top-2">
                Info: Karena produk memiliki varian, harga dan stok akan diatur secara detail pada bagian varian di bawah. Varian pertama akan menjadi harga utama produk.
             </div>
          )}
          
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
                 <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300 overflow-x-auto pb-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted group shrink-0">
                        <img src={src} alt={`Preview ${i+1}`} className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            setPreviews(prev => prev.filter((_, idx) => idx !== i))
                          }}
                          className="absolute top-1 right-1 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                 </div>
               )}
               <p className="text-xs text-muted-foreground">Upload gambar baru akan menambah koleksi foto. Maksimal 5 foto.</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Deskripsi (Opsional)</Label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="description" 
              name="description" 
              defaultValue={initialData?.description}
              placeholder="Penjelasan detail produk agar pembeli tertarik..." 
              disabled={isLoading}
            />
          </div>

          {/* Varians & Addons Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
              {/* Variant Section */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Varian Produk</Label>
                    <div className="flex items-center gap-2">
                       <Label htmlFor="has-variants" className="text-xs font-medium cursor-pointer">Aktif</Label>
                       <input 
                          type="checkbox" 
                          id="has-variants" 
                          checked={hasVariants} 
                          onChange={(e) => setHasVariants(e.target.checked)} 
                          className="accent-primary"
                       />
                    </div>
                 </div>

                 {hasVariants && (
                    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border-2 border-dashed">
                       {variants.map((v, i) => (
                          <div key={i} className="grid grid-cols-2 gap-3 relative pb-4 border-b last:border-0 last:pb-0">
                             <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nama Varian</Label>
                                <Input value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} placeholder="Contoh: L, Merah" required className="h-9" />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Harga (Rp)</Label>
                                <Input type="text" inputMode="numeric" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} placeholder="0" className="h-9 font-bold" />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Stok</Label>
                                <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} placeholder="0" required className="h-9" />
                             </div>
                             <button type="button" onClick={() => removeVariant(i)} className="absolute top-0 right-0 text-destructive hover:text-destructive/80 p-1">
                                <span className="text-xs font-bold">&times;</span>
                             </button>
                          </div>
                       ))}
                       <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-full border-dashed h-8 text-xs">+ Varian</Button>
                    </div>
                 )}
              </div>

              {/* Addons Section */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Add-on (Tambahan)</Label>
                    <div className="flex items-center gap-2">
                       <Label htmlFor="has-addons" className="text-xs font-medium cursor-pointer">Aktif</Label>
                       <input 
                          type="checkbox" 
                          id="has-addons" 
                          checked={hasAddons} 
                          onChange={(e) => {
                             setHasAddons(e.target.checked)
                             if (e.target.checked && addons.length === 0) addAddon()
                          }} 
                          className="accent-primary"
                       />
                    </div>
                 </div>

                 {hasAddons && (
                    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border-2 border-dashed">
                       {addons.map((a, i) => (
                          <div key={i} className="grid grid-cols-2 gap-3 relative pb-4 border-b last:border-0 last:pb-0">
                             <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nama Add-on</Label>
                                <Input value={a.name} onChange={(e) => updateAddon(i, 'name', e.target.value)} placeholder="Contoh: Saus Sambal" required className="h-9" />
                             </div>
                             <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Biaya Tambahan (Rp)</Label>
                                <Input type="text" inputMode="numeric" value={a.price} onChange={(e) => updateAddon(i, 'price', e.target.value)} placeholder="0" className="h-9 font-bold" />
                             </div>
                             <button type="button" onClick={() => removeAddon(i)} className="absolute top-0 right-0 text-destructive hover:text-destructive/80 p-1">
                                <span className="text-xs font-bold">&times;</span>
                             </button>
                          </div>
                       ))}
                       <Button type="button" variant="outline" size="sm" onClick={addAddon} className="w-full border-dashed h-8 text-xs">+ Add-on</Button>
                    </div>
                 )}
              </div>
          </div>

          <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isLoading} className="h-11 px-8 shadow-lg shadow-primary/20">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sedang Menyimpan...
                    </>
                  ) : (
                    initialData ? "Perbarui Produk" : "Simpan Produk"
                  )}
              </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
