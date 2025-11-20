import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { contributeSchema } from "@/lib/validations/savings-goal"

// POST /api/savings-goals/[id]/contribute - Agregar contribución a la meta
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la meta existe y pertenece al usuario
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })
    }

    if (existingGoal.isCompleted) {
      return NextResponse.json(
        { error: "Esta meta ya ha sido completada" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validatedData = contributeSchema.parse(body)

    const newCurrentAmount = Number(existingGoal.currentAmount) + validatedData.amount
    const isCompleted = newCurrentAmount >= Number(existingGoal.targetAmount)

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
        isCompleted,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }

    console.error("Error contributing to savings goal:", error)
    return NextResponse.json(
      { error: "Error al agregar contribución" },
      { status: 500 }
    )
  }
}
