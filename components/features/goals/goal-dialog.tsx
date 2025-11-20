"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GoalForm } from "@/components/features/goals/goal-form"
import { ContributeForm } from "@/components/features/goals/contribute-form"
import type { SavingsGoalFormData } from "@/lib/validations/savings-goal"

type DialogMode = "create" | "edit" | "contribute"

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: DialogMode
  goal?: any
  onSubmit: (data: SavingsGoalFormData) => Promise<void>
  onContribute?: (amount: number) => Promise<void>
  isSubmitting?: boolean
}

export function GoalDialog({
  open,
  onOpenChange,
  mode,
  goal,
  onSubmit,
  onContribute,
  isSubmitting = false,
}: GoalDialogProps) {
  const getDialogTitle = () => {
    switch (mode) {
      case "create":
        return "Nueva Meta de Ahorro"
      case "edit":
        return "Editar Meta de Ahorro"
      case "contribute":
        return "Agregar Contribución"
      default:
        return ""
    }
  }

  const getDialogDescription = () => {
    switch (mode) {
      case "create":
        return "Crea una nueva meta de ahorro para alcanzar tus objetivos financieros."
      case "edit":
        return "Actualiza los detalles de tu meta de ahorro."
      case "contribute":
        return `Agrega una contribución para acercarte a tu meta de "${goal?.name}".`
      default:
        return ""
    }
  }

  const getDefaultValues = (): Partial<SavingsGoalFormData> | undefined => {
    if (mode === "edit" && goal) {
      return {
        name: goal.name,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        deadline: goal.deadline
          ? new Date(goal.deadline).toISOString().split("T")[0]
          : "",
        description: goal.description || "",
      }
    }
    return undefined
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {mode === "contribute" && onContribute ? (
          <ContributeForm
            goal={goal}
            onSubmit={onContribute}
            isSubmitting={isSubmitting}
          />
        ) : (
          <GoalForm
            defaultValues={getDefaultValues()}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel={mode === "create" ? "Crear Meta" : "Guardar Cambios"}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
