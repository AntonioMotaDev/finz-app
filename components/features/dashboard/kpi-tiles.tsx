import { ArrowDownRight, ArrowUpRight, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Kpi {
  label: string;
  value: number;
  hint: string;
  change?: number;
  /** Si un aumento es "bueno" (ingresos/ahorro) o "malo" (gastos) */
  higherIsBetter: boolean;
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "danger" | "brand";
}

function Trend({ change, higherIsBetter }: { change: number; higherIsBetter: boolean }) {
  if (!change) return null;
  const up = change > 0;
  const good = up === higherIsBetter;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        good ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {Math.abs(change).toFixed(1)}%
      <span className="sr-only">vs. mes anterior</span>
    </span>
  );
}

export function KpiTiles({
  income,
  expenses,
  comparison,
}: {
  income: { total: number; count: number };
  expenses: { total: number; count: number };
  comparison: { incomeChange: number; expensesChange: number; savingsChange: number };
}) {
  const savings = income.total - expenses.total;
  const plural = (n: number) => `${n} ${n === 1 ? "transacción" : "transacciones"}`;
  const kpis: Kpi[] = [
    {
      label: "Ingresos del mes",
      value: income.total,
      hint: plural(income.count),
      change: comparison.incomeChange,
      higherIsBetter: true,
      icon: ArrowUpRight,
      tone: "success",
    },
    {
      label: "Gastos del mes",
      value: expenses.total,
      hint: plural(expenses.count),
      change: comparison.expensesChange,
      higherIsBetter: false,
      icon: ArrowDownRight,
      tone: "danger",
    },
    {
      label: "Ahorro del mes",
      value: savings,
      hint: "Ingresos − gastos",
      change: comparison.savingsChange,
      higherIsBetter: true,
      icon: PiggyBank,
      tone: "brand",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                k.tone === "success" && "bg-success-soft text-success",
                k.tone === "danger" && "bg-danger-soft text-danger",
                k.tone === "brand" && "bg-brand-soft text-brand-soft-foreground"
              )}
            >
              <k.icon className="h-4 w-4" aria-hidden />
            </span>
            <Trend change={k.change ?? 0} higherIsBetter={k.higherIsBetter} />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">{k.label}</p>
          <p
            className={cn(
              "mt-0.5 truncate text-xl font-bold tracking-tight",
              k.tone === "brand" && k.value < 0 && "text-danger"
            )}
          >
            {formatCurrency(k.value)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}
