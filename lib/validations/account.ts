import { z } from "zod";

// Enum de tipos de cuenta según el schema de Prisma
export const accountTypeSchema = z.enum([
  "BANK_ACCOUNT",
  "SAVINGS_ACCOUNT",
  "CREDIT_CARD",
  "INVESTMENT",
  "CRYPTO",
  "CASH",
  "OTHER",
]);

// Schema para crear una cuenta financiera
export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  type: accountTypeSchema,
  balance: z.coerce.number().default(0),
  currency: z.string().default("MXN"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Schema para actualizar una cuenta financiera
export const updateAccountSchema = createAccountSchema.partial();

// Schema para query params de filtros
export const accountFilterSchema = z.object({
  type: accountTypeSchema.optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  currency: z.string().optional(),
});

// Tipos TypeScript derivados de los schemas
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountFilterInput = z.infer<typeof accountFilterSchema>;

// Labels para los tipos de cuenta (para UI)
export const accountTypeLabels: Record<z.infer<typeof accountTypeSchema>, string> = {
  BANK_ACCOUNT: "Cuenta Bancaria",
  SAVINGS_ACCOUNT: "Cuenta de Ahorros",
  CREDIT_CARD: "Tarjeta de Crédito",
  INVESTMENT: "Inversión",
  CRYPTO: "Criptomonedas",
  CASH: "Efectivo",
  OTHER: "Otro",
};

// Colores predeterminados por tipo de cuenta
export const accountTypeColors: Record<z.infer<typeof accountTypeSchema>, string> = {
  BANK_ACCOUNT: "#3B82F6",      // blue-500
  SAVINGS_ACCOUNT: "#10B981",   // green-500
  CREDIT_CARD: "#8B5CF6",       // violet-500
  INVESTMENT: "#F59E0B",        // amber-500
  CRYPTO: "#EC4899",            // pink-500
  CASH: "#6B7280",              // gray-500
  OTHER: "#6366F1",             // indigo-500
};

// Iconos predeterminados por tipo de cuenta (Lucide React)
export const accountTypeIcons: Record<z.infer<typeof accountTypeSchema>, string> = {
  BANK_ACCOUNT: "Building2",
  SAVINGS_ACCOUNT: "PiggyBank",
  CREDIT_CARD: "CreditCard",
  INVESTMENT: "TrendingUp",
  CRYPTO: "Bitcoin",
  CASH: "Wallet",
  OTHER: "CircleDollarSign",
};
