import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/accounts/summary - Resumen de todas las cuentas
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener todas las cuentas activas del usuario
    const accounts = await prisma.financialAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        color: true,
        icon: true,
      },
    });

    // Calcular balance total
    const totalBalance = accounts.reduce((sum: number, account: any) => {
      return sum + Number(account.balance);
    }, 0);

    // Agrupar por tipo de cuenta
    const accountsByType = accounts.reduce((acc: Record<string, any>, account: any) => {
      if (!acc[account.type]) {
        acc[account.type] = {
          type: account.type,
          count: 0,
          totalBalance: 0,
          accounts: [],
        };
      }
      acc[account.type].count += 1;
      acc[account.type].totalBalance += Number(account.balance);
      acc[account.type].accounts.push(account);
      return acc;
    }, {} as Record<string, any>);

    // Agrupar por moneda
    const balancesByCurrency = accounts.reduce((acc: Record<string, number>, account: any) => {
      if (!acc[account.currency]) {
        acc[account.currency] = 0;
      }
      acc[account.currency] += Number(account.balance);
      return acc;
    }, {} as Record<string, number>);

    // Obtener estadísticas adicionales
    const stats = {
      totalAccounts: accounts.length,
      totalBalance,
      accountsByType: Object.values(accountsByType),
      balancesByCurrency: Object.entries(balancesByCurrency).map(([currency, balance]) => ({
        currency,
        balance,
      })),
      // Cuenta con mayor balance
      richestAccount: accounts.length > 0
        ? accounts.reduce((prev: any, current: any) =>
            Number(current.balance) > Number(prev.balance) ? current : prev
          )
        : null,
      // Cuenta con menor balance
      poorestAccount: accounts.length > 0
        ? accounts.reduce((prev: any, current: any) =>
            Number(current.balance) < Number(prev.balance) ? current : prev
          )
        : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching accounts summary:", error);
    return NextResponse.json(
      { error: "Error al obtener el resumen de cuentas" },
      { status: 500 }
    );
  }
}
