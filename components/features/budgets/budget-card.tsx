"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, Calendar, MoreVertical, Pencil, Trash2, TrendingDown } from "lucide-react";
import * as Icons from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BudgetCardProps {
  budget: {
    id: string;
    amount: number;
    period: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    spent: number;
    percentage: number;
    remaining: number;
    daysRemaining: number;
    category: {
      id: string;
      name: string;
      color?: string | null;
      icon?: string | null;
    };
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const getAlertLevel = () => {
    if (budget.percentage >= 100) return "danger";
    if (budget.percentage >= 80) return "warning";
    return "normal";
  };

  const alertLevel = getAlertLevel();

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      weekly: "Semanal",
      monthly: "Mensual",
      yearly: "Anual",
    };
    return labels[period] || period;
  };

  // Obtener el componente del icono dinámicamente
  const IconComponent = budget.category.icon 
    ? (Icons as any)[budget.category.icon] || Icons.Tag 
    : Icons.Tag;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md border border-slate-600 ${
      !budget.isActive ? "opacity-60" : ""
    }`}>
      {/* Barra de color lateral según nivel de alerta */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          alertLevel === "danger"
            ? "bg-red-500"
            : alertLevel === "warning"
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: budget.category.color
                  ? `${budget.category.color}20`
                  : "#f3f4f6",
              }}
            >
              <IconComponent
                className="h-5 w-5"
                style={{
                  color: budget.category.color || "#6b7280",
                }}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{budget.category.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getPeriodLabel(budget.period)}
                </Badge>
                {!budget.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(budget.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Montos */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${budget.spent.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              de ${budget.amount.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress
              value={budget.percentage}
              className={`h-2 ${
                alertLevel === "danger"
                  ? "[&>div]:bg-red-500"
                  : alertLevel === "warning"
                  ? "[&>div]:bg-yellow-500"
                  : "[&>div]:bg-green-500"
              }`}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-medium ${
                  alertLevel === "danger"
                    ? "text-red-600"
                    : alertLevel === "warning"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {budget.percentage.toFixed(1)}% usado
              </span>
              <span className="text-muted-foreground">
                ${budget.remaining.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} restante
              </span>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertLevel !== "normal" && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              alertLevel === "danger"
                ? "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
                : "bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100"
            }`}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              {alertLevel === "danger"
                ? "¡Has superado tu presupuesto!"
                : "Te estás acercando al límite de tu presupuesto"}
            </span>
          </div>
        )}

        {/* Fechas */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(new Date(budget.startDate), "d MMM", { locale: es })} -{" "}
              {format(new Date(budget.endDate), "d MMM yyyy", { locale: es })}
            </span>
          </div>
          {budget.daysRemaining > 0 ? (
            <span className="font-medium">
              {budget.daysRemaining} {budget.daysRemaining === 1 ? "día" : "días"} restantes
            </span>
          ) : (
            <span className="font-medium text-red-600">Finalizado</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
