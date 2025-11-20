import { z } from "zod";

// Enum de tipos de transacción según el schema de Prisma
export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);

// Schema para crear una transacción
export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  accountId: z.string().min(1, "La cuenta es requerida"),
  categoryId: z.string().optional(),
  amount: z.coerce
    .number()
    .positive("El monto debe ser positivo")
    .min(0.01, "El monto mínimo es 0.01"),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(200, "La descripción no puede exceder 200 caracteres"),
  date: z.coerce.date(),
  notes: z.string().max(500, "Las notas no pueden exceder 500 caracteres").optional(),
  toAccountId: z.string().optional(), // Solo para transferencias
}).refine(
  (data) => {
    // Si es transferencia, toAccountId es requerido
    if (data.type === "TRANSFER") {
      return !!data.toAccountId && data.toAccountId !== data.accountId;
    }
    return true;
  },
  {
    message: "Para transferencias se requiere una cuenta destino diferente",
    path: ["toAccountId"],
  }
).refine(
  (data) => {
    // Si NO es transferencia, categoryId es requerido
    if (data.type !== "TRANSFER") {
      return !!data.categoryId && data.categoryId.length > 0;
    }
    return true;
  },
  {
    message: "La categoría es requerida",
    path: ["categoryId"],
  }
);

// Schema para actualizar una transacción
export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string(),
});

// Schema para filtros de transacciones
export const transactionFilterSchema = z.object({
  type: transactionTypeSchema.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().optional(), // Búsqueda por descripción
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.enum(["date", "amount", "description"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema para transferencia entre cuentas
export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "La cuenta origen es requerida"),
  toAccountId: z.string().min(1, "La cuenta destino es requerida"),
  amount: z.coerce
    .number()
    .positive("El monto debe ser positivo")
    .min(0.01, "El monto mínimo es 0.01"),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(200, "La descripción no puede exceder 200 caracteres"),
  date: z.coerce.date(),
  notes: z.string().max(500, "Las notas no pueden exceder 500 caracteres").optional(),
}).refine(
  (data) => data.fromAccountId !== data.toAccountId,
  {
    message: "Las cuentas origen y destino deben ser diferentes",
    path: ["toAccountId"],
  }
);

// Tipos TypeScript derivados de los schemas
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
export type TransferInput = z.infer<typeof transferSchema>;

// Labels para los tipos de transacción (para UI)
export const transactionTypeLabels: Record<z.infer<typeof transactionTypeSchema>, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
  TRANSFER: "Transferencia",
};

// Colores para los tipos de transacción
export const transactionTypeColors: Record<z.infer<typeof transactionTypeSchema>, string> = {
  INCOME: "#10B981",    // green-500
  EXPENSE: "#EF4444",   // red-500
  TRANSFER: "#3B82F6",  // blue-500
};

// Iconos para los tipos de transacción (Lucide React)
export const transactionTypeIcons: Record<z.infer<typeof transactionTypeSchema>, string> = {
  INCOME: "TrendingUp",
  EXPENSE: "TrendingDown",
  TRANSFER: "ArrowLeftRight",
};
