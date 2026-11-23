"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";

interface MonthData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface Props {
  data: MonthData[];
}

const series = [
  { key: "income", label: "Ingresos", color: "var(--brand-soft)" },
  { key: "expenses", label: "Gastos", color: "var(--chart-2)" },
] as const;

const formatYAxis = (value: number) =>
  Math.abs(value) >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as MonthData;
  return (
    <div className="rounded-xl bg-popover p-3 text-popover-foreground shadow-xl ring-1 ring-border">
      <p className="mb-2 text-sm font-semibold capitalize">{row.month}</p>
      <dl className="space-y-1 text-xs">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <dt className="text-muted-foreground">{s.label}:</dt>
            <dd className="ml-auto font-semibold tabular-nums">{formatCurrency(row[s.key])}</dd>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-border pt-1">
          <dt className="text-muted-foreground">Ahorro:</dt>
          <dd
            className={cn(
              "ml-auto font-semibold tabular-nums",
              row.savings < 0 ? "text-danger" : "text-success"
            )}
          >
            {formatCurrency(row.savings)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function IncomeVsExpensesChart({ data }: Props) {
  const empty = !data || data.every((d) => d.income === 0 && d.expenses === 0);

  return (
    <section
      aria-labelledby="ive-title"
      className="rounded-[1.75rem] bg-card p-5 shadow-sm ring-1 ring-border sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="ive-title" className="text-lg font-bold tracking-tight">
            Ingresos vs gastos
          </h2>
          <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
        </div>
        <ul className="flex items-center gap-4 text-xs text-muted-foreground">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {empty ? (
        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={6} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--chart-axis)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--chart-axis)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[8, 8, 8, 8]} maxBarSize={22} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
