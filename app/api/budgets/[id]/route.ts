import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateBudgetSchema } from "@/lib/validations/budget";

// GET /api/budgets/[id] - Obtener presupuesto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error al obtener presupuesto:", error);
    return NextResponse.json(
      { error: "Error al obtener presupuesto" },
      { status: 500 }
    );
  }
}

// PATCH /api/budgets/[id] - Actualizar presupuesto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el presupuesto existe y pertenece al usuario
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    const json = await request.json();
    const body = updateBudgetSchema.parse(json);

    // Si se actualiza la categoría, verificar que existe
    if (body.categoryId) {
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

      if (category.type !== "EXPENSE") {
        return NextResponse.json(
          { error: "Solo se pueden crear presupuestos para categorías de gastos" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (body.categoryId) updateData.categoryId = body.categoryId;
    if (body.amount) updateData.amount = body.amount;
    if (body.period) updateData.period = body.period;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const budget = await prisma.budget.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget);
  } catch (error: any) {
    console.error("Error al actualizar presupuesto:", error);
    
    // Manejar errores de validación de Zod
    if (error.name === "ZodError") {
      console.error("Error de validación Zod:", JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { 
          error: "Datos inválidos", 
          details: error.errors,
          message: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ")
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Error al actualizar presupuesto" },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Eliminar presupuesto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el presupuesto existe y pertenece al usuario
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Presupuesto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar presupuesto:", error);
    return NextResponse.json(
      { error: "Error al eliminar presupuesto" },
      { status: 500 }
    );
  }
}
