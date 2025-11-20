/**
 * Componente: Top Categories List
 * 
 * Lista de las principales categorías con barras de progreso
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CategoryExpense {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface TopCategoriesListProps {
  categories: CategoryExpense[];
}

export function TopCategoriesList({ categories }: TopCategoriesListProps) {
  if (!categories || categories.length === 0) {
    return (
      <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <CardTitle className="text-lg">Top Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-8">
            No hay datos de categorías disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
      <CardHeader>
        <CardTitle className="text-lg">Top Categorías de Gastos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category, index) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-slate-200">
                  {category.name}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-100">
                ${category.amount.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={category.percentage}
                className="h-2"
                style={{
                  ["--progress-background" as any]: category.color,
                } as React.CSSProperties}
              />
              <span className="text-xs text-slate-400 min-w-[45px] text-right">
                {category.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
