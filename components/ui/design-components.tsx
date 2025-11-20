/**
 * Componentes Reutilizables del Sistema de Diseño
 * 
 * Estos componentes usan el sistema de diseño y pueden ser
 * reutilizados en toda la aplicación para mantener consistencia.
 */

import { cn } from "@/lib/utils";
import { card, container, colors, shadows } from "@/lib/design-system";

// ============================================
// PAGE HEADER
// ============================================

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className={cn(colors.textMuted, "mt-1")}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatCardProps) {
  return (
    <div className={cn(card.base, "p-6")}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(colors.textSecondary, "text-sm font-medium")}>
          {title}
        </h3>
        {icon && (
          <div className="rounded-full bg-blue-500/10 p-2">{icon}</div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className={cn(colors.textMuted, "text-xs")}>{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? colors.success : colors.error
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl">
      <div className="rounded-full bg-slate-900 p-4 mb-4">{icon}</div>
      <p className="text-lg font-medium">{title}</p>
      <p className={cn(colors.textMuted, "text-sm mt-1")}>{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ============================================
// SECTION CONTAINER
// ============================================

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <div className={cn(container.section, className)}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className={cn(colors.textMuted, "text-sm mt-1")}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// INFO BADGE
// ============================================

interface InfoBadgeProps {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "error" | "warning" | "info";
}

export function InfoBadge({
  label,
  value,
  variant = "default",
}: InfoBadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-emerald-500/10 text-emerald-400",
    error: "bg-rose-500/10 text-rose-400",
    warning: "bg-amber-500/10 text-amber-400",
    info: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5",
        variantStyles[variant]
      )}
    >
      <span className="text-xs font-medium">{label}:</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

// ============================================
// GRADIENT CARD (para destacar secciones importantes)
// ============================================

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "blue" | "purple" | "cyan" | "emerald";
}

export function GradientCard({
  children,
  className,
  gradient = "blue",
}: GradientCardProps) {
  const gradients = {
    blue: "from-slate-900 via-slate-900 to-blue-950",
    purple: "from-slate-900 via-slate-900 to-purple-950",
    cyan: "from-slate-900 via-slate-900 to-cyan-950",
    emerald: "from-slate-900 via-slate-900 to-emerald-950",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-gradient-to-br p-6",
        gradients[gradient],
        shadows.lg,
        className
      )}
    >
      {children}
    </div>
  );
}
