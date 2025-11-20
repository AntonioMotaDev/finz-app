export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createCategorySchema,
  categoryFilterSchema,
  defaultExpenseCategories,
  defaultIncomeCategories,
} from "@/lib/validations/category";

// GET /api/categories - Listar categorías del usuario
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
      search: searchParams.get("search") || undefined,
    };

    // Validar filtros
    const filters = categoryFilterSchema.parse(filterParams);

    // Construir where clause
    const where: any = {
      userId: session.user.id,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Obtener categorías
    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al obtener las categorías" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const validatedData = createCategorySchema.parse(body);

    // Verificar que no exista una categoría con el mismo nombre y tipo
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
        type: validatedData.type,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre para este tipo" },
        { status: 400 }
      );
    }

    // Crear categoría
    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        isDefault: false,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}
