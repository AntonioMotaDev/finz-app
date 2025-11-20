/**
 * Servicios de Reportes
 * 
 * Funciones para generar reportes financieros detallados
 */

import { prisma } from "@/lib/db/prisma";
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

// ============================================
// TIPOS
// ============================================

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

export interface WeeklyReportData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  transactionsCount: number;
  topCategories: CategoryExpense[];
  dailyData: Array<{
    date: string;
    income: number;
    expenses: number;
  }>;
  comparisonWithPrevious: {
    incomeChange: number;
    expensesChange: number;
    savingsChange: number;
  };
}

export interface MonthlyReportData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  transactionsCount: number;
  topCategories: CategoryExpense[];
  weeklyData: Array<{
    week: string;
    income: number;
    expenses: number;
  }>;
  comparisonWithPrevious: {
    incomeChange: number;
    expensesChange: number;
    savingsChange: number;
  };
}

export interface AnnualReportData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  transactionsCount: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  topExpenseCategory: CategoryExpense | null;
  netWorthEvolution: Array<{
    month: string;
    balance: number;
  }>;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}

export interface CategoryReportData {
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  transactionsCount: number;
  averageTransaction: number;
  monthlyData: Array<{
    month: string;
    amount: number;
  }>;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
    account: string;
  }>;
}

export interface NetWorthReportData {
  currentBalance: number;
  accounts: AccountDistribution[];
  evolution: Array<{
    date: string;
    balance: number;
  }>;
  accountsGrowth: Array<{
    name: string;
    growth: number;
  }>;
}

// ============================================
// FUNCIONES DE REPORTE
// ============================================

/**
 * Genera reporte semanal
 */
export async function getWeeklyReport(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WeeklyReportData> {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      type: true,
      amount: true,
      date: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Agrupar por categoría (solo gastos)
  const expensesMap = new Map<string, { name: string; amount: number; color: string }>();
  transactions
    .filter((t: any) => t.type === "EXPENSE")
    .forEach((t: any) => {
      const categoryName = t.category?.name || "Sin categoría";
      const categoryColor = t.category?.color || "#64748b";
      
      const existing = expensesMap.get(categoryName) || { name: categoryName, amount: 0, color: categoryColor };
      existing.amount += Number(t.amount);
      expensesMap.set(categoryName, existing);
    });

  const topCategories = Array.from(expensesMap.values())
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)
    .map((cat) => ({
      ...cat,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
    }));

  // Datos diarios
  const dailyMap = new Map<string, { income: number; expenses: number }>();
  transactions.forEach((t: any) => {
    const dateKey = format(t.date, "yyyy-MM-dd");
    const existing = dailyMap.get(dateKey) || { income: 0, expenses: 0 };
    
    if (t.type === "INCOME") {
      existing.income += Number(t.amount);
    } else if (t.type === "EXPENSE") {
      existing.expenses += Number(t.amount);
    }
    
    dailyMap.set(dateKey, existing);
  });

  const dailyData = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date: format(new Date(date), "dd/MM"),
      income: data.income,
      expenses: data.expenses,
    }))
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  // Comparación con semana anterior
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - 7);
  const previousEndDate = new Date(endDate);
  previousEndDate.setDate(previousEndDate.getDate() - 7);

  const previousTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: previousStartDate,
        lte: previousEndDate,
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

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
    transactionsCount: transactions.length,
    topCategories,
    dailyData,
    comparisonWithPrevious: {
      incomeChange: calculateChange(totalIncome, previousIncome),
      expensesChange: calculateChange(totalExpenses, previousExpenses),
      savingsChange: calculateChange(
        totalIncome - totalExpenses,
        previousIncome - previousExpenses
      ),
    },
  };
}

/**
 * Genera reporte mensual
 */
export async function getMonthlyReport(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyReportData> {
  const startDate = new Date(year, month, 1);
  const endDate = endOfMonth(startDate);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      type: true,
      amount: true,
      date: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Top categorías
  const expensesMap = new Map<string, { name: string; amount: number; color: string }>();
  transactions
    .filter((t: any) => t.type === "EXPENSE")
    .forEach((t: any) => {
      const categoryName = t.category?.name || "Sin categoría";
      const categoryColor = t.category?.color || "#64748b";
      
      const existing = expensesMap.get(categoryName) || { name: categoryName, amount: 0, color: categoryColor };
      existing.amount += Number(t.amount);
      expensesMap.set(categoryName, existing);
    });

  const topCategories = Array.from(expensesMap.values())
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)
    .map((cat) => ({
      ...cat,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
    }));

  // Datos semanales
  const weeklyMap = new Map<number, { income: number; expenses: number }>();
  transactions.forEach((t: any) => {
    const weekNumber = Math.ceil(t.date.getDate() / 7);
    const existing = weeklyMap.get(weekNumber) || { income: 0, expenses: 0 };
    
    if (t.type === "INCOME") {
      existing.income += Number(t.amount);
    } else if (t.type === "EXPENSE") {
      existing.expenses += Number(t.amount);
    }
    
    weeklyMap.set(weekNumber, existing);
  });

  const weeklyData = Array.from(weeklyMap.entries())
    .map(([weekNumber, data]) => ({
      week: `Semana ${weekNumber}`,
      income: data.income,
      expenses: data.expenses,
    }))
    .sort((a: any, b: any) => {
      const aNum = parseInt(a.week.split(" ")[1]);
      const bNum = parseInt(b.week.split(" ")[1]);
      return aNum - bNum;
    });

  // Comparación con mes anterior
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const previousStart = new Date(previousYear, previousMonth, 1);
  const previousEnd = endOfMonth(previousStart);

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

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
    transactionsCount: transactions.length,
    topCategories,
    weeklyData,
    comparisonWithPrevious: {
      incomeChange: calculateChange(totalIncome, previousIncome),
      expensesChange: calculateChange(totalExpenses, previousExpenses),
      savingsChange: calculateChange(
        totalIncome - totalExpenses,
        previousIncome - previousExpenses
      ),
    },
  };
}

/**
 * Genera reporte anual
 */
export async function getAnnualReport(userId: string, year: number): Promise<AnnualReportData> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      type: true,
      amount: true,
      date: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Datos mensuales
  const monthlyMap = new Map<number, { income: number; expenses: number }>();
  transactions.forEach((t: any) => {
    const monthNumber = t.date.getMonth();
    const existing = monthlyMap.get(monthNumber) || { income: 0, expenses: 0 };
    
    if (t.type === "INCOME") {
      existing.income += Number(t.amount);
    } else if (t.type === "EXPENSE") {
      existing.expenses += Number(t.amount);
    }
    
    monthlyMap.set(monthNumber, existing);
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const data = monthlyMap.get(i) || { income: 0, expenses: 0 };
    return {
      month: format(new Date(year, i, 1), "MMM", { locale: es }),
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
    };
  });

  // Top categoría de gasto
  const expensesMap = new Map<string, { name: string; amount: number; color: string }>();
  transactions
    .filter((t: any) => t.type === "EXPENSE")
    .forEach((t: any) => {
      const categoryName = t.category?.name || "Sin categoría";
      const categoryColor = t.category?.color || "#64748b";
      
      const existing = expensesMap.get(categoryName) || { name: categoryName, amount: 0, color: categoryColor };
      existing.amount += Number(t.amount);
      expensesMap.set(categoryName, existing);
    });

  const sortedCategories = Array.from(expensesMap.values()).sort((a: any, b: any) => b.amount - a.amount);
  const topExpenseCategoryRaw = sortedCategories[0] || null;
  const topExpenseCategory = topExpenseCategoryRaw ? {
    ...topExpenseCategoryRaw,
    percentage: totalExpenses > 0 ? (topExpenseCategoryRaw.amount / totalExpenses) * 100 : 0,
  } : null;

  // Evolución del patrimonio
  const netWorthEvolution = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const monthEnd = endOfMonth(new Date(year, i, 1));
      const accounts = await prisma.financialAccount.findMany({
        where: {
          userId,
          isActive: true,
          createdAt: {
            lte: monthEnd,
          },
        },
        select: {
          balance: true,
        },
      });
      
      const balance = accounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0);
      
      return {
        month: format(new Date(year, i, 1), "MMM", { locale: es }),
        balance,
      };
    })
  );

  return {
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
    transactionsCount: transactions.length,
    monthlyData,
    topExpenseCategory: topExpenseCategory ? {
      ...topExpenseCategory,
      percentage: topExpenseCategory.percentage || 0,
    } : null,
    netWorthEvolution,
    averageMonthlyIncome: totalIncome / 12,
    averageMonthlyExpenses: totalExpenses / 12,
  };
}

/**
 * Genera reporte por categoría
 */
export async function getCategoryReport(
  userId: string,
  categoryId: string,
  startDate: Date,
  endDate: Date
): Promise<CategoryReportData> {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      categoryId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
      account: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const totalAmount = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const averageTransaction = transactions.length > 0 ? totalAmount / transactions.length : 0;

  // Datos mensuales
  const monthlyMap = new Map<string, number>();
  transactions.forEach((t: any) => {
    const monthKey = format(t.date, "MMM yyyy", { locale: es });
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + Number(t.amount));
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a: any, b: any) => {
      const [aMonth, aYear] = a.month.split(" ");
      const [bMonth, bYear] = b.month.split(" ");
      return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    });

  return {
    categoryName: category.name,
    categoryColor: category.color || "#64748b",
    totalAmount,
    transactionsCount: transactions.length,
    averageTransaction,
    monthlyData,
    transactions: transactions.map((t: any) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      account: t.account.name,
    })),
  };
}

/**
 * Genera reporte de patrimonio neto
 */
export async function getNetWorthReport(userId: string): Promise<NetWorthReportData> {
  // Balance actual
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

  const currentBalance = accounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0);

  // Distribución de cuentas
  const accountsDistribution: AccountDistribution[] = accounts
    .filter((acc: any) => Number(acc.balance) > 0)
    .sort((a: any, b: any) => Number(b.balance) - Number(a.balance))
    .map((acc: any) => ({
      name: acc.name,
      balance: Number(acc.balance),
      type: acc.type,
      color: acc.color || "#3b82f6",
      percentage: currentBalance > 0 ? (Number(acc.balance) / currentBalance) * 100 : 0,
    }));

  // Evolución de los últimos 12 meses
  const evolution = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      const monthEnd = endOfMonth(date);
      
      const monthAccounts = await prisma.financialAccount.findMany({
        where: {
          userId,
          isActive: true,
          createdAt: {
            lte: monthEnd,
          },
        },
        select: {
          balance: true,
        },
      });
      
      const balance = monthAccounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0);
      
      return {
        date: format(date, "MMM yyyy", { locale: es }),
        balance,
      };
    })
  );

  // Crecimiento por cuenta (últimos 3 meses vs 3 meses anteriores)
  const threeMonthsAgo = subMonths(new Date(), 3);
  const sixMonthsAgo = subMonths(new Date(), 6);

  const accountsWithTransactions = await prisma.financialAccount.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      name: true,
      transactions: {
        where: {
          date: {
            gte: sixMonthsAgo,
          },
        },
        select: {
          amount: true,
          type: true,
          date: true,
        },
      },
    },
  });

  const accountsGrowth = accountsWithTransactions.map((account: any) => {
    const recentTransactions = account.transactions.filter(
      (t: any) => t.date >= threeMonthsAgo
    );
    const olderTransactions = account.transactions.filter(
      (t: any) => t.date < threeMonthsAgo
    );

    const recentNet = recentTransactions.reduce((sum: number, t: any) => {
      const amount = Number(t.amount);
      return t.type === "INCOME" ? sum + amount : sum - amount;
    }, 0);

    const olderNet = olderTransactions.reduce((sum: number, t: any) => {
      const amount = Number(t.amount);
      return t.type === "INCOME" ? sum + amount : sum - amount;
    }, 0);

    const growth = olderNet === 0 ? (recentNet > 0 ? 100 : 0) : ((recentNet - olderNet) / Math.abs(olderNet)) * 100;

    return {
      name: account.name,
      growth,
    };
  });

  return {
    currentBalance,
    accounts: accountsDistribution,
    evolution,
    accountsGrowth,
  };
}
