export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createTransactionSchema,
  transactionFilterSchema,
} from "@/lib/validations/transaction";
import { Prisma } from "@prisma/client";

// GET /api/transactions - Listar transacciones con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener query params
    const { searchParams } = new URL(request.url);
    const filterParams = {
      type: searchParams.get("type") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      minAmount: searchParams.get("minAmount") || undefined,
      maxAmount: searchParams.get("maxAmount") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      sortBy: searchParams.get("sortBy") || "date",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    // Validar filtros
    const filters = transactionFilterSchema.parse(filterParams);

    // Construir where clause
    const where: any = {
      userId: session.user.id,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount) {
        where.amount.lte = filters.maxAmount;
      }
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Calcular paginación
    const skip = (filters.page - 1) * filters.limit;

    // Obtener total de registros
    const totalCount = await prisma.transaction.count({ where });

    // Obtener transacciones
    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
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

    // Calcular metadata de paginación
    const totalPages = Math.ceil(totalCount / filters.limit);
    const hasNextPage = filters.page < totalPages;
    const hasPreviousPage = filters.page > 1;

    return NextResponse.json({
      data: transactions,
      pagination: {
        currentPage: filters.page,
        totalPages,
        totalCount,
        limit: filters.limit,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al obtener las transacciones" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Crear nueva transacción
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const validatedData = createTransactionSchema.parse(body);

    // Verificar que la cuenta pertenece al usuario
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

    // Si es transferencia, verificar cuenta destino
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

      // Validar que el tipo de categoría coincida (excepto para transferencias)
      if (
        validatedData.type !== "TRANSFER" &&
        category.type !== validatedData.type
      ) {
        return NextResponse.json(
          { error: "La categoría no corresponde al tipo de transacción" },
          { status: 400 }
        );
      }
    }

    // Usar transacción de base de datos para actualizar balances atómicamente
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear la transacción
      const transaction = await tx.transaction.create({
        data: {
          ...validatedData,
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

      // Actualizar balance de la cuenta origen
      if (validatedData.type === "INCOME") {
        // Sumar al balance
        await tx.financialAccount.update({
          where: { id: validatedData.accountId },
          data: {
            balance: {
              increment: validatedData.amount,
            },
          },
        });
      } else if (validatedData.type === "EXPENSE") {
        // Restar del balance
        await tx.financialAccount.update({
          where: { id: validatedData.accountId },
          data: {
            balance: {
              decrement: validatedData.amount,
            },
          },
        });
      } else if (validatedData.type === "TRANSFER" && validatedData.toAccountId) {
        // Restar de la cuenta origen
        await tx.financialAccount.update({
          where: { id: validatedData.accountId },
          data: {
            balance: {
              decrement: validatedData.amount,
            },
          },
        });
        // Sumar a la cuenta destino
        await tx.financialAccount.update({
          where: { id: validatedData.toAccountId },
          data: {
            balance: {
              increment: validatedData.amount,
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear la transacción" },
      { status: 500 }
    );
  }
}
