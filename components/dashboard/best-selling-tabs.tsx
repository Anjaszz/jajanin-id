"use client";

import { cn } from "@/lib/utils";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function PeriodSelector() {
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "today";

  const periods = [
    { label: "Hari Ini", value: "today", icon: <Clock className="h-4 w-4" /> },
    { label: "Minggu Ini", value: "week", icon: <Calendar className="h-4 w-4" /> },
    { label: "Bulan Ini", value: "month", icon: <Calendar className="h-4 w-4" /> },
    { label: "Semua", value: "all", icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1 min-w-max sm:min-w-0">
        {periods.map((p) => (
          <Link
            key={p.value}
            href={`/dashboard/best-selling?period=${p.value}`}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all",
              currentPeriod === p.value
                ? "bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {p.icon}
            <span className="whitespace-nowrap">{p.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
