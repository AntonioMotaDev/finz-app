import type { Metadata } from "next"
import { Mail } from "lucide-react"

export const metadata: Metadata = { title: "Revisa tu correo" }

export default function VerifyRequestPage() {
  return (
    <div className="rounded-[2rem] bg-card p-6 text-center shadow-sm ring-1 ring-border sm:p-8">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
        <Mail className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Revisa tu correo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Te hemos enviado un enlace de inicio de sesión. Haz clic en él para acceder a tu cuenta.
      </p>
      <p className="mt-6 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
        El enlace es válido por 24 horas. Si no ves el correo, revisa tu carpeta de spam.
      </p>
    </div>
  )
}
