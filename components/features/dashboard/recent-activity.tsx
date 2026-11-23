import Link from "next/link";
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: Date;
  category?: { name: string; color: string | null } | null;
  account: { name: string };
}

const typeMeta: Record<string, { label: string; pill: string; dot: string; icon: typeof ArrowUpRight; sign: string }> = {
  INCOME: { label: "Ingreso", pill: "bg-success-soft text-success", dot: "bg-success", icon: ArrowUpRight, sign: "+" },
  EXPENSE: { label: "Gasto", pill: "bg-danger-soft text-danger", dot: "bg-danger", icon: ArrowDownRight, sign: "−" },
  TRANSFER: { label: "Transferencia", pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", icon: ArrowLeftRight, sign: "" },
};

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });

/** Lista estilo "Recent Sales": filas redondeadas con estado en pill. */
export function RecentActivity({ transactions }: { transactions: RecentTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-card py-10 text-center ring-1 ring-border">
        <p className="text-sm text-muted-foreground">Aún no hay transacciones</p>
        <Link href="/transactions?new=1" className="text-sm font-semibold text-primary hover:underline">
          Registrar la primera →
        </Link>
      </div>
    );
  }

  return (
    <div role="table" aria-label="Transacciones recientes" className="space-y-2">
      <div role="row" className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] gap-4 px-4 text-xs font-medium text-muted-foreground md:grid">
        <span role="columnheader">Concepto</span>
        <span role="columnheader">Fecha</span>
        <span role="columnheader">Tipo</span>
        <span role="columnheader" className="text-right">Monto</span>
      </div>
      {transactions.map((t) => {
        const meta = typeMeta[t.type] ?? typeMeta.TRANSFER;
        const Icon = meta.icon;
        return (
          <div
            role="row"
            key={t.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-2xl bg-card px-4 py-3 shadow-sm ring-1 ring-border transition-colors hover:bg-muted/60 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]"
          >
            <div role="cell" className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: t.category?.color || "var(--ink)" }}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.description}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.category?.name ? `${t.category.name} · ` : ""}
                  {t.account.name}
                </p>
              </div>
            </div>
            <span role="cell" className="hidden text-sm text-muted-foreground md:block">
              {dateFmt.format(new Date(t.date))}
            </span>
            <span role="cell" className="hidden md:block">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", meta.pill)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
                {meta.label}
              </span>
            </span>
            <span
              role="cell"
              className={cn(
                "text-right text-sm font-bold tabular-nums",
                t.type === "INCOME" && "text-success"
              )}
            >
              {meta.sign}
              {formatCurrency(t.amount)}
              <span className="block text-xs font-normal text-muted-foreground md:hidden">
                {dateFmt.format(new Date(t.date))}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
