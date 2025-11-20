import { z } from "zod";

// Enum de tipos de categoría según el schema de Prisma
export const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"]);

// Schema para crear una categoría
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  type: categoryTypeSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido (debe ser hex)").optional(),
  icon: z.string().min(1, "El icono es requerido"),
  description: z
    .string()
    .max(200, "La descripción no puede exceder 200 caracteres")
    .optional(),
});

// Schema para actualizar una categoría
export const updateCategorySchema = createCategorySchema.partial();

// Schema para filtros de categorías
export const categoryFilterSchema = z.object({
  type: categoryTypeSchema.optional(),
  search: z.string().optional(),
});

// Tipos TypeScript derivados de los schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryFilterInput = z.infer<typeof categoryFilterSchema>;

// Labels para los tipos de categoría (para UI)
export const categoryTypeLabels: Record<z.infer<typeof categoryTypeSchema>, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
};

// Colores predeterminados para categorías
export const defaultCategoryColors = [
  "#EF4444", // red-500
  "#F59E0B", // amber-500
  "#10B981", // green-500
  "#3B82F6", // blue-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#A855F7", // purple-500
];

// Iconos disponibles para categorías (Lucide React)
export const availableCategoryIcons = [
  // Gastos - Alimentación
  { value: "Utensils", label: "Utensilios", category: "food" },
  { value: "Coffee", label: "Café", category: "food" },
  { value: "Pizza", label: "Pizza", category: "food" },
  { value: "ShoppingCart", label: "Carrito", category: "food" },
  
  // Gastos - Transporte
  { value: "Car", label: "Auto", category: "transport" },
  { value: "Bus", label: "Autobús", category: "transport" },
  { value: "Bike", label: "Bicicleta", category: "transport" },
  { value: "Plane", label: "Avión", category: "transport" },
  { value: "Train", label: "Tren", category: "transport" },
  { value: "Fuel", label: "Combustible", category: "transport" },
  
  // Gastos - Vivienda
  { value: "Home", label: "Casa", category: "housing" },
  { value: "Building2", label: "Edificio", category: "housing" },
  { value: "Wrench", label: "Herramienta", category: "housing" },
  { value: "Lightbulb", label: "Bombilla", category: "housing" },
  
  // Gastos - Servicios
  { value: "Zap", label: "Electricidad", category: "services" },
  { value: "Wifi", label: "Internet", category: "services" },
  { value: "Phone", label: "Teléfono", category: "services" },
  { value: "Tv", label: "TV", category: "services" },
  
  // Gastos - Entretenimiento
  { value: "Film", label: "Película", category: "entertainment" },
  { value: "Music", label: "Música", category: "entertainment" },
  { value: "Gamepad2", label: "Videojuegos", category: "entertainment" },
  { value: "PartyPopper", label: "Fiesta", category: "entertainment" },
  { value: "Ticket", label: "Ticket", category: "entertainment" },
  
  // Gastos - Salud
  { value: "Heart-plus", label: "Corazón", category: "health" },
  { value: "Stethoscope", label: "Estetoscopio", category: "health" },
  { value: "Pill", label: "Píldora", category: "health" },
  { value: "Activity", label: "Actividad", category: "health" },
  
  // Gastos - Ropa
  { value: "ShoppingBag", label: "Bolsa", category: "clothing" },
  { value: "Shirt", label: "Camisa", category: "clothing" },
  
  // Gastos - Educación
  { value: "GraduationCap", label: "Graduación", category: "education" },
  { value: "BookOpen", label: "Libro", category: "education" },
  { value: "School", label: "Escuela", category: "education" },
  
  // Gastos - Trabajo
  { value: "Briefcase", label: "Maletín", category: "work" },
  { value: "Laptop", label: "Laptop", category: "work" },
  
  // Gastos - Regalos
  { value: "Gift", label: "Regalo", category: "gifts" },
  { value: "Heart", label: "Corazón", category: "gifts" },
  
  // Gastos - Viajes
  { value: "Palmtree", label: "Palmera", category: "travel" },
  { value: "Map", label: "Mapa", category: "travel" },
  { value: "Compass", label: "Brújula", category: "travel" },
  
  // Gastos - Suscripciones
  { value: "CreditCard", label: "Tarjeta", category: "subscriptions" },
  { value: "Repeat", label: "Repetir", category: "subscriptions" },
  
  // Ingresos
  { value: "DollarSign", label: "Dólar", category: "income" },
  { value: "Wallet", label: "Cartera", category: "income" },
  { value: "TrendingUp", label: "Tendencia", category: "income" },
  { value: "CircleDollarSign", label: "Moneda", category: "income" },
  { value: "Banknote", label: "Billete", category: "income" },
  { value: "BadgeDollarSign", label: "Insignia", category: "income" },
  { value: "Coins", label: "Monedas", category: "income" },
  
  // General
  { value: "Tag", label: "Etiqueta", category: "general" },
  { value: "Package", label: "Paquete", category: "general" },
  { value: "Star", label: "Estrella", category: "general" },
  { value: "Sparkles", label: "Destellos", category: "general" },
  { value: "Circle", label: "Círculo", category: "general" },
];

// Categorías predeterminadas para gastos
export const defaultExpenseCategories = [
  { name: "Alimentación", type: "EXPENSE" as const, icon: "Utensils", color: "#EF4444" },
  { name: "Transporte", type: "EXPENSE" as const, icon: "Car", color: "#F59E0B" },
  { name: "Vivienda", type: "EXPENSE" as const, icon: "Home", color: "#8B5CF6" },
  { name: "Servicios", type: "EXPENSE" as const, icon: "Zap", color: "#3B82F6" },
  { name: "Entretenimiento", type: "EXPENSE" as const, icon: "Film", color: "#EC4899" },
  { name: "Salud", type: "EXPENSE" as const, icon: "Heart", color: "#10B981" },
  { name: "Ropa", type: "EXPENSE" as const, icon: "ShoppingBag", color: "#6366F1" },
  { name: "Educación", type: "EXPENSE" as const, icon: "GraduationCap", color: "#14B8A6" },
  { name: "Trabajo", type: "EXPENSE" as const, icon: "Briefcase", color: "#F97316" },
  { name: "Regalos", type: "EXPENSE" as const, icon: "Gift", color: "#EC4899" },
  { name: "Viajes", type: "EXPENSE" as const, icon: "Palmtree", color: "#06B6D4" },
  { name: "Suscripciones", type: "EXPENSE" as const, icon: "Repeat", color: "#8B5CF6" },
  { name: "Mantenimiento", type: "EXPENSE" as const, icon: "Wrench", color: "#84CC16" },
  { name: "Otros", type: "EXPENSE" as const, icon: "Package", color: "#6B7280" },
];

// Categorías predeterminadas para ingresos
export const defaultIncomeCategories = [
  { name: "Salario", type: "INCOME" as const, icon: "DollarSign", color: "#10B981" },
  { name: "Freelance", type: "INCOME" as const, icon: "Briefcase", color: "#3B82F6" },
  { name: "Inversiones", type: "INCOME" as const, icon: "TrendingUp", color: "#8B5CF6" },
  { name: "Regalos/Bonos", type: "INCOME" as const, icon: "Gift", color: "#EC4899" },
  { name: "Reembolsos", type: "INCOME" as const, icon: "CircleDollarSign", color: "#F59E0B" },
  { name: "Premios", type: "INCOME" as const, icon: "Star", color: "#F97316" },
  { name: "Otros Ingresos", type: "INCOME" as const, icon: "Coins", color: "#14B8A6" },
];
