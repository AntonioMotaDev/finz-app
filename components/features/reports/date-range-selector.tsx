/**
 * Componente: Date Range Selector para Reportes
 * 
 * Selector de rango de fechas para reportes semanales y mensuales
 */

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface DateRangeSelectorProps {
  type: "weekly" | "monthly" | "annual";
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateRangeSelector({ type, currentDate, onDateChange }: DateRangeSelectorProps) {
  const handlePrevious = () => {
    if (type === "weekly") {
      onDateChange(subWeeks(currentDate, 1));
    } else if (type === "monthly") {
      onDateChange(subMonths(currentDate, 1));
    } else {
      // annual
      const newDate = new Date(currentDate);
      newDate.setFullYear(newDate.getFullYear() - 1);
      onDateChange(newDate);
    }
  };

  const handleNext = () => {
    if (type === "weekly") {
      onDateChange(addWeeks(currentDate, 1));
    } else if (type === "monthly") {
      onDateChange(addMonths(currentDate, 1));
    } else {
      // annual
      const newDate = new Date(currentDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      onDateChange(newDate);
    }
  };

  const getDateLabel = () => {
    if (type === "weekly") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "dd MMM", { locale: es })} - ${format(end, "dd MMM yyyy", { locale: es })}`;
    } else if (type === "monthly") {
      return format(currentDate, "MMMM yyyy", { locale: es });
    } else {
      return format(currentDate, "yyyy");
    }
  };

  const isCurrentPeriod = () => {
    const now = new Date();
    
    if (type === "weekly") {
      const currentStart = startOfWeek(now, { weekStartsOn: 1 });
      const selectedStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return currentStart.getTime() === selectedStart.getTime();
    } else if (type === "monthly") {
      return now.getFullYear() === currentDate.getFullYear() && now.getMonth() === currentDate.getMonth();
    } else {
      return now.getFullYear() === currentDate.getFullYear();
    }
  };

  const canGoNext = !isCurrentPeriod();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        className="h-9 bg-slate-900 border-slate-800 hover:bg-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="min-w-[200px] text-center">
        <p className="text-sm font-medium capitalize">{getDateLabel()}</p>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={!canGoNext}
        className="h-9 bg-slate-900 border-slate-800 hover:bg-slate-800 disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
