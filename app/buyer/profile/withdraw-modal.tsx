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
import { Loader2, ArrowUpRight } from "lucide-react";
import { requestBuyerWithdrawal } from "@/app/actions/wallet";
import { toast } from "sonner";
import { BankSelect } from "@/components/dashboard/bank-select";

export function WithdrawModal({ balance }: { balance: number }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number | string>("");

  /* Helper to format number with dots */
  const formatNumber = (num: number | string) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  /* Helper to parse number from dotted string */
  const parseNumber = (str: string) => {
    return Number(str.replace(/\./g, ""));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    // Get raw amount from custom logic, not just formData which might have dots
    const rawAmount = parseNumber(amount.toString());
    
    // Override the amount in formData with the clean number
    formData.set("amount", rawAmount.toString());

    if (rawAmount < 20000) {
      toast.error("Minimal penarikan adalah Rp 20.000");
      setIsLoading(false);
      return;
    }

    if (rawAmount > balance) {
      toast.error("Saldo tidak mencukupi");
      setIsLoading(false);
      return;
    }

    // Call Server Action
    const result = await requestBuyerWithdrawal(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Permintaan penarikan berhasil dikirim");
      setOpen(false);
      setAmount("");
    }
    setIsLoading(false);
  }

  const handleMaxClick = () => {
    setAmount(formatNumber(balance));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Check only digits
    if (rawValue === "") {
      setAmount("");
      return;
    }
    const numValue = Number(rawValue);
    setAmount(formatNumber(numValue));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Tarik Saldo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tarik Saldo</DialogTitle>
          <DialogDescription>
            Masukkan detail rekening bank untuk pencairan dana. Minimal penarikan Rp 20.000.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <BankSelect name="bankName" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="1234567890"
                type="number"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankHolderName">Nama Pemilik Rekening</Label>
              <Input
                id="bankHolderName"
                name="bankHolderName"
                placeholder="Nama sesuai buku tabungan"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah Penarikan (Min: Rp 20.000)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                <Input
                  id="amount"
                  name="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-9 pr-16"
                  placeholder="0"
                  required
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  MAKS
                </button>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Minimal: Rp 20.000</span>
                <span>Saldo: Rp {balance.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Memproses..." : "Ajukan Penarikan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
