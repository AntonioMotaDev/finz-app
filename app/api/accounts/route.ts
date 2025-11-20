export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createAccountSchema,
  accountFilterSchema,
  accountTypeColors,
  accountTypeIcons,
} from "@/lib/validations/account";

// GET /api/accounts - Listar todas las cuentas del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener query params para filtros
    const { searchParams } = new URL(request.url);
    const filterParams = {
      type: searchParams.get("type") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      currency: searchParams.get("currency") || undefined,
    };

    // Validar filtros
    const filters = accountFilterSchema.parse(filterParams);

    // Construir where clause
    const where: any = {
      userId: session.user.id,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.currency) {
      where.currency = filters.currency;
    }

    // Obtener cuentas
    const accounts = await prisma.financialAccount.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Error al obtener las cuentas" },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Crear nueva cuenta
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar datos
    const validatedData = createAccountSchema.parse(body);

    // Asignar color e icono predeterminados si no se proporcionan
    const accountData = {
      ...validatedData,
      color: validatedData.color || accountTypeColors[validatedData.type],
      icon: validatedData.icon || accountTypeIcons[validatedData.type],
      userId: session.user.id,
    };

    // Crear cuenta
    const account = await prisma.financialAccount.create({
      data: accountData,
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    console.error("Error creating account:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
