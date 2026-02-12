"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const bankGroups = [
  {
    label: "Bank Nasional",
    banks: ["BCA", "Mandiri", "BNI", "BRI", "BSI", "BTN", "CIMB Niaga", "Danamon", "Permata"],
  },
  {
    label: "Bank Digital",
    banks: ["Bank Jago", "SeaBank", "Blu", "Allo Bank"],
  },
  {
    label: "E-Wallet",
    banks: ["GoPay", "OVO", "Dana", "ShopeePay"],
  },
]

interface BankSelectProps {
  defaultValue?: string
  name: string
  onChange?: (value: string) => void
}

export function BankSelect({ defaultValue, name, onChange }: BankSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue || "")
  const [search, setSearch] = React.useState("")

  const filteredGroups = React.useMemo(() => {
    if (!search) return bankGroups
    return bankGroups.map(group => ({
      ...group,
      banks: group.banks.filter(bank => 
        bank.toLowerCase().includes(search.toLowerCase())
      )
    })).filter(group => group.banks.length > 0)
  }, [search])

  const selectedBank = React.useMemo(() => {
    for (const group of bankGroups) {
      if (group.banks.includes(value)) return value
    }
    return ""
  }, [value])

  return (
    <div className="relative w-full">
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setSearch("")
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-11 justify-between rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-all focus:ring-2 focus:ring-primary/20 shadow-sm"
          >
            {selectedBank ? (
              <span className="text-slate-900 dark:text-white">{selectedBank}</span>
            ) : (
              <span className="text-muted-foreground">Pilih Bank</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 border-none shadow-2xl rounded-2xl overflow-hidden w-[--radix-popover-trigger-width] min-w-[260px] bg-white dark:bg-slate-900" 
          align="start"
          sideOffset={8}
        >
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input 
                className="w-full bg-white dark:bg-slate-900 border-none rounded-lg py-2 pl-8 pr-3 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-sm"
                placeholder="Cari nama bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[350px] overflow-y-auto bg-white dark:bg-slate-900 p-1">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group.label}
                  </div>
                  {group.banks.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => {
                        setValue(bank)
                        setOpen(false)
                        setSearch("")
                        if (onChange) onChange(bank)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all mb-0.5",
                        value === bank 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {bank}
                      {value === bank && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-xs font-bold text-slate-400">Bank tidak ditemukan.</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
