import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-900 to-slate-900 dark:from-blue-400 dark:to-slate-600 bg-clip-text text-transparent">
            Finz
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gestiona tus finanzas personales de manera inteligente
          </p>
          <Button asChild size="lg" className="text-lg px-8 bg-blue-900 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800">
            <Link href="/signin">
              Comenzar ahora
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-12">
          <Card className="border border-slate-700">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-slate-800 dark:bg-slate-900/20 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <CardTitle>Control Total</CardTitle>
              <CardDescription>
                Registra todos tus ingresos y gastos en un solo lugar
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-slate-700">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <CardTitle>Visualiza tus Datos</CardTitle>
              <CardDescription>
                Gráficas y reportes detallados de tu situación financiera
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-slate-700">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <CardTitle>Alcanza tus Metas</CardTitle>
              <CardDescription>
                Define presupuestos y objetivos de ahorro personalizados
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
