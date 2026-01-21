"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
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
import { processWithdrawal } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WithdrawalActionsProps {
  withdrawalId: string;
  amount: number;
  shopName: string;
}

export function WithdrawalActions({ withdrawalId, amount, shopName }: WithdrawalActionsProps) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await processWithdrawal(withdrawalId, "approved");
      if (res.success) {
        toast.success("Penarikan dana berhasil disetujui");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menyetujui penarikan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await processWithdrawal(withdrawalId, "rejected", rejectReason);
      if (res.success) {
        toast.success("Penarikan dana berhasil ditolak");
        setRejectDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menolak penarikan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Approve Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
            disabled={loading}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl border border-slate-200 shadow-xl max-w-[400px]">
          <AlertDialogHeader>
            <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl font-black">Setujui Penarikan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm">
              Apakah Anda yakin ingin menyetujui penarikan sebesar <strong className="text-slate-900">Rp {amount.toLocaleString('id-ID')}</strong> untuk toko <strong className="text-slate-900">{shopName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-lg border-slate-200 h-9 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleApprove();
              }}
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white border-none font-bold px-4 h-9 text-xs"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Ya, Setujui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
            disabled={loading}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl border border-slate-200 shadow-xl sm:max-w-[400px]">
          <DialogHeader>
            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-black">Tolak Penarikan?</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Saldo akan dikembalikan secara otomatis. Berikan alasan penolakan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alasan Penolakan</Label>
              <Input
                id="reason"
                placeholder="Misal: Nomor rekening tidak valid"
                className="rounded-lg border-slate-200 focus-visible:ring-red-600 h-9 text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
                variant="outline" 
                onClick={() => setRejectDialogOpen(false)}
                className="rounded-lg border-slate-200 h-9 text-xs"
            >
                Batal
            </Button>
            <Button 
                onClick={handleReject}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white border-none font-bold px-4 h-9 text-xs"
                disabled={loading}
            >
               {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
               Tolak Penarikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
