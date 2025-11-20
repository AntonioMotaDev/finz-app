export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateTransactionSchema } from "@/lib/validations/transaction";

// GET /api/transactions/[id] - Obtener transacción específica
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transacción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Error al obtener la transacción" },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/[id] - Actualizar transacción
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
    const body = await request.json();

    // Validar datos
    const validatedData = updateTransactionSchema.parse({
      ...body,
      id,
    });

    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transacción no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la cuenta pertenece al usuario (si se está actualizando)
    if (validatedData.accountId) {
      const account = await prisma.financialAccount.findFirst({
        where: {
          id: validatedData.accountId,
          userId: session.user.id,
        },
      });

      if (!account) {
        return NextResponse.json(
          { error: "Cuenta no encontrada" },
          { status: 404 }
        );
      }
    }

    // Si se actualiza a transferencia, verificar cuenta destino
    if (validatedData.type === "TRANSFER" && validatedData.toAccountId) {
      const toAccount = await prisma.financialAccount.findFirst({
        where: {
          id: validatedData.toAccountId,
          userId: session.user.id,
        },
      });

      if (!toAccount) {
        return NextResponse.json(
          { error: "Cuenta destino no encontrada" },
          { status: 404 }
        );
      }
    }

    // Verificar categoría si se proporciona
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Categoría no encontrada" },
          { status: 404 }
        );
      }
    }

    // Usar transacción de base de datos para actualizar balances
    const result = await prisma.$transaction(async (tx: any) => {
      // Primero, revertir el impacto de la transacción original
      if (existingTransaction.type === "INCOME") {
        await tx.financialAccount.update({
          where: { id: existingTransaction.accountId },
          data: {
            balance: {
              decrement: existingTransaction.amount,
            },
          },
        });
      } else if (existingTransaction.type === "EXPENSE") {
        await tx.financialAccount.update({
          where: { id: existingTransaction.accountId },
          data: {
            balance: {
              increment: existingTransaction.amount,
            },
          },
        });
      } else if (existingTransaction.type === "TRANSFER" && existingTransaction.toAccountId) {
        await tx.financialAccount.update({
          where: { id: existingTransaction.accountId },
          data: {
            balance: {
              increment: existingTransaction.amount,
            },
          },
        });
        await tx.financialAccount.update({
          where: { id: existingTransaction.toAccountId },
          data: {
            balance: {
              decrement: existingTransaction.amount,
            },
          },
        });
      }

      // Actualizar la transacción
      const { id: validatedId, ...updateData } = validatedData;
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: updateData,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
              icon: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              type: true,
            },
          },
        },
      });

      // Aplicar el impacto de la transacción actualizada
      const newType = validatedData.type || existingTransaction.type;
      const newAmount = validatedData.amount || existingTransaction.amount;
      const newAccountId = validatedData.accountId || existingTransaction.accountId;
      const newToAccountId = validatedData.toAccountId || existingTransaction.toAccountId;

      if (newType === "INCOME") {
        await tx.financialAccount.update({
          where: { id: newAccountId },
          data: {
            balance: {
              increment: newAmount,
            },
          },
        });
      } else if (newType === "EXPENSE") {
        await tx.financialAccount.update({
          where: { id: newAccountId },
          data: {
            balance: {
              decrement: newAmount,
            },
          },
        });
      } else if (newType === "TRANSFER" && newToAccountId) {
        await tx.financialAccount.update({
          where: { id: newAccountId },
          data: {
            balance: {
              decrement: newAmount,
            },
          },
        });
        await tx.financialAccount.update({
          where: { id: newToAccountId },
          data: {
            balance: {
              increment: newAmount,
            },
          },
        });
      }

      return updatedTransaction;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar la transacción" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Eliminar transacción
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

    // Verificar que la transacción existe y pertenece al usuario
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transacción no encontrada" },
        { status: 404 }
      );
    }

    // Usar transacción de base de datos para revertir el impacto en balances
    await prisma.$transaction(async (tx: any) => {
      // Revertir el impacto en el balance
      if (transaction.type === "INCOME") {
        await tx.financialAccount.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              decrement: transaction.amount,
            },
          },
        });
      } else if (transaction.type === "EXPENSE") {
        await tx.financialAccount.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
      } else if (transaction.type === "TRANSFER" && transaction.toAccountId) {
        await tx.financialAccount.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
        await tx.financialAccount.update({
          where: { id: transaction.toAccountId },
          data: {
            balance: {
              decrement: transaction.amount,
            },
          },
        });
      }

      // Eliminar la transacción
      await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Error al eliminar la transacción" },
      { status: 500 }
    );
  }
}
