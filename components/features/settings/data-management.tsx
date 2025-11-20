"use client"

import { useState } from "react"
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
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | null>(null)

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/user/export?format=${format}`)

      if (!response.ok) {
        throw new Error("Error al exportar datos")
      }

      // Descargar el archivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `finz-export-${new Date().toISOString()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Datos exportados correctamente")
      setExportFormat(null)
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error al exportar datos")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Card className="border border-slate-800">
        <CardHeader>
          <CardTitle>Gestión de Datos</CardTitle>
          <CardDescription>
            Exporta o elimina tus datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exportar Datos */}
          <div className="rounded-lg border border-slate-700 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Exportar tus datos</h3>
                <p className="text-sm text-muted-foreground">
                  Descarga una copia completa de toda tu información financiera
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setExportFormat("json")}
                disabled={isExporting}
                className="flex-1 bg-blue-900 hover:bg-gray-800"
              >
                <FileJson className="mr-2 h-4 w-4" />
                Exportar JSON
              </Button>
              <Button
                size="sm"
                onClick={() => setExportFormat("csv")}
                disabled={isExporting}
                className="flex-1 bg-blue-900 hover:bg-gray-800"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación de exportación */}
      <AlertDialog open={exportFormat !== null} onOpenChange={() => setExportFormat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar datos</AlertDialogTitle>
            <AlertDialogDescription>
              Se descargará un archivo {exportFormat?.toUpperCase()} con toda tu información
              financiera incluyendo transacciones, cuentas, categorías, presupuestos y metas
              de ahorro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExporting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => exportFormat && handleExport(exportFormat)}
              disabled={isExporting}
              className="bg-blue-900 hover:bg-gray-800"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
