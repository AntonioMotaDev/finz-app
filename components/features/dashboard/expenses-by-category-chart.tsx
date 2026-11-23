"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryExpense {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  [key: string]: any;
}

interface Props {
  data: CategoryExpense[];
}

export function ExpensesByCategoryChart({ data }: Props) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-background p-3 shadow-xl">
          <p className="text-sm font-medium text-foreground/80 mb-2">{item.name}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">Monto:</span>
              <span className="text-xs font-medium text-foreground">
                ${item.amount.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground ml-4">
                {item.percentage.toFixed(1)}% del total
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No hay gastos este mes</p>
        </CardContent>
      </Card>
    );
  }

  // Tomar solo las top 5 categorías, el resto agruparlo en "Otros"
  const topCategories = data.slice(0, 5);
  const othersAmount = data.slice(5).reduce((sum, cat) => sum + cat.amount, 0);
  const othersPercentage = data.slice(5).reduce((sum, cat) => sum + cat.percentage, 0);

  const chartData =
    othersAmount > 0
      ? [
          ...topCategories,
          {
            name: "Otros",
            amount: othersAmount,
            color: "#64748b",
            percentage: othersPercentage,
          },
        ]
      : topCategories;

  const totalAmount = data.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
        <p className="text-sm text-muted-foreground">Este mes</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Gráfica */}
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total en el centro */}
            <div className="text-center -mt-32 pointer-events-none">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">
                ${totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Leyenda */}
          <div className="w-full lg:w-1/2 space-y-2">
            {chartData.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground/80 truncate">
                    {category.name}
                  </span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                  <span className="text-sm font-medium text-foreground">
                    ${category.amount.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
