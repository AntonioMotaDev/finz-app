import { z } from "zod"

// Schema para actualizar perfil de usuario
export const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede tener más de 50 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  image: z.string().url("URL de imagen inválida").optional().nullable(),
})

// Schema para preferencias de usuario
export const userPreferencesSchema = z.object({
  currency: z.enum(["MXN", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"]),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  theme: z.enum(["light", "dark", "system"]),
})

// Schema para exportar datos
export const exportDataSchema = z.object({
  format: z.enum(["json", "csv"]),
  includeTransactions: z.boolean().default(true),
  includeAccounts: z.boolean().default(true),
  includeCategories: z.boolean().default(true),
  includeBudgets: z.boolean().default(true),
  includeSavingsGoals: z.boolean().default(true),
})

// Types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>
export type ExportDataInput = z.infer<typeof exportDataSchema>

// Labels para UI
export const currencyLabels: Record<z.infer<typeof userPreferencesSchema>["currency"], string> = {
  MXN: "Peso Mexicano (MXN)",
  USD: "Dólar Estadounidense (USD)",
  EUR: "Euro (EUR)",
  GBP: "Libra Esterlina (GBP)",
  JPY: "Yen Japonés (JPY)",
  CAD: "Dólar Canadiense (CAD)",
  AUD: "Dólar Australiano (AUD)",
  CHF: "Franco Suizo (CHF)",
}

export const dateFormatLabels: Record<z.infer<typeof userPreferencesSchema>["dateFormat"], string> = {
  "DD/MM/YYYY": "DD/MM/YYYY (31/12/2024)",
  "MM/DD/YYYY": "MM/DD/YYYY (12/31/2024)",
  "YYYY-MM-DD": "YYYY-MM-DD (2024-12-31)",
}

export const themeLabels: Record<z.infer<typeof userPreferencesSchema>["theme"], string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
}
