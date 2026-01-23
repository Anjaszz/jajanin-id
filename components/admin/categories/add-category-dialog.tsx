"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createCategory } from "@/app/actions/categories"
import { toast } from "sonner"

export function AddCategoryDialog() {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await createCategory(formData)
      if (result?.error) {
        toast.error(typeof result.error === 'string' ? result.error : "Gagal menambahkan kategori")
      } else {
        toast.success("Kategori berhasil ditambahkan")
        setOpen(false)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 group">
          <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
          Tambah Kategori Global
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Tambah Kategori</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Nama Kategori</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Contoh: Makanan Berat" 
                required 
                className="h-12 rounded-2xl border-slate-200 font-bold px-4 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan Kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
