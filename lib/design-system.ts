/**
 * Sistema de Diseño Centralizado
 * 
 * Este archivo contiene todas las clases de Tailwind CSS reutilizables
 * para mantener consistencia en toda la aplicación.
 */

// ============================================
// COLORES DEL SISTEMA
// ============================================

export const colors = {
  // Backgrounds
  bgPrimary: "bg-slate-950",
  bgSecondary: "bg-slate-900",
  bgTertiary: "bg-slate-800",
  
  // Borders
  borderPrimary: "border-slate-800",
  borderSecondary: "border-slate-700",
  borderActive: "border-blue-500",
  
  // Text
  textPrimary: "text-slate-100",
  textSecondary: "text-slate-300",
  textMuted: "text-slate-400",
  textDisabled: "text-slate-500",
  
  // Brand
  brandPrimary: "bg-blue-600",
  brandHover: "bg-blue-700",
  brandText: "text-blue-400",
  
  // Status
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
  info: "text-cyan-400",
} as const;

// ============================================
// COMPONENTES COMUNES
// ============================================

export const card = {
  base: "rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-all",
  header: "flex items-center justify-between p-6 border-b border-slate-800",
  content: "p-6",
  footer: "px-6 py-4 border-t border-slate-800",
} as const;

export const button = {
  base: "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
  sizes: {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  },
  variants: {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-900 text-slate-100 border border-slate-800 hover:bg-slate-800",
    outline: "border border-slate-800 bg-transparent hover:bg-slate-900",
    ghost: "hover:bg-slate-900 hover:text-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  },
} as const;

export const input = {
  base: "flex h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
} as const;

export const select = {
  trigger: "border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-100",
  content: "border-slate-800 bg-slate-950 text-slate-100 shadow-xl shadow-black/50",
  item: "text-slate-300 hover:bg-slate-900 hover:text-slate-100 focus:bg-slate-900 focus:text-slate-100",
} as const;

export const dropdown = {
  content: "border-slate-800 bg-slate-950 text-slate-100 shadow-xl shadow-black/50",
  item: "text-slate-300 hover:bg-slate-900 hover:text-slate-100 focus:bg-slate-900 focus:text-slate-100",
  separator: "bg-slate-800",
} as const;

export const dialog = {
  overlay: "bg-black/90 backdrop-blur-sm",
  content: "border border-slate-800 bg-slate-950 shadow-2xl rounded-xl",
  header: "space-y-2",
  title: "text-xl font-semibold text-slate-100",
  description: "text-sm text-slate-400",
} as const;

// ============================================
// LAYOUTS
// ============================================

export const container = {
  page: "space-y-8 p-6 md:p-8 lg:p-10",
  section: "space-y-6",
} as const;

export const grid = {
  responsive: "grid gap-5 md:grid-cols-2 lg:grid-cols-3",
  stats: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
} as const;

// ============================================
// UTILIDADES
// ============================================

export const shadows = {
  sm: "shadow-sm",
  md: "shadow-lg",
  lg: "shadow-xl shadow-black/50",
  xl: "shadow-2xl",
} as const;

export const transitions = {
  base: "transition-colors",
  all: "transition-all",
  fast: "transition-all duration-150",
  slow: "transition-all duration-300",
} as const;

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Combina clases de forma segura
 * Uso: cn(card.base, "custom-class")
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
