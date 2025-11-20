"use client"

import { useState, useEffect } from "react"
import { Plus, Target, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoalCard, GoalDialog } from "@/components/features/goals"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { SavingsGoalFormData } from "@/lib/validations/savings-goal"

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: Date | null
  description?: string | null
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export function GoalsPageClient() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "contribute">("create")
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/savings-goals")
      if (!response.ok) throw new Error("Error al cargar las metas")
      const data = await response.json()
      setGoals(data)
    } catch (error) {
      toast.error("Error al cargar las metas de ahorro")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: SavingsGoalFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear la meta")

      const newGoal = await response.json()
      setGoals([newGoal, ...goals])
      setDialogOpen(false)
      toast.success("Meta de ahorro creada exitosamente")
    } catch (error) {
      toast.error("Error al crear la meta de ahorro")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: SavingsGoalFormData) => {
    if (!selectedGoal) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/savings-goals/${selectedGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error al actualizar la meta" }))
        throw new Error(errorData.error || "Error al actualizar la meta")
      }

      const updatedGoal = await response.json()
      setGoals(goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)))
      setDialogOpen(false)
      toast.success("Meta actualizada exitosamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la meta")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/savings-goals/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar la meta")

      setGoals(goals.filter((g) => g.id !== id))
      toast.success("Meta eliminada exitosamente")
    } catch (error) {
      toast.error("Error al eliminar la meta")
      console.error(error)
    }
  }

  const handleContribute = async (amount: number) => {
    if (!selectedGoal) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/savings-goals/${selectedGoal.id}/contribute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      )

      if (!response.ok) throw new Error("Error al agregar contribución")

      const updatedGoal = await response.json()
      setGoals(goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)))
      setDialogOpen(false)

      if (updatedGoal.isCompleted) {
        toast.success("¡Felicitaciones! Has completado tu meta de ahorro 🎉")
      } else {
        toast.success("Contribución agregada exitosamente")
      }
    } catch (error) {
      toast.error("Error al agregar la contribución")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateDialog = () => {
    setDialogMode("create")
    setSelectedGoal(null)
    setDialogOpen(true)
  }

  const openEditDialog = (goal: SavingsGoal) => {
    setDialogMode("edit")
    setSelectedGoal(goal)
    setDialogOpen(true)
  }

  const openContributeDialog = (goal: SavingsGoal) => {
    setDialogMode("contribute")
    setSelectedGoal(goal)
    setDialogOpen(true)
  }

  const activeGoals = goals.filter((g) => !g.isCompleted)
  const completedGoals = goals.filter((g) => g.isCompleted)

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metas de Ahorro</h1>
          <p className="text-muted-foreground mt-1">
            Establece y alcanza tus objetivos financieros
          </p>
        </div>
        <Button className="bg-blue-900 hover:bg-gray-800" onClick={openCreateDialog} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Meta
        </Button>
      </div>

      {/* Summary Stats */}
      {goals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Metas Activas</span>
            </div>
            <p className="text-2xl font-bold">{activeGoals.length}</p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Completadas</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {completedGoals.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Total Ahorrado</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Progreso General</span>
            </div>
            <p className="text-2xl font-bold">
              {overallProgress.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Goals Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Activas ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="all">Todas ({goals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeGoals.length === 0 ? (
            <EmptyState
              title="No tienes metas activas"
              description="Crea tu primera meta de ahorro para comenzar a alcanzar tus objetivos financieros."
              action={
                <Button onClick={openCreateDialog} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Meta
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  onContribute={openContributeDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedGoals.length === 0 ? (
            <EmptyState
              title="No has completado ninguna meta aún"
              description="Sigue ahorrando para alcanzar tus metas y verlas aquí."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  onContribute={openContributeDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {goals.length === 0 ? (
            <EmptyState
              title="No tienes metas de ahorro"
              description="Crea tu primera meta de ahorro para comenzar a alcanzar tus objetivos financieros."
              action={
                <Button onClick={openCreateDialog} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Meta
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  onContribute={openContributeDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        goal={selectedGoal}
        onSubmit={dialogMode === "edit" ? handleEdit : handleCreate}
        onContribute={handleContribute}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Target className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  )
}
