"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"

export function DangerZone() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmText !== "ELIMINAR") {
      toast.error("Debes escribir ELIMINAR para confirmar")
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar cuenta")
      }

      toast.success("Cuenta eliminada correctamente")
      
      // Cerrar sesión y redirigir
      await signOut({ callbackUrl: "/" })
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error al eliminar cuenta")
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Zona de Peligro</CardTitle>
          <CardDescription>
            Acciones irreversibles en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Eliminar Cuenta */}
          <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-red-600 dark:text-red-400">
                  Eliminar cuenta permanentemente
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará tu cuenta y todos tus datos de forma permanente.
                  No podrás recuperar tu información una vez eliminada.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar mi cuenta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Esta acción <strong>NO SE PUEDE DESHACER</strong>. Esto eliminará
                permanentemente tu cuenta y todos los datos asociados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Todas tus cuentas financieras</li>
                <li>Todas tus transacciones</li>
                <li>Todas tus categorías personalizadas</li>
                <li>Todos tus presupuestos</li>
                <li>Todas tus metas de ahorro</li>
              </ul>
              <div className="mt-4 space-y-2">
                <p className="font-medium text-foreground">
                  Para confirmar, escribe <span className="font-bold">ELIMINAR</span> en el campo
                  de abajo:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={isDeleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== "ELIMINAR"}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar permanentemente
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
