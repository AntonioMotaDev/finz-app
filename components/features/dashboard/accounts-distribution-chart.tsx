"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { accountTypeLabels } from "@/lib/validations/account";

interface AccountDistribution {
  name: string;
  balance: number;
  type: string;
  color: string;
  percentage: number;
}

interface Props {
  data: AccountDistribution[];
}

export function AccountsDistributionChart({ data }: Props) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 shadow-xl">
          <p className="text-sm font-medium text-slate-300 mb-2">{item.name}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Tipo:</span>
              <span className="text-xs font-medium text-slate-200">
                {accountTypeLabels[item.type as keyof typeof accountTypeLabels] || item.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Balance:</span>
              <span className="text-xs font-medium text-slate-200">
                ${item.balance.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {item.percentage.toFixed(1)}% del total
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Formatear valores para el eje Y
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <CardTitle className="text-lg">Distribución por Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-slate-400">No hay cuentas con balance</p>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = data.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
      <CardHeader>
        <CardTitle className="text-lg">Distribución por Cuenta</CardTitle>
        <p className="text-sm text-slate-400">
          Total: ${totalBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(100, 116, 139, 0.1)" }} />
            <Bar dataKey="balance" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {data.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: account.color }}
                />
                <span className="text-xs text-slate-300 truncate">{account.name}</span>
              </div>
              <span className="text-xs font-medium text-slate-200 flex-shrink-0 ml-2">
                {account.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
