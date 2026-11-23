import type { Metadata } from "next"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Error de autenticación" }

const errorMessages: Record<string, string> = {
  Configuration: "Hay un problema con la configuración del servidor.",
  AccessDenied: "No tienes permiso para acceder.",
  Verification: "El enlace no es válido, ha expirado o ya ha sido usado.",
  Default: "Ha ocurrido un error durante la autenticación.",
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const { error } = await searchParams
  // Sólo claves conocidas (evita reflejar texto arbitrario o claves del prototipo)
  const key = typeof error === "string" && Object.hasOwn(errorMessages, error) ? error : "Default"

  return (
    <div className="rounded-[2rem] bg-card p-6 text-center shadow-sm ring-1 ring-border sm:p-8">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Error de autenticación</h1>
      <p className="mt-2 text-sm text-muted-foreground">{errorMessages[key]}</p>
      <Button asChild className="mt-6 w-full" size="lg">
        <Link href="/signin">Volver al inicio de sesión</Link>
      </Button>
    </div>
  )
}
