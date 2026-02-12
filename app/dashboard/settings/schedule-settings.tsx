'use client';

import { useState, useTransition } from 'react';
import { Clock, Check, ChevronDown, ChevronUp, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toggleManualShopStatus, updateOperatingHours } from '@/app/actions/settings';

interface ScheduleDay {
  open: string;
  close: string;
  is_closed: boolean;
}

interface ScheduleSettingsProps {
  initialHours: Record<string, ScheduleDay>;
  isManualClosed: boolean;
  isDeactivated?: boolean;
}

const dayMap: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

const days = Object.keys(dayMap);

export default function ScheduleSettings({ initialHours, isManualClosed: initialManualClosed, isDeactivated = false }: ScheduleSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [innerManualClosed, setInnerManualClosed] = useState(initialManualClosed);
  const [schedule, setSchedule] = useState(() => {
    const fullSchedule = { ...initialHours };
    days.forEach(day => {
      if (!fullSchedule[day]) {
        fullSchedule[day] = { open: "08:00", close: "20:00", is_closed: false };
      }
    });
    return fullSchedule;
  });
  const [bulkOpen, setBulkOpen] = useState('08:00');
  const [bulkClose, setBulkClose] = useState('20:00');

  const handleManualToggle = async () => {
    const newVal = !innerManualClosed;
    setInnerManualClosed(newVal);
    startTransition(async () => {
      await toggleManualShopStatus(newVal);
    });
  };

  const saveHours = (newSchedule: Record<string, ScheduleDay>) => {
    startTransition(async () => {
      await updateOperatingHours(newSchedule);
    });
  };

  const applyBulk = () => {
    const newSchedule = { ...schedule };
    days.forEach((day) => {
      newSchedule[day] = {
        ...newSchedule[day],
        open: bulkOpen,
        close: bulkClose,
      };
    });
    setSchedule(newSchedule);
    saveHours(newSchedule);
  };

  const toggleDay = (day: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        is_closed: !schedule[day].is_closed,
      },
    };
    setSchedule(newSchedule);
    saveHours(newSchedule);
  };

  const updateTime = (day: string, field: 'open' | 'close', value: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value,
      },
    };
    setSchedule(newSchedule);
    saveHours(newSchedule);
  };

  return (
    <div className="space-y-6">
      {/* Instant Shop Toggle - Optimized for Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-wrap">
            <Label className="text-base font-bold dark:text-white">Status Toko (Manual)</Label>
            {isPending && <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Aktifkan untuk buka, matikan untuk tutup instan.</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-primary/5">
          <span className={cn(
            "text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300",
            (innerManualClosed || isDeactivated) ? "text-destructive" : "text-green-600"
          )}>
            {isDeactivated ? "Toko Dinonaktifkan" : (innerManualClosed ? "Toko Tutup" : "Toko Buka")}
          </span>
          <Label htmlFor="shop_open_instant" className={cn("relative inline-flex items-center group select-none", isDeactivated ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
            <input 
              type="checkbox" 
              id="shop_open_instant"
              checked={!innerManualClosed && !isDeactivated}
              onChange={handleManualToggle}
              disabled={isDeactivated}
              className="sr-only peer" 
            />
            <div className="relative w-14 h-7.5 bg-muted rounded-full peer peer-checked:bg-green-500 transition-all duration-300 shadow-inner">
              <div className={cn(
                "absolute top-1 left-1 w-5.5 h-5.5 bg-white rounded-full shadow-md transition-all duration-300 transform",
                (!innerManualClosed && !isDeactivated) ? "translate-x-6.5" : "translate-x-0"
              )} />
            </div>
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Jadwal Mingguan</h4>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-9 dark:text-white"
          >
            {isOpen ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
            <span className="text-xs sm:text-sm">{isOpen ? 'Tutup' : 'Atur Jadwal'}</span>
          </Button>
        </div>

        <div className={cn(
          "space-y-6 transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
        )}>
          {/* Bulk Actions - Optimized for Mobile */}
          <div className="p-4 sm:p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary fill-primary" />
              <p className="text-xs font-black uppercase tracking-widest text-primary">Pengaturan Cepat</p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 sm:gap-4">
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Buka</Label>
                 <Input 
                   type="time" 
                   value={bulkOpen} 
                   onChange={(e) => setBulkOpen(e.target.value)}
                   className="w-full sm:w-32 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white h-10"
                 />
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Tutup</Label>
                 <Input 
                   type="time" 
                   value={bulkClose} 
                   onChange={(e) => setBulkClose(e.target.value)}
                   className="w-full sm:w-32 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white h-10"
                 />
              </div>
              <Button 
                type="button" 
                onClick={applyBulk}
                className="col-span-2 sm:col-auto rounded-xl shadow-lg shadow-primary/20 h-10"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <span className="sm:hidden text-xs">Terapkan ke Semua Hari</span>
                <span className="hidden sm:inline">Terapkan ke Semua Hari</span>
              </Button>
            </div>
          </div>

          {/* Individual Days - Optimized for Mobile Stack */}
          <div className="grid gap-3">
            {days.map((day) => (
              <div key={day} className={cn(
                 "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative",
                 schedule[day].is_closed 
                    ? "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 opacity-60" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 shadow-sm"
              )}>
                <div className="flex items-center justify-between sm:justify-start gap-4 min-w-[140px]">
                  <Label htmlFor={`schedule_${day}_active`} className="relative inline-flex items-center cursor-pointer group select-none">
                    <input 
                      type="checkbox"
                      id={`schedule_${day}_active`}
                      value="on"
                      checked={!schedule[day].is_closed}
                      onChange={() => toggleDay(day)}
                      className="sr-only peer"
                    />
                      <div className="relative w-12 h-6.5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-primary transition-all duration-300 shadow-inner">
                      <div className={cn(
                        "absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full shadow transition-all duration-300 transform",
                        !schedule[day].is_closed ? "translate-x-5.5" : "translate-x-0"
                      )} />
                    </div>
                    <span className="ml-3 font-bold text-sm sm:text-base group-hover:text-primary dark:text-white transition-colors">{dayMap[day]}</span>
                  </Label>
                  
                  {/* Status Indicator for Mobile Stacked View */}
                  {schedule[day].is_closed && (
                    <span className="sm:hidden text-[10px] font-black tracking-widest uppercase text-muted-foreground">Hari Libur</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 transition-all duration-300 w-full sm:w-auto",
                    schedule[day].is_closed && "opacity-0 pointer-events-none invisible"
                  )}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                      <Label className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black sm:hidden">Jam Buka</Label>
                      <Label className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black hidden sm:block">Buka</Label>
                      <Input 
                        type="time" 
                        value={schedule[day].open || '08:00'}
                        onChange={(e) => updateTime(day, 'open', e.target.value)}
                        className="w-full sm:w-28 rounded-xl h-10 text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                      <Label className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black sm:hidden">Jam Tutup</Label>
                      <Label className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black hidden sm:block">Tutup</Label>
                      <Input 
                        type="time" 
                        value={schedule[day].close || '20:00'}
                        onChange={(e) => updateTime(day, 'close', e.target.value)}
                        className="w-full sm:w-28 rounded-xl h-10 text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  {schedule[day].is_closed && (
                    <p className="hidden sm:block absolute right-5 text-xs font-bold text-muted-foreground tracking-widest uppercase italic">Tutup / Libur</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isOpen && (
          <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:flex sm:flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
             {days.map(day => (
                <span key={day} className={cn(
                   "px-2 py-2 rounded-xl border text-center transition-all duration-300 shadow-xs",
                   schedule[day].is_closed 
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
                    : "bg-primary/5 text-primary border-primary/20"
                )}>
                   {dayMap[day].slice(0, 3)}: {schedule[day].is_closed ? 'LIBUR' : `${schedule[day].open}-${schedule[day].close}`}
                </span>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
