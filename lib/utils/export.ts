/**
 * Utilidades de Exportación para Reportes
 * 
 * Funciones para exportar reportes a CSV
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Convierte datos a formato CSV y descarga el archivo
 */
export function exportToCSV(data: any[], filename: string, reportType: string) {
  let csvContent = "";
  let headers: string[] = [];
  let rows: string[][] = [];

  // Generar contenido según el tipo de reporte
  switch (reportType) {
    case "weekly":
    case "monthly":
      headers = ["Período", "Ingresos", "Gastos", "Ahorro"];
      rows = data.map((item) => [
        item.date || item.week || item.month || "",
        item.income?.toFixed(2) || "0.00",
        item.expenses?.toFixed(2) || "0.00",
        ((item.income || 0) - (item.expenses || 0)).toFixed(2),
      ]);
      break;

    case "annual":
      headers = ["Mes", "Ingresos", "Gastos", "Ahorro"];
      rows = data.map((item) => [
        item.month || "",
        item.income?.toFixed(2) || "0.00",
        item.expenses?.toFixed(2) || "0.00",
        item.savings?.toFixed(2) || "0.00",
      ]);
      break;

    case "networth":
      headers = ["Fecha", "Balance"];
      rows = data.map((item) => [
        item.date || "",
        item.balance?.toFixed(2) || "0.00",
      ]);
      break;

    default:
      headers = Object.keys(data[0] || {});
      rows = data.map((item) => headers.map((header) => String(item[header] || "")));
  }

  // Construir CSV
  csvContent = headers.join(",") + "\n";
  rows.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });

  // Descargar archivo
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta reporte semanal a CSV
 */
export function exportWeeklyReportToCSV(reportData: any) {
  const data = [
    {
      label: "Resumen",
      totalIncome: reportData.totalIncome,
      totalExpenses: reportData.totalExpenses,
      savings: reportData.savings,
      transactionsCount: reportData.transactionsCount,
    },
  ];

  let csvContent = "Reporte Semanal\n\n";
  csvContent += "Métrica,Valor\n";
  csvContent += `Ingresos Totales,$${reportData.totalIncome.toFixed(2)}\n`;
  csvContent += `Gastos Totales,$${reportData.totalExpenses.toFixed(2)}\n`;
  csvContent += `Ahorro,$${reportData.savings.toFixed(2)}\n`;
  csvContent += `Transacciones,${reportData.transactionsCount}\n\n`;

  csvContent += "Datos Diarios\n";
  csvContent += "Fecha,Ingresos,Gastos\n";
  reportData.dailyData.forEach((day: any) => {
    csvContent += `${day.date},$${day.income.toFixed(2)},$${day.expenses.toFixed(2)}\n`;
  });

  csvContent += "\nTop Categorías\n";
  csvContent += "Categoría,Monto,Porcentaje\n";
  reportData.topCategories.forEach((cat: any) => {
    csvContent += `${cat.name},$${cat.amount.toFixed(2)},${cat.percentage.toFixed(1)}%\n`;
  });

  downloadCSV(csvContent, "reporte_semanal");
}

/**
 * Exporta reporte mensual a CSV
 */
export function exportMonthlyReportToCSV(reportData: any) {
  let csvContent = "Reporte Mensual\n\n";
  csvContent += "Métrica,Valor\n";
  csvContent += `Ingresos del Mes,$${reportData.totalIncome.toFixed(2)}\n`;
  csvContent += `Gastos del Mes,$${reportData.totalExpenses.toFixed(2)}\n`;
  csvContent += `Ahorro,$${reportData.savings.toFixed(2)}\n`;
  csvContent += `Transacciones,${reportData.transactionsCount}\n\n`;

  csvContent += "Datos Semanales\n";
  csvContent += "Semana,Ingresos,Gastos\n";
  reportData.weeklyData.forEach((week: any) => {
    csvContent += `${week.week},$${week.income.toFixed(2)},$${week.expenses.toFixed(2)}\n`;
  });

  csvContent += "\nTop Categorías\n";
  csvContent += "Categoría,Monto,Porcentaje\n";
  reportData.topCategories.forEach((cat: any) => {
    csvContent += `${cat.name},$${cat.amount.toFixed(2)},${cat.percentage.toFixed(1)}%\n`;
  });

  downloadCSV(csvContent, "reporte_mensual");
}

/**
 * Exporta reporte anual a CSV
 */
export function exportAnnualReportToCSV(reportData: any) {
  let csvContent = "Reporte Anual\n\n";
  csvContent += "Métrica,Valor\n";
  csvContent += `Ingresos del Año,$${reportData.totalIncome.toFixed(2)}\n`;
  csvContent += `Gastos del Año,$${reportData.totalExpenses.toFixed(2)}\n`;
  csvContent += `Ahorro,$${reportData.savings.toFixed(2)}\n`;
  csvContent += `Transacciones,${reportData.transactionsCount}\n`;
  csvContent += `Promedio Mensual Ingresos,$${reportData.averageMonthlyIncome.toFixed(2)}\n`;
  csvContent += `Promedio Mensual Gastos,$${reportData.averageMonthlyExpenses.toFixed(2)}\n\n`;

  csvContent += "Datos Mensuales\n";
  csvContent += "Mes,Ingresos,Gastos,Ahorro\n";
  reportData.monthlyData.forEach((month: any) => {
    csvContent += `${month.month},$${month.income.toFixed(2)},$${month.expenses.toFixed(2)},$${month.savings.toFixed(2)}\n`;
  });

  if (reportData.topExpenseCategory) {
    csvContent += "\nCategoría con Mayor Gasto\n";
    csvContent += `${reportData.topExpenseCategory.name},$${reportData.topExpenseCategory.amount.toFixed(2)},${reportData.topExpenseCategory.percentage.toFixed(1)}%\n`;
  }

  downloadCSV(csvContent, "reporte_anual");
}

/**
 * Exporta reporte de patrimonio a CSV
 */
export function exportNetWorthReportToCSV(reportData: any) {
  let csvContent = "Reporte de Patrimonio\n\n";
  csvContent += "Balance Total,$" + reportData.currentBalance.toFixed(2) + "\n\n";

  csvContent += "Distribución por Cuenta\n";
  csvContent += "Cuenta,Balance,Tipo,Porcentaje\n";
  reportData.accounts.forEach((account: any) => {
    csvContent += `${account.name},$${account.balance.toFixed(2)},${account.type},${account.percentage.toFixed(1)}%\n`;
  });

  csvContent += "\nEvolución (12 meses)\n";
  csvContent += "Fecha,Balance\n";
  reportData.evolution.forEach((item: any) => {
    csvContent += `${item.date},$${item.balance.toFixed(2)}\n`;
  });

  downloadCSV(csvContent, "reporte_patrimonio");
}

/**
 * Helper para descargar CSV
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
