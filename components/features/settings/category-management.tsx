"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "@/components/features/categories/category-form"
import { toast } from "sonner"
import { Plus, Loader2, Tag, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react"
import * as Icons from "lucide-react"
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

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
  color?: string | null
  icon?: string | null
  description?: string | null
  isDefault: boolean
  _count?: {
    transactions: number
  }
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Función para renderizar el icono dinámicamente
  const renderIcon = (iconName: string | null | undefined, color?: string | null) => {
    if (!iconName) return <Tag className="h-5 w-5" style={{ color: color || undefined }} />
    
    const IconComponent = (Icons as any)[iconName] || Tag
    return <IconComponent className="h-5 w-5" style={{ color: color || undefined }} />
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Error al cargar categorías")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar categorías")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar categoría")
      }

      toast.success("Categoría eliminada correctamente")
      fetchCategories()
      setSelectedCategory(null)
      setDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error al eliminar categoría")
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedCategory(null)
  }

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")

  if (isLoading) {
    return (
      <Card className="border border-slate-800">
        <CardContent className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Categorías</CardTitle>
              <CardDescription>
                Personaliza tus categorías de ingresos y gastos
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="bg-blue-900 hover:bg-gray-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categorías de Gastos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold">Gastos</h3>
              <Badge variant="secondary">{expenseCategories.length}</Badge>
            </div>
            <div className="grid gap-2">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {renderIcon(category.icon, category.color)}
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                    {category.isDefault && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        Predeterminada
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {category._count && category._count.transactions > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {category._count.transactions} transacciones
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categorías de Ingresos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Ingresos</h3>
              <Badge variant="secondary">{incomeCategories.length}</Badge>
            </div>
            <div className="grid gap-2">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {renderIcon(category.icon, category.color)}
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                    {category.isDefault && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        Predeterminada 
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {category._count && category._count.transactions > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {category._count.transactions} transacciones
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Actualiza la información de la categoría"        
                : "Crea una nueva categoría personalizada"}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory || undefined}
            onSaved={() => {
              fetchCategories()
              handleDialogClose()
            }}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría <strong>{selectedCategory?.name}</strong>.
              {selectedCategory?._count && selectedCategory._count.transactions > 0 ? (
                <span className="block mt-2 text-red-600">
                  Advertencia: Esta categoría tiene {selectedCategory._count.transactions}{" "}
                  transacciones asociadas. Las transacciones quedarán sin categoría.
                </span>
              ) : (
                " Esta acción no se puede deshacer."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
