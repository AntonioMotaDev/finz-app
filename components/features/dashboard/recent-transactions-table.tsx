"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: Date;
  category?: {
    name: string;
    color: string | null;
  } | null;
  account: {
    name: string;
  };
}

interface Props {
  transactions: RecentTransaction[];
}

export function RecentTransactionsTable({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-slate-400 mb-4">No hay transacciones recientes</p>
          <Link
            href="/transactions"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Registrar primera transacción →
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
      case "EXPENSE":
        return <ArrowDownRight className="h-4 w-4 text-rose-400" />;
      case "TRANSFER":
        return <ArrowRightLeft className="h-4 w-4 text-cyan-400" />;
      default:
        return null;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "text-emerald-400";
      case "EXPENSE":
        return "text-rose-400";
      case "TRANSFER":
        return "text-cyan-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
          <p className="text-sm text-slate-400 mt-1">Últimos movimientos</p>
        </div>
        <Link
          href="/transactions"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Ver todas →
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between px-6 py-3 hover:bg-slate-900/50 transition-colors group"
            >
              {/* Icono y descripción */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="rounded-full bg-slate-900 p-2 group-hover:bg-slate-800 transition-colors">
                  {getTypeIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">
                      {transaction.account.name}
                    </span>
                    {transaction.category && (
                      <>
                        <span className="text-xs text-slate-600">•</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: transaction.category.color || "#64748b",
                            }}
                          />
                          <span className="text-xs text-slate-500">
                            {transaction.category.name}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Monto y fecha */}
              <div className="flex flex-col items-end flex-shrink-0 ml-4">
                <span className={`text-sm font-medium ${getAmountColor(transaction.type)}`}>
                  {transaction.type === "EXPENSE" ? "-" : "+"}$
                  {transaction.amount.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-slate-500">
                  {format(new Date(transaction.date), "dd MMM", { locale: es })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
