import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Revisa tu correo
          </CardTitle>
          <CardDescription className="text-center">
            Te hemos enviado un enlace de inicio de sesión a tu correo electrónico.
            Haz clic en el enlace para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground text-center">
              El enlace es válido por 24 horas. Si no ves el correo, revisa tu carpeta de spam.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
