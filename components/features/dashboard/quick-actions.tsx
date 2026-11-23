import Link from "next/link";
import { ArrowLeftRight, PiggyBank, PieChart, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Transacción", href: "/transactions?new=1", icon: ArrowLeftRight, primary: true },
  { label: "Presupuestos", href: "/budgets", icon: Target },
  { label: "Metas", href: "/goals", icon: PiggyBank },
  { label: "Reportes", href: "/reports", icon: PieChart },
];

/** Accesos rápidos en forma de "pill" con icono circular. */
export function QuickActions() {
  return (
    <nav aria-label="Accesos rápidos" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ label, href, icon: Icon, primary }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group flex h-14 items-center gap-3 rounded-2xl px-2 pr-4 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
            primary
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-card text-card-foreground ring-1 ring-border"
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              primary ? "bg-white text-ink" : "bg-ink text-ink-foreground dark:bg-muted dark:text-foreground"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
