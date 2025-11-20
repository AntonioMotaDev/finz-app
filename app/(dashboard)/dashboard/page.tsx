import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  getTotalBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
  getMonthlySavings,
  getExpensesByCategory,
  getIncomeVsExpensesChart,
  getRecentTransactions,
  getAccountsDistribution,
  getMonthlyComparison,
} from "@/lib/services/analytics";
import { IncomeVsExpensesChart } from "@/components/features/dashboard/income-vs-expenses-chart";
import { ExpensesByCategoryChart } from "@/components/features/dashboard/expenses-by-category-chart";
import { RecentTransactionsTable } from "@/components/features/dashboard/recent-transactions-table";
import { AccountsDistributionChart } from "@/components/features/dashboard/accounts-distribution-chart";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id!;

  // Obtener todos los datos en paralelo para mejor performance
  const [
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    expensesByCategory,
    incomeVsExpensesData,
    recentTransactions,
    accountsDistribution,
    monthlyComparison,
  ] = await Promise.all([
    getTotalBalance(userId),
    getMonthlyIncome(userId),
    getMonthlyExpenses(userId),
    getMonthlySavings(userId),
    getExpensesByCategory(userId),
    getIncomeVsExpensesChart(userId),
    getRecentTransactions(userId, 8),
    getAccountsDistribution(userId),
    getMonthlyComparison(userId),
  ]);

  const renderChangeIndicator = (change: number) => {
    if (change === 0) return null;
    const isPositive = change > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido, {session.user.name?.split(" ")[0] || "Usuario"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Balance Total
            </CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              ${totalBalance.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1">En todas las cuentas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Ingresos del Mes
            </CardTitle>
            <div className="rounded-full bg-emerald-500/10 p-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-400">
              ${monthlyIncome.total.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">
                {monthlyIncome.count}{" "}
                {monthlyIncome.count === 1 ? "transacción" : "transacciones"}
              </p>
              {renderChangeIndicator(monthlyComparison.incomeChange)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Gastos del Mes
            </CardTitle>
            <div className="rounded-full bg-rose-500/10 p-2">
              <ArrowDownRight className="h-4 w-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-rose-400">
              ${monthlyExpenses.total.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">
                {monthlyExpenses.count}{" "}
                {monthlyExpenses.count === 1 ? "transacción" : "transacciones"}
              </p>
              {renderChangeIndicator(monthlyComparison.expensesChange)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Ahorro del Mes
            </CardTitle>
            <div className="rounded-full bg-cyan-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold tracking-tight ${
                monthlySavings >= 0 ? "text-cyan-400" : "text-rose-400"
              }`}
            >
              ${monthlySavings.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">Ingresos - Gastos</p>
              {renderChangeIndicator(monthlyComparison.savingsChange)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeVsExpensesChart data={incomeVsExpensesData} />
        <ExpensesByCategoryChart data={expensesByCategory} />
      </div>

      {/* Segunda fila de gráficas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AccountsDistributionChart data={accountsDistribution} />
        <RecentTransactionsTable transactions={recentTransactions} />
      </div>

      {/* Quick Actions - Solo mostrar si no hay datos */}
      {totalBalance === 0 && monthlyIncome.count === 0 && monthlyExpenses.count === 0 && (
        <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
          <CardHeader>
            <CardTitle className="text-lg">Primeros pasos</CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Configura tu aplicación de finanzas
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/accounts"
              className="flex items-center gap-3 rounded-lg border border-slate-800 p-3 hover:border-blue-500/50 hover:bg-slate-900/50 transition-all group"
            >
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-sm text-slate-300 group-hover:text-slate-100">
                Crea tu primera cuenta financiera
              </p>
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-lg border border-slate-800 p-3 hover:border-blue-500/50 hover:bg-slate-900/50 transition-all group"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm text-slate-300 group-hover:text-slate-100">
                Registra tus primeras transacciones
              </p>
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-3 rounded-lg border border-slate-800 p-3 hover:border-blue-500/50 hover:bg-slate-900/50 transition-all group"
            >
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <p className="text-sm text-slate-300 group-hover:text-slate-100">
                Configura tus categorías personalizadas
              </p>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
