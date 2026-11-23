import Link from "next/link";
import { Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CategoryExpense {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

const MAX_SLICES = 5;

/** Agrupa categorías pequeñas en "Otros" para que el donut sea legible. */
function toSlices(data: CategoryExpense[]): CategoryExpense[] {
  if (data.length <= MAX_SLICES) return data;
  const head = data.slice(0, MAX_SLICES - 1);
  const rest = data.slice(MAX_SLICES - 1);
  return [
    ...head,
    {
      name: "Otros",
      amount: rest.reduce((s, c) => s + c.amount, 0),
      percentage: rest.reduce((s, c) => s + c.percentage, 0),
      color: "var(--muted-foreground)",
    },
  ];
}

/**
 * Donut en SVG puro renderizado en servidor: 0 KB de JavaScript en el cliente
 * (antes se usaba recharts para esto).
 */
function Donut({ slices, total }: { slices: CategoryExpense[]; total: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 3 : 0;
  // Desplazamiento acumulado de cada segmento (cálculo puro, sin mutar en render)
  const offsets = slices.map((_, i) =>
    slices.slice(0, i).reduce((sum, p) => sum + (p.percentage / 100) * c, 0)
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="Gastos por categoría">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="11" />
        {slices.map((s, i) => {
          const len = Math.max((s.percentage / 100) * c - gap, 0.5);
          const el = (
            <circle
              key={s.name}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offsets[i]}
            >
              <title>{`${s.name}: ${formatCurrency(s.amount)} (${s.percentage.toFixed(1)}%)`}</title>
            </circle>
          );
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-medium text-muted-foreground">Total gastado</span>
        <span className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export function StatisticPanel({ data }: { data: CategoryExpense[] }) {
  const total = data.reduce((s, c) => s + c.amount, 0);
  const slices = toSlices(data);

  return (
    <section
      aria-labelledby="stat-title"
      className="rounded-[1.75rem] bg-card p-5 shadow-sm ring-1 ring-border sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 id="stat-title" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
          Estadística
          <span title="Gastos del mes actual agrupados por categoría" className="text-muted-foreground">
            <Info className="h-4 w-4" aria-hidden />
          </span>
        </h2>
        <span className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
          Este mes
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin gastos registrados este mes</p>
          <Link href="/transactions?new=1" className="text-sm font-semibold text-primary hover:underline">
            Registrar un gasto →
          </Link>
        </div>
      ) : (
        <>
          <Donut slices={slices} total={total} />

          <ul className="mt-6 space-y-3">
            {slices.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                >
                  {s.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(s.percentage, 100)}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">−{formatCurrency(s.amount)}</p>
                  <p className="text-xs text-muted-foreground">{s.percentage.toFixed(1)}%</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
