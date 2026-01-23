"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export function AdminNoteModal({ note }: { note: string }) {
  if (!note) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold hover:bg-red-200 transition-colors animate-pulse cursor-pointer">
          <ShieldAlert className="h-3 w-3" />
          NONAKTIF OLEH ADMIN
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
            Dinonaktifkan oleh Admin
          </DialogTitle>
          <DialogDescription>
             Produk ini telah dinonaktifkan oleh admin dengan alasan berikut:
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 mt-2">
            <p className="font-medium text-sm leading-relaxed whitespace-pre-wrap">{note}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
