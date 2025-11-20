export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { transferSchema } from "@/lib/validations/transaction";

// POST /api/transactions/transfer - Crear transferencia entre cuentas
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const validatedData = transferSchema.parse(body);

    // Verificar que ambas cuentas pertenecen al usuario
    const [fromAccount, toAccount] = await Promise.all([
      prisma.financialAccount.findFirst({
        where: {
          id: validatedData.fromAccountId,
          userId: session.user.id,
        },
      }),
      prisma.financialAccount.findFirst({
        where: {
          id: validatedData.toAccountId,
          userId: session.user.id,
        },
      }),
    ]);

    if (!fromAccount) {
      return NextResponse.json(
        { error: "Cuenta origen no encontrada" },
        { status: 404 }
      );
    }

    if (!toAccount) {
      return NextResponse.json(
        { error: "Cuenta destino no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la cuenta origen tiene fondos suficientes
    if (fromAccount.balance.toNumber() < validatedData.amount) {
      return NextResponse.json(
        { error: "Fondos insuficientes en la cuenta origen" },
        { status: 400 }
      );
    }

    // Usar transacción de base de datos para crear la transferencia y actualizar balances
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear la transacción de transferencia
      const transaction = await tx.transaction.create({
        data: {
          type: "TRANSFER",
          accountId: validatedData.fromAccountId,
          toAccountId: validatedData.toAccountId,
          amount: validatedData.amount,
          description: validatedData.description,
          date: validatedData.date,
          notes: validatedData.notes,
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
        },
      });

      // Actualizar balance de la cuenta origen (restar)
      await tx.financialAccount.update({
        where: { id: validatedData.fromAccountId },
        data: {
          balance: {
            decrement: validatedData.amount,
          },
        },
      });

      // Actualizar balance de la cuenta destino (sumar)
      await tx.financialAccount.update({
        where: { id: validatedData.toAccountId },
        data: {
          balance: {
            increment: validatedData.amount,
          },
        },
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transfer:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear la transferencia" },
      { status: 500 }
    );
  }
}
