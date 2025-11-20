import { z } from "zod"

export const savingsGoalSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  targetAmount: z
    .number()
    .positive("El monto objetivo debe ser mayor a 0")
    .max(999999999.99, "El monto objetivo es demasiado grande"),
  currentAmount: z
    .number()
    .min(0, "El monto actual no puede ser negativo")
    .max(999999999.99, "El monto actual es demasiado grande")
    .default(0),
  deadline: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: "La fecha límite debe ser hoy o en el futuro" }
    ),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
})

export const contributeSchema = z.object({
  amount: z
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(999999999.99, "El monto es demasiado grande"),
})

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>
export type ContributeFormData = z.infer<typeof contributeSchema>
