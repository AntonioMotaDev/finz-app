import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, LineChart, PiggyBank, ShieldCheck, Wallet } from "lucide-react"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { FinzLogo } from "@/components/layouts/finz-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"

const features = [
  {
    icon: Wallet,
    title: "Control total",
    description: "Registra ingresos, gastos y transferencias entre todas tus cuentas.",
  },
  {
    icon: LineChart,
    title: "Visualiza tus datos",
    description: "Gráficas y reportes claros para entender a dónde va tu dinero.",
  },
  {
    icon: PiggyBank,
    title: "Alcanza tus metas",
    description: "Presupuestos por categoría y metas de ahorro con seguimiento.",
  },
]

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Finz - inicio">
          <FinzLogo className="h-8 w-8 text-ink dark:text-foreground" />
          <span className="text-xl font-extrabold tracking-tight">Finz</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="bg-ink text-ink-foreground hover:bg-ink/90 dark:bg-card dark:text-foreground">
            <Link href="/signin">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
              Tus datos, sólo tuyos
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Gestiona tus finanzas de manera <span className="text-primary">inteligente</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Cuentas, transacciones, presupuestos y metas de ahorro en un dashboard claro, rápido y
              disponible en modo claro u oscuro.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/signin">
                Comenzar ahora
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {/* Vista previa decorativa (CSS puro, sin imágenes) */}
          <div aria-hidden className="relative mx-auto w-full max-w-md">
            <div className="rounded-[2rem] bg-ink p-3 shadow-2xl dark:bg-black">
              <div className="space-y-3 rounded-[1.5rem] bg-background p-4">
                <div className="relative isolate h-36 overflow-hidden rounded-3xl bg-ink p-5 text-ink-foreground dark:bg-gradient-to-br dark:from-[#2d3a55] dark:to-[#1b2233]">
                  <div className="card-dots absolute inset-0 -z-10" />
                  <p className="text-2xl font-bold">$ 15,780.00</p>
                  <p className="mt-2 text-sm text-white/70">Cuenta principal</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Transacción", "Metas", "Reportes"].map((l, i) => (
                    <div
                      key={l}
                      className={`flex h-11 items-center justify-center rounded-2xl text-xs font-semibold ${
                        i === 0 ? "bg-brand-soft text-brand-soft-foreground" : "bg-card ring-1 ring-border"
                      }`}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                {[60, 45, 75].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
                    <span className={`h-8 w-8 rounded-full ${i % 2 ? "bg-ink" : "bg-brand-soft"}`} />
                    <span className="h-2 rounded-full bg-muted" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Características" className="mt-20 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-ink-foreground dark:bg-muted dark:text-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-5 text-lg font-bold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
