"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Target,
  TrendingUp,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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

interface GoalCardProps {
  goal: {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline?: Date | null
    description?: string | null
    isCompleted: boolean
    createdAt: Date
  }
  onEdit: (goal: any) => void
  onDelete: (id: string) => void
  onContribute: (goal: any) => void
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)
  const isOverdue =
    goal.deadline && !goal.isCompleted && new Date(goal.deadline) < new Date()

  const getDaysRemaining = () => {
    if (!goal.deadline || goal.isCompleted) return null
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <>
      <Card
        className={`relative border border-slate-600 overflow-hidden transition-all hover:shadow-md ${
          goal.isCompleted ? "border-green-200 bg-green-50/50" : ""
        } ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}
      >
        {goal.isCompleted && (
          <div className="absolute right-4 top-4">
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Completada
            </Badge>
          </div>
        )}

        {isOverdue && !goal.isCompleted && (
          <div className="absolute right-4 top-4">
            <Badge variant="destructive">Vencida</Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 pr-12">
              <div className="rounded-full bg-primary/10 p-2.5">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{goal.name}</h3>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>

            {!goal.isCompleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Progreso</span>
              <span className="font-semibold">
                {Math.min(progress, 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2.5" />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Actual
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(Number(goal.currentAmount))}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Objetivo
              </div>
              <p className="text-lg font-bold">
                {formatCurrency(Number(goal.targetAmount))}
              </p>
            </div>
          </div>

          {/* Remaining amount */}
          {!goal.isCompleted && remaining > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Faltan{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(remaining)}
                </span>{" "}
                para alcanzar tu meta
              </p>
            </div>
          )}

          {/* Deadline */}
          {goal.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {goal.isCompleted ? "Completada el: " : "Fecha límite: "}
              </span>
              <span
                className={`font-medium ${
                  isOverdue ? "text-red-600" : "text-foreground"
                }`}
              >
                {format(new Date(goal.deadline), "dd 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </span>
              {daysRemaining !== null && !goal.isCompleted && (
                <Badge
                  variant={daysRemaining < 30 ? "destructive" : "secondary"}
                  className="ml-auto"
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} días`
                    : `${Math.abs(daysRemaining)} días atrasado`}
                </Badge>
              )}
            </div>
          )}

          {/* Action Button */}
          {!goal.isCompleted && (
            <Button
              onClick={() => onContribute(goal)}
              className="w-full bg-blue-900 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 text-white"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Contribución
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar meta de ahorro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              meta "{goal.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(goal.id)
                setShowDeleteDialog(false)
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
