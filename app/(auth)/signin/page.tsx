import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { z } from "zod"
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FinzLogo } from "@/components/layouts/finz-logo"

export const metadata: Metadata = { title: "Iniciar sesión" }

const emailSchema = z.string().trim().toLowerCase().email().max(254)

export default function SignInPage() {
  return (
    <div className="rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
      <div className="mb-8 space-y-2 text-center">
        <FinzLogo className="mx-auto h-10 w-10 text-ink dark:text-foreground lg:hidden" />
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido a Finz</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus finanzas personales de manera inteligente
        </p>
      </div>

      <div className="space-y-5">
        {/* Google Sign In */}
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <Button type="submit" variant="outline" className="w-full" size="lg">
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          o con tu email
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Email Sign In (enlace mágico) */}
        <form
          action={async (formData: FormData) => {
            "use server"
            // Validación en servidor: nunca confiar en la validación del navegador
            const parsed = emailSchema.safeParse(formData.get("email"))
            if (!parsed.success) redirect("/error?error=Verification")
            await signIn("resend", { email: parsed.data, redirectTo: "/dashboard" })
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@email.com"
              maxLength={254}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Enviar enlace mágico
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  )
}
