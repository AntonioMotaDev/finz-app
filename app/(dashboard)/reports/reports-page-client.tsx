"use client";

import { useState, useEffect } from "react";
import {
  ReportTypeSelector,
  DateRangeSelector,
  ReportStatCard,
  TopCategoriesList,
  ComparisonChart,
} from "@/components/features/reports";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp } from "lucide-react";
import {
  WeeklyReportData,
  MonthlyReportData,
  AnnualReportData,
  NetWorthReportData,
} from "@/lib/services/reports";
import { startOfWeek, endOfWeek, format } from "date-fns";
import {
  exportWeeklyReportToCSV,
  exportMonthlyReportToCSV,
  exportAnnualReportToCSV,
  exportNetWorthReportToCSV,
} from "@/lib/utils/export";

type ReportType = "weekly" | "monthly" | "annual" | "networth";

export default function ReportsPageClient() {
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del reporte
  useEffect(() => {
    loadReportData();
  }, [reportType, currentDate]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/reports?type=${reportType}`;

      if (reportType === "weekly") {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        url += `&startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      } else if (reportType === "monthly") {
        url += `&year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`;
      } else if (reportType === "annual") {
        url += `&year=${currentDate.getFullYear()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al cargar el reporte");
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    switch (reportType) {
      case "weekly":
        exportWeeklyReportToCSV(reportData);
        break;
      case "monthly":
        exportMonthlyReportToCSV(reportData);
        break;
      case "annual":
        exportAnnualReportToCSV(reportData);
        break;
      case "networth":
        exportNetWorthReportToCSV(reportData);
        break;
    }
  };

  const renderWeeklyReport = (data: WeeklyReportData) => {
    if (!data || !data.comparisonWithPrevious) {
      return null;
    }

    const savingsChange = data.comparisonWithPrevious.savingsChange;
    const isSavingsPositive = savingsChange >= 0;

    return (
      <>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard
            title="Ingresos Totales"
            value={`$${data.totalIncome.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={ArrowUpRight}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/10"
            subtitle={`${data.transactionsCount} transacciones`}
            trend={{
              value: data.comparisonWithPrevious.incomeChange,
              isPositive: data.comparisonWithPrevious.incomeChange >= 0,
            }}
          />
          <ReportStatCard
            title="Gastos Totales"
            value={`$${data.totalExpenses.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={ArrowDownRight}
            iconColor="text-rose-400"
            iconBgColor="bg-rose-500/10"
            subtitle="Esta semana"
            trend={{
              value: data.comparisonWithPrevious.expensesChange,
              isPositive: data.comparisonWithPrevious.expensesChange >= 0,
            }}
          />
          <ReportStatCard
            title="Ahorro"
            value={`$${data.savings.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={TrendingUp}
            iconColor={isSavingsPositive ? "text-cyan-400" : "text-rose-400"}
            iconBgColor={isSavingsPositive ? "bg-cyan-500/10" : "bg-rose-500/10"}
            subtitle="Ingresos - Gastos"
            trend={{
              value: savingsChange,
              isPositive: isSavingsPositive,
            }}
          />
          <ReportStatCard
            title="Balance Promedio"
            value={`$${(data.totalIncome / 7).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/10"
            subtitle="Por día"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonChart
            title="Ingresos vs Gastos Diarios"
            data={data.dailyData}
            type="bar"
            xAxisKey="date"
            dataKeys={[
              { key: "income", label: "Ingresos", color: "#34d399" },
              { key: "expenses", label: "Gastos", color: "#fb7185" },
            ]}
          />
          <TopCategoriesList categories={data.topCategories} />
        </div>
      </>
    );
  };

  const renderMonthlyReport = (data: MonthlyReportData) => {
    if (!data || !data.comparisonWithPrevious) {
      return null;
    }

    const savingsChange = data.comparisonWithPrevious.savingsChange;
    const isSavingsPositive = savingsChange >= 0;

    return (
      <>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard
            title="Ingresos del Mes"
            value={`$${data.totalIncome.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={ArrowUpRight}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/10"
            subtitle={`${data.transactionsCount} transacciones`}
            trend={{
              value: data.comparisonWithPrevious.incomeChange,
              isPositive: data.comparisonWithPrevious.incomeChange >= 0,
            }}
          />
          <ReportStatCard
            title="Gastos del Mes"
            value={`$${data.totalExpenses.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={ArrowDownRight}
            iconColor="text-rose-400"
            iconBgColor="bg-rose-500/10"
            subtitle="Vs mes anterior"
            trend={{
              value: data.comparisonWithPrevious.expensesChange,
              isPositive: data.comparisonWithPrevious.expensesChange >= 0,
            }}
          />
          <ReportStatCard
            title="Ahorro del Mes"
            value={`$${data.savings.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={TrendingUp}
            iconColor={isSavingsPositive ? "text-cyan-400" : "text-rose-400"}
            iconBgColor={isSavingsPositive ? "bg-cyan-500/10" : "bg-rose-500/10"}
            subtitle="Ingresos - Gastos"
            trend={{
              value: savingsChange,
              isPositive: isSavingsPositive,
            }}
          />
          <ReportStatCard
            title="Promedio Semanal"
            value={`$${(data.totalExpenses / 4).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/10"
            subtitle="Gasto promedio"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonChart
            title="Evolución Semanal"
            data={data.weeklyData}
            type="line"
            xAxisKey="week"
            dataKeys={[
              { key: "income", label: "Ingresos", color: "#34d399" },
              { key: "expenses", label: "Gastos", color: "#fb7185" },
            ]}
          />
          <TopCategoriesList categories={data.topCategories} />
        </div>
      </>
    );
  };

  const renderAnnualReport = (data: AnnualReportData) => {
    if (!data || !data.monthlyData) {
      return null;
    }

    const totalIncome = data.totalIncome || 0;
    const totalExpenses = data.totalExpenses || 0;
    const savings = data.savings || 0;
    const transactionsCount = data.transactionsCount || 0;
    const averageMonthlyIncome = data.averageMonthlyIncome || 0;

    return (
      <>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard
            title="Ingresos del Año"
            value={`$${totalIncome.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={ArrowUpRight}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/10"
            subtitle={`${transactionsCount} transacciones`}
          />
          <ReportStatCard
            title="Gastos del Año"
            value={`$${totalExpenses.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={ArrowDownRight}
            iconColor="text-rose-400"
            iconBgColor="bg-rose-500/10"
            subtitle="Total anual"
          />
          <ReportStatCard
            title="Ahorro del Año"
            value={`$${savings.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={TrendingUp}
            iconColor={savings >= 0 ? "text-cyan-400" : "text-rose-400"}
            iconBgColor={savings >= 0 ? "bg-cyan-500/10" : "bg-rose-500/10"}
            subtitle="Ingresos - Gastos"
          />
          <ReportStatCard
            title="Promedio Mensual"
            value={`$${averageMonthlyIncome.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/10"
            subtitle="Ingreso promedio"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonChart
            title="Ingresos vs Gastos Mensuales"
            data={data.monthlyData}
            type="bar"
            xAxisKey="month"
            dataKeys={[
              { key: "income", label: "Ingresos", color: "#34d399" },
              { key: "expenses", label: "Gastos", color: "#fb7185" },
            ]}
          />
          <ComparisonChart
            title="Evolución del Patrimonio"
            data={data.netWorthEvolution}
            type="line"
            xAxisKey="month"
            dataKeys={[{ key: "balance", label: "Balance", color: "#60a5fa" }]}
          />
        </div>

        {/* Top Category */}
        {data.topExpenseCategory && data.topExpenseCategory.name && (
          <div className="grid gap-6">
            <div className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Categoría con Mayor Gasto
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: data.topExpenseCategory.color || "#64748b" }}
                />
                <span className="text-xl font-bold">
                  {data.topExpenseCategory.name}
                </span>
                <span className="text-2xl font-bold text-rose-400 ml-auto">
                  $
                  {(data.topExpenseCategory.amount || 0).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-sm text-slate-400">
                  ({(data.topExpenseCategory.percentage || 0).toFixed(1)}% del total)
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderNetWorthReport = (data: NetWorthReportData) => {
    if (!data || !data.accounts || !data.evolution) {
      return null;
    }

    const currentBalance = data.currentBalance || 0;
    const accounts = data.accounts || [];

    return (
      <>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard
            title="Patrimonio Neto"
            value={`$${currentBalance.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/10"
            subtitle="Balance total"
          />
          <ReportStatCard
            title="Total de Cuentas"
            value={accounts.length.toString()}
            icon={TrendingUp}
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/10"
            subtitle="Cuentas activas"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonChart
            title="Evolución del Patrimonio (12 meses)"
            data={data.evolution}
            type="line"
            xAxisKey="date"
            dataKeys={[{ key: "balance", label: "Balance", color: "#60a5fa" }]}
          />
          <div className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Distribución por Cuenta
            </h3>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: account.color || "#64748b" }}
                      />
                      <span className="text-sm font-medium">{account.name}</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${(account.balance || 0).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${account.percentage || 0}%`,
                          backgroundColor: account.color || "#64748b",
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 min-w-[45px] text-right">
                      {(account.percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de tus finanzas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!reportData}
            className="bg-slate-900 border-slate-800 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <ReportTypeSelector value={reportType} onChange={setReportType} />

      {/* Date Range Selector (only for weekly, monthly, annual) */}
      {reportType !== "networth" && (
        <div className="flex justify-center">
          <DateRangeSelector
            type={reportType}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border border-rose-800 bg-rose-900/20 rounded-lg p-4 text-center">
          <p className="text-rose-400">{error}</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && !error && reportData && (
        <div className="space-y-6">
          {reportType === "weekly" && renderWeeklyReport(reportData)}
          {reportType === "monthly" && renderMonthlyReport(reportData)}
          {reportType === "annual" && renderAnnualReport(reportData)}
          {reportType === "networth" && renderNetWorthReport(reportData)}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !reportData && (
        <div className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
          <p className="text-sm text-slate-400">
            Comienza registrando transacciones para ver tus reportes
          </p>
        </div>
      )}
    </div>
  );
}
