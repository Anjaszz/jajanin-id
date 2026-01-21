'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { requestWithdrawal } from "@/app/actions/wallet";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WithdrawalFormProps {
  balance: number;
  bankName: string;
  bankAccount: string;
  isActive: boolean;
}

export function WithdrawalForm({ balance, bankName, bankAccount, isActive }: WithdrawalFormProps) {
  const [loading, setLoading] = useState(false);
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const MIN_WITHDRAWAL = 20000;

  const formatNumber = (num: string) => {
    const value = num.replace(/\D/g, "");
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const deformatNumber = (num: string) => {
    return num.replace(/\./g, "");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setDisplayAmount(formatted);
  };

  const handleMaxClick = () => {
    setDisplayAmount(formatNumber(balance.toString()));
  };

  const validateAndShowConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(deformatNumber(displayAmount));
    
    if (numAmount < MIN_WITHDRAWAL) {
      toast.error(`Minimal penarikan adalah ${formatCurrency(MIN_WITHDRAWAL)}`);
      return;
    }

    if (numAmount > balance) {
      toast.error("Saldo tidak mencukupi");
      return;
    }

    setShowConfirm(true);
  };

  async function handleConfirmedSubmit() {
    setLoading(true);
    setShowConfirm(false);
    
    // Create a new FormData and override the amount with the deformatted number
    const formData = new FormData(formRef.current!);
    formData.set('amount', deformatNumber(displayAmount));
    
    try {
      const result = await requestWithdrawal(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Permintaan penarikan berhasil dikirim", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        });
        setDisplayAmount('');
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <>
      <form ref={formRef} onSubmit={validateAndShowConfirm} className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="bankName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Bank</Label>
            <Input 
              id="bankName" 
              name="bankName" 
              placeholder="Contoh: BCA" 
              defaultValue={bankName} 
              required 
              className="rounded-xl border-slate-200"
              disabled={loading || !isActive}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="accountNumber" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nomor Rekening</Label>
            <Input 
              id="accountNumber" 
              name="accountNumber" 
              placeholder="000-000-000" 
              defaultValue={bankAccount} 
              required 
              className="rounded-xl border-slate-200"
              disabled={loading || !isActive}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nominal Penarikan</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
            <input type="hidden" name="amount" value={deformatNumber(displayAmount)} />
            <Input 
              id="amount-display" 
              type="text" 
              className="pl-12 pr-20 h-14 text-lg font-black rounded-2xl border-slate-200 focus:ring-primary focus:border-primary" 
              placeholder="20.000" 
              value={displayAmount}
              onChange={handleAmountChange}
              required 
              disabled={loading || !isActive}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
              disabled={loading || !isActive}
            >
              MAKS
            </Button>
          </div>
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
              Minimal: <span className="text-slate-900">{formatCurrency(MIN_WITHDRAWAL)}</span>
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
              Tersedia: <span className="text-blue-600">{formatCurrency(balance)}</span>
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full shadow-xl shadow-primary/20 h-14 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          disabled={loading || !isActive}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
          ) : !isActive ? (
            "Penarikan Dinonaktifkan"
          ) : (
            "Konfirmasi Penarikan"
          )}
        </Button>

        {!isActive && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-bold leading-tight">
              Fitur penarikan dibatasi sementara karena status akun toko Anda sedang dinonaktifkan.
            </p>
          </div>
        )}
      </form>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-4xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center sm:text-left">Konfirmasi Penarikan</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-center sm:text-left text-base">
              Anda akan menarik dana sebesar <strong className="text-slate-900">{formatCurrency(Number(deformatNumber(displayAmount)))}</strong> ke rekening <strong className="text-slate-900">{bankName} ({bankAccount})</strong>. Pastikan data sudah benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl h-12 border-slate-200 font-bold m-0 sm:flex-1">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleConfirmedSubmit();
              }}
              className="rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-black m-0 sm:flex-1 shadow-lg shadow-blue-200"
            >
              Ya, Kirim Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
