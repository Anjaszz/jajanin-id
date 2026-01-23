"use strict";
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toggleProductStatusAdmin } from "@/app/actions/admin";
import { toast } from "sonner";
import { ShieldAlert, CheckCircle, Ban, Loader2 } from "lucide-react";

interface AdminProductActionsProps {
  productId: string;
  isActive: boolean;
}

export function AdminProductActions({
  productId,
  isActive,
}: AdminProductActionsProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");

  async function handleToggleStatus() {
    setIsLoading(true);
    // If currently active, we are deactivating, so reason is required? Not strictly but good practice.
    // If currently inactive, we are activating, reason might be cleared or just ignore.

    // If activating, we don't need a reason.
    const note = isActive ? reason : null;

    if (isActive && !reason.trim()) {
        toast.error("Mohon sertakan alasan penonaktifan.");
        setIsLoading(false);
        return;
    }

    const { success, error } = await toggleProductStatusAdmin(
      productId,
      !isActive,
      note || ""
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        isActive ? "Produk berhasil dinonaktifkan" : "Produk berhasil diaktifkan"
      );
      setOpen(false);
      setReason("");
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isActive ? "destructive" : "default"}
          className={isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        >
          {isActive ? (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Nonaktifkan Produk
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Aktifkan Produk
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isActive ? "Konfirmasi Penonaktifan" : "Konfirmasi Pengaktifan"}
          </DialogTitle>
          <DialogDescription>
            {isActive
              ? "Apakah Anda yakin ingin menonaktifkan produk ini? Produk tidak akan terlihat oleh pembeli, dan seller akan menerima notifikasi alasan penonaktifan."
              : "Apakah Anda yakin ingin mengaktifkan kembali produk ini? Produk akan dapat dibeli kembali."}
          </DialogDescription>
        </DialogHeader>
        
        {isActive && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Alasan Penonaktifan</Label>
              <Textarea
                id="reason"
                placeholder="Contoh: Foto produk melanggar kebijakan, Deskripsi tidak sesuai, dll."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button 
            variant={isActive ? "destructive" : "default"} 
            onClick={handleToggleStatus}
            disabled={isLoading}
            className={!isActive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
