"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Loader2, Package } from "lucide-react";
import { updateProductStock } from "@/app/actions/seller-products";
import { toast } from "sonner";

interface QuickStockEditProps {
  productId: string;
  productName: string;
  currentStock: number;
  disabled?: boolean;
}

export function QuickStockEdit({
  productId,
  productName,
  currentStock,
  disabled,
}: QuickStockEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stock, setStock] = useState(currentStock);
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate() {
    if (stock < 0) {
      toast.error("Stok tidak boleh negatif");
      return;
    }

    setIsLoading(true);
    const result = await updateProductStock(productId, stock);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Stok ${productName} berhasil diperbarui`);
      setIsOpen(false);
    } else {
      toast.error(result.error || "Gagal memperbarui stok");
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 group/stock">
        <p className="text-slate-400 text-xs font-bold">
          Stok: <span className="text-slate-600 dark:text-slate-300 font-black">{currentStock}</span>
        </p>
        {!disabled && (
          <button
            onClick={() => {
              setStock(currentStock);
              setIsOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
            title="Update Stok"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
          <DialogHeader className="space-y-3">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black text-center dark:text-white leading-tight">
              Update Stok Produk
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 dark:text-slate-400 font-medium">
              Ubah jumlah stok untuk <span className="text-slate-900 dark:text-white font-bold">{productName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="grid gap-2">
              <Label htmlFor="stock" className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Jumlah Stok Baru
              </Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="h-14 text-xl font-black rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="flex-1 h-12 rounded-xl font-bold dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
