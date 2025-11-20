/**
 * Componente: Report Type Selector
 * 
 * Selector de tipo de reporte con diseño de tabs
 */

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ReportType = "weekly" | "monthly" | "annual" | "networth";

interface ReportTypeSelectorProps {
  value: ReportType;
  onChange: (value: ReportType) => void;
}

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ReportType)}>
      <TabsList className="grid w-full grid-cols-4 bg-slate-900">
        <TabsTrigger
          value="weekly"
          className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
        >
          Semanal
        </TabsTrigger>
        <TabsTrigger
          value="monthly"
          className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
        >
          Mensual
        </TabsTrigger>
        <TabsTrigger
          value="annual"
          className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
        >
          Anual
        </TabsTrigger>
        <TabsTrigger
          value="networth"
          className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
        >
          Patrimonio
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
