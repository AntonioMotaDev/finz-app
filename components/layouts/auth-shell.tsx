import Link from "next/link";
import { FinzLogo } from "@/components/layouts/finz-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Layout compartido de autenticación: panel "ink" decorativo a la izquierda
 * (sólo desktop) y contenido a la derecha. Sin imágenes: todo CSS/SVG.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2 lg:bg-ink lg:p-3 lg:dark:bg-black">
      <aside className="relative isolate hidden overflow-hidden p-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Finz - inicio">
          <FinzLogo className="h-9 w-9 text-white" />
          <span className="text-2xl font-extrabold tracking-tight">Finz</span>
        </Link>

        <div aria-hidden className="relative mx-auto w-full max-w-sm">
          <div className="absolute -right-6 top-8 h-44 w-full rotate-6 rounded-3xl bg-brand-soft/80" />
          <div className="relative isolate h-48 overflow-hidden rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur">
            <div className="card-dots absolute inset-0 -z-10 text-white" />
            <p className="text-3xl font-bold">$ 15,780.00</p>
            <p className="mt-3 text-sm font-semibold text-white/80">Cuenta principal</p>
            <div className="mt-8 flex items-end justify-between text-sm text-white/70">
              <span>Ahorro +12%</span>
              <span className="font-mono font-bold italic">MXN</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight">Tus finanzas, claras y bajo control.</h2>
          <p className="mt-3 max-w-md text-white/70">
            Cuentas, presupuestos y metas de ahorro en un solo lugar.
          </p>
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 lg:min-h-0 lg:rounded-[2rem] lg:bg-background">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
