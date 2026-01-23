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
import { Pencil, Loader2 } from "lucide-react"
import { updateCategory } from "@/app/actions/categories"
import { toast } from "sonner"

interface EditCategoryDialogProps {
  category: { id: string; name: string }
}

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [name, setName] = React.useState(category.name)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)

    try {
      const result = await updateCategory(category.id, name)
      if (result?.error) {
        toast.error(typeof result.error === 'string' ? result.error : "Gagal memperbarui kategori")
      } else {
        toast.success("Kategori berhasil diperbarui")
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
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Edit Kategori</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Nama Kategori</Label>
            <Input 
              id="edit-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Makanan Berat" 
              required 
              className="h-12 rounded-2xl border-slate-200 font-bold px-4 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <DialogFooter>
            <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
