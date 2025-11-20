import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { exportDataSchema } from "@/lib/validations/user"

// GET - Exportar datos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"
    const includeTransactions = searchParams.get("includeTransactions") !== "false"
    const includeAccounts = searchParams.get("includeAccounts") !== "false"
    const includeCategories = searchParams.get("includeCategories") !== "false"
    const includeBudgets = searchParams.get("includeBudgets") !== "false"
    const includeSavingsGoals = searchParams.get("includeSavingsGoals") !== "false"

    const data: any = {
      user: await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
    }

    if (includeAccounts) {
      data.accounts = await prisma.financialAccount.findMany({
        where: { userId: session.user.id },
      })
    }

    if (includeTransactions) {
      data.transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: {
          category: true,
          account: {
            select: {
              name: true,
              type: true,
            },
          },
        },
        orderBy: { date: "desc" },
      })
    }

    if (includeCategories) {
      data.categories = await prisma.category.findMany({
        where: { userId: session.user.id },
      })
    }

    if (includeBudgets) {
      data.budgets = await prisma.budget.findMany({
        where: { userId: session.user.id },
        include: {
          category: true,
        },
      })
    }

    if (includeSavingsGoals) {
      data.savingsGoals = await prisma.savingsGoal.findMany({
        where: { userId: session.user.id },
      })
    }

    if (format === "csv") {
      // Convertir a CSV (simplificado)
      let csv = "# Finz App - Exportación de Datos\n\n"
      
      if (includeTransactions && data.transactions) {
        csv += "# TRANSACCIONES\n"
        csv += "Fecha,Tipo,Descripción,Monto,Cuenta,Categoría\n"
        data.transactions.forEach((t: any) => {
          csv += `${t.date},${t.type},${t.description},${t.amount},${t.account.name},${t.category?.name || "N/A"}\n`
        })
        csv += "\n"
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="finz-export-${new Date().toISOString()}.csv"`,
        },
      })
    }

    // Formato JSON por defecto
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="finz-export-${new Date().toISOString()}.json"`,
      },
    })
  } catch (error) {
    console.error("Error al exportar datos:", error)
    return NextResponse.json(
      { error: "Error al exportar datos" },
      { status: 500 }
    )
  }
}
