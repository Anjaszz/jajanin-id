"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "success";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "default",
}: ConfirmationModalProps) {
  const confirmColors = {
    default: "bg-primary hover:bg-primary/90",
    destructive: "bg-destructive hover:bg-destructive/90",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-black dark:text-white leading-tight">{title}</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <Button variant="ghost" onClick={onClose} className="sm:flex-1 rounded-xl font-bold dark:text-slate-400 dark:hover:bg-slate-800">
            {cancelText}
          </Button>
          <Button
            className={cn(
              "sm:flex-1 font-black rounded-xl uppercase tracking-widest text-[10px]",
              confirmColors[variant] || confirmColors.default
            )}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

