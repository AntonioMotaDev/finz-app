import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateAccountSchema } from "@/lib/validations/account";

// GET /api/accounts/[id] - Obtener una cuenta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const account = await prisma.financialAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        transactions: {
          take: 10,
          orderBy: {
            date: "desc",
          },
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Cuenta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Error al obtener la cuenta" },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/[id] - Actualizar cuenta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validar que la cuenta existe y pertenece al usuario
    const existingAccount = await prisma.financialAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Cuenta no encontrada" },
        { status: 404 }
      );
    }

    // Validar datos
    const validatedData = updateAccountSchema.parse(body);

    // Actualizar cuenta
    const updatedAccount = await prisma.financialAccount.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error("Error updating account:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar la cuenta" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Eliminar cuenta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validar que la cuenta existe y pertenece al usuario
    const account = await prisma.financialAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Cuenta no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si tiene transacciones
    if (account._count.transactions > 0) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar una cuenta con transacciones. Considera desactivarla en su lugar.",
          hasTransactions: true,
        },
        { status: 400 }
      );
    }

    // Eliminar cuenta
    await prisma.financialAccount.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Cuenta eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Error al eliminar la cuenta" },
      { status: 500 }
    );
  }
}
