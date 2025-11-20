import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { savingsGoalSchema } from "@/lib/validations/savings-goal"
import { Prisma } from "@prisma/client"

// GET /api/savings-goals - Listar todas las metas del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // 'active', 'completed', 'all'

    const whereClause: any = {
      userId: session.user.id,
    }

    if (status === "active") {
      whereClause.isCompleted = false
    } else if (status === "completed") {
      whereClause.isCompleted = true
    }

    const goals = await prisma.savingsGoal.findMany({
      where: whereClause,
      orderBy: [{ isCompleted: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching savings goals:", error)
    return NextResponse.json(
      { error: "Error al obtener las metas de ahorro" },
      { status: 500 }
    )
  }
}

// POST /api/savings-goals - Crear nueva meta
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = savingsGoalSchema.parse(body)

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        targetAmount: validatedData.targetAmount,
        currentAmount: validatedData.currentAmount || 0,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        description: validatedData.description || null,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }

    console.error("Error creating savings goal:", error)
    return NextResponse.json(
      { error: "Error al crear la meta de ahorro" },
      { status: 500 }
    )
  }
}
