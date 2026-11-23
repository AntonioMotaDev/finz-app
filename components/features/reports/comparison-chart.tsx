/**
 * Componente: Comparison Chart
 * 
 * Gráfica de comparación para reportes (barras o líneas)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ComparisonChartProps {
  title: string;
  data: Array<{
    [key: string]: string | number;
  }>;
  type?: "bar" | "line";
  dataKeys: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  xAxisKey: string;
}

export function ComparisonChart({
  title,
  data,
  type = "bar",
  dataKeys,
  xAxisKey,
}: ComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos disponibles para mostrar
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-muted border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-foreground/80">{entry.name}:</span>
              <span className="text-xs font-bold text-foreground">
                ${entry.value.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="var(--chart-axis)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="var(--chart-axis)"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                }}
              />
              {dataKeys.map((dataKey) => (
                <Bar
                  key={dataKey.key}
                  dataKey={dataKey.key}
                  name={dataKey.label}
                  fill={dataKey.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="var(--chart-axis)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="var(--chart-axis)"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                }}
              />
              {dataKeys.map((dataKey) => (
                <Line
                  key={dataKey.key}
                  type="monotone"
                  dataKey={dataKey.key}
                  name={dataKey.label}
                  stroke={dataKey.color}
                  strokeWidth={2}
                  dot={{ fill: dataKey.color, r: 4 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
