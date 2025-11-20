import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { savingsGoalSchema } from "@/lib/validations/savings-goal"

// GET /api/savings-goals/[id] - Obtener meta específica
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error fetching savings goal:", error)
    return NextResponse.json(
      { error: "Error al obtener la meta de ahorro" },
      { status: 500 }
    )
  }
}

// PATCH /api/savings-goals/[id] - Actualizar meta
export async function PATCH(
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

    const body = await req.json()
    const validatedData = savingsGoalSchema.parse(body)

    // Verificar si la meta se completó
    const currentAmount = validatedData.currentAmount ?? 0
    const isCompleted = currentAmount >= validatedData.targetAmount

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        name: validatedData.name,
        targetAmount: validatedData.targetAmount,
        currentAmount: currentAmount,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        description: validatedData.description || null,
        isCompleted,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error updating savings goal:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: JSON.stringify(error) }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Error al actualizar la meta de ahorro",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE /api/savings-goals/[id] - Eliminar meta
export async function DELETE(
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

    await prisma.savingsGoal.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Meta eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting savings goal:", error)
    return NextResponse.json(
      { error: "Error al eliminar la meta de ahorro" },
      { status: 500 }
    )
  }
}
