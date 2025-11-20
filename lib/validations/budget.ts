import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "La categoría es requerida"),
  amount: z
    .string()
    .min(1, "El monto es requerido")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El monto debe ser mayor a 0",
    }),
  period: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateBudgetSchema = z.object({
  categoryId: z.string().optional(),
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El monto debe ser mayor a 0",
    })
    .optional(),
  period: z.enum(["monthly", "weekly", "yearly"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
