/**
 * Servicios de Analytics para el Dashboard
 * 
 * Funciones para calcular métricas financieras y preparar datos para visualizaciones
 */

import { prisma } from "@/lib/db/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { es } from "date-fns/locale";

interface MonthData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface CategoryExpense {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface AccountDistribution {
  name: string;
  balance: number;
  type: string;
  color: string;
  percentage: number;
}

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

/**
 * Obtiene el balance total de todas las cuentas activas del usuario
 */
export async function getTotalBalance(userId: string): Promise<number> {
  const accounts = await prisma.financialAccount.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      balance: true,
    },
  });

  return accounts.reduce((sum: number, account: any) => sum + Number(account.balance), 0);
}

/**
 * Obtiene los ingresos del mes actual
 */
export async function getMonthlyIncome(userId: string): Promise<{ total: number; count: number }> {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "INCOME",
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      amount: true,
    },
  });

  const total = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  return { total, count: transactions.length };
}

/**
 * Obtiene los gastos del mes actual
 */
export async function getMonthlyExpenses(userId: string): Promise<{ total: number; count: number }> {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      amount: true,
    },
  });

  const total = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  return { total, count: transactions.length };
}

/**
 * Calcula el ahorro del mes actual (ingresos - gastos)
 */
export async function getMonthlySavings(userId: string): Promise<number> {
  const income = await getMonthlyIncome(userId);
  const expenses = await getMonthlyExpenses(userId);
  return income.total - expenses.total;
}

/**
 * Obtiene gastos agrupados por categoría para el mes actual
 */
export async function getExpensesByCategory(userId: string): Promise<CategoryExpense[]> {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      amount: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  // Agrupar por categoría
  const grouped = transactions.reduce((acc: any, t: any) => {
    const categoryName = t.category?.name || "Sin categoría";
    const categoryColor = t.category?.color || "#64748b"; // slate-500
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        amount: 0,
        color: categoryColor,
      };
    }
    
    acc[categoryName].amount += Number(t.amount);
    return acc;
  }, {} as Record<string, { name: string; amount: number; color: string }>);

  // Convertir a array y ordenar por monto
  const result = Object.values(grouped).sort((a: any, b: any) => b.amount - a.amount);

  // Calcular total para porcentajes
  const total = result.reduce((sum: number, cat: any) => sum + cat.amount, 0);

  // Agregar porcentajes
  return result.map((cat: any) => ({
    ...cat,
    percentage: total > 0 ? (cat.amount / total) * 100 : 0,
  }));
}

/**
 * Obtiene datos de ingresos vs gastos para los últimos 6 meses
 */
export async function getIncomeVsExpensesChart(userId: string): Promise<MonthData[]> {
  const months: MonthData[] = [];
  const now = new Date();

  // Obtener últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        type: true,
        amount: true,
      },
    });

    const income = transactions
      .filter((t: any) => t.type === "INCOME")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t: any) => t.type === "EXPENSE")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    months.push({
      month: format(date, "MMM", { locale: es }),
      income,
      expenses,
      savings: income - expenses,
    });
  }

  return months;
}

/**
 * Obtiene la distribución del balance entre las cuentas
 */
export async function getAccountsDistribution(userId: string): Promise<AccountDistribution[]> {
  const accounts = await prisma.financialAccount.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      name: true,
      type: true,
      balance: true,
      color: true,
    },
  });

  // Calcular total
  const total = accounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0);

  // Filtrar cuentas con balance > 0 y ordenar
  const result = accounts
    .filter((acc: any) => Number(acc.balance) > 0)
    .sort((a: any, b: any) => Number(b.balance) - Number(a.balance))
    .map((acc: any) => ({
      name: acc.name,
      balance: Number(acc.balance),
      type: acc.type,
      color: acc.color || "#3b82f6", // blue-500
      percentage: total > 0 ? (Number(acc.balance) / total) * 100 : 0,
    }));

  return result;
}

/**
 * Obtiene las últimas transacciones del usuario
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 10
): Promise<RecentTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      description: true,
      amount: true,
      type: true,
      date: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
      account: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: limit,
  });

  // Convertir Decimal a number para compatibilidad con Client Components
  return transactions.map((t: any) => ({
    ...t,
    amount: Number(t.amount),
  }));
}

/**
 * Obtiene estadísticas de cambio vs mes anterior
 */
export async function getMonthlyComparison(userId: string): Promise<{
  incomeChange: number;
  expensesChange: number;
  savingsChange: number;
}> {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  
  const previousStart = startOfMonth(subMonths(now, 1));
  const previousEnd = endOfMonth(subMonths(now, 1));

  // Mes actual
  const [currentIncome, currentExpenses] = await Promise.all([
    getMonthlyIncome(userId),
    getMonthlyExpenses(userId),
  ]);

  // Mes anterior
  const previousTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: previousStart,
        lte: previousEnd,
      },
    },
    select: {
      type: true,
      amount: true,
    },
  });

  const previousIncome = previousTransactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const previousExpenses = previousTransactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const previousSavings = previousIncome - previousExpenses;
  const currentSavings = currentIncome.total - currentExpenses.total;

  // Calcular cambios porcentuales
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    incomeChange: calculateChange(currentIncome.total, previousIncome),
    expensesChange: calculateChange(currentExpenses.total, previousExpenses),
    savingsChange: calculateChange(currentSavings, previousSavings),
  };
}
