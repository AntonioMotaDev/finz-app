/**
 * Componente: Stat Card para Reportes
 * 
 * Tarjeta de estadística reutilizable para mostrar métricas en reportes
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function ReportStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  subtitle,
  trend,
}: ReportStatCardProps) {
  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        <div className={cn("rounded-full p-2", iconBgColor)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center justify-between mt-1">
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
