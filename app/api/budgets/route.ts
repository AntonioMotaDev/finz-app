import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createBudgetSchema } from "@/lib/validations/budget";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";

// GET /api/budgets - Listar presupuestos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular el progreso de cada presupuesto
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget: any) => {
        const now = new Date();
        const startDate = new Date(budget.startDate);
        const endDate = budget.endDate ? new Date(budget.endDate) : getEndDateFromPeriod(startDate, budget.period);

        // Obtener gastos en el período del presupuesto
        const expenses = await prisma.transaction.findMany({
          where: {
            userId: session.user.id,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const spent = expenses.reduce((sum: number, transaction: any) => {
          return sum + Number(transaction.amount);
        }, 0);

        const percentage = (spent / Number(budget.amount)) * 100;
        const remaining = Number(budget.amount) - spent;
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...budget,
          amount: Number(budget.amount),
          spent,
          percentage: Math.min(percentage, 100),
          remaining: Math.max(remaining, 0),
          daysRemaining: Math.max(daysRemaining, 0),
          endDate,
        };
      })
    );

    return NextResponse.json(budgetsWithProgress);
  } catch (error) {
    console.error("Error al obtener presupuestos:", error);
    return NextResponse.json(
      { error: "Error al obtener presupuestos" },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Crear nuevo presupuesto
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const json = await request.json();
    const body = createBudgetSchema.parse(json);

    // Verificar que la categoría existe y pertenece al usuario
    const category = await prisma.category.findFirst({
      where: {
        id: body.categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Solo permitir presupuestos para categorías de EXPENSE
    if (category.type !== "EXPENSE") {
      return NextResponse.json(
        { error: "Solo se pueden crear presupuestos para categorías de gastos" },
        { status: 400 }
      );
    }

    const startDate = new Date(body.startDate);
    const endDate = body.endDate ? new Date(body.endDate) : getEndDateFromPeriod(startDate, body.period);

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId: body.categoryId,
        amount: body.amount,
        period: body.period,
        startDate,
        endDate,
        isActive: body.isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error al crear presupuesto:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear presupuesto" },
      { status: 500 }
    );
  }
}

// Helper function para calcular fecha de fin según el período
function getEndDateFromPeriod(startDate: Date, period: string): Date {
  switch (period) {
    case "weekly":
      return endOfWeek(startDate);
    case "monthly":
      return endOfMonth(startDate);
    case "yearly":
      return endOfYear(startDate);
    default:
      return endOfMonth(startDate);
  }
}
