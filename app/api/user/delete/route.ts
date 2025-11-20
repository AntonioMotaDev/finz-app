import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"

// DELETE - Eliminar cuenta del usuario
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Eliminar todas las relaciones del usuario
    // Prisma manejará las eliminaciones en cascada según el schema
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ 
      success: true,
      message: "Cuenta eliminada correctamente" 
    })
  } catch (error) {
    console.error("Error al eliminar cuenta:", error)
    return NextResponse.json(
      { error: "Error al eliminar cuenta" },
      { status: 500 }
    )
  }
}
