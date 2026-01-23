"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteCategory } from "@/app/actions/categories"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteCategoryButtonProps {
  id: string
  name: string
}

export function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
  const [isPending, setIsPending] = React.useState(false)

  async function handleDelete() {
    setIsPending(true)
    try {
      const result = await deleteCategory(id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Kategori "${name}" berhasil dihapus`)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={isPending}
          className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-tight">Hapus Kategori?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium">
            Apakah Anda yakin ingin menghapus kategori <span className="text-slate-900 font-bold">"{name}"</span>? Produk yang menggunakan kategori ini akan kehilangan kategorinya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-2xl h-11 border-slate-200 font-bold">Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="rounded-2xl h-11 bg-red-600 hover:bg-red-700 font-bold"
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
