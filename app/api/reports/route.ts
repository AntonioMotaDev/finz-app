/**
 * API Route para Reportes
 * 
 * GET /api/reports?type=weekly|monthly|annual|category|networth&...params
 */

import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getWeeklyReport,
  getMonthlyReport,
  getAnnualReport,
  getCategoryReport,
  getNetWorthReport,
} from "@/lib/services/reports";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Tipo de reporte requerido" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    switch (type) {
      case "weekly": {
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        if (!startDateParam || !endDateParam) {
          // Si no se proporcionan fechas, usar la semana actual
          const now = new Date();
          const startDate = startOfWeek(now, { weekStartsOn: 1 }); // Lunes
          const endDate = endOfWeek(now, { weekStartsOn: 1 }); // Domingo
          
          const data = await getWeeklyReport(userId, startDate, endDate);
          return NextResponse.json(data);
        }

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);

        const data = await getWeeklyReport(userId, startDate, endDate);
        return NextResponse.json(data);
      }

      case "monthly": {
        const yearParam = searchParams.get("year");
        const monthParam = searchParams.get("month");

        if (!yearParam || !monthParam) {
          // Si no se proporcionan, usar el mes actual
          const now = new Date();
          const data = await getMonthlyReport(userId, now.getFullYear(), now.getMonth());
          return NextResponse.json(data);
        }

        const year = parseInt(yearParam);
        const month = parseInt(monthParam);

        if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
          return NextResponse.json(
            { error: "Año o mes inválido" },
            { status: 400 }
          );
        }

        const data = await getMonthlyReport(userId, year, month);
        return NextResponse.json(data);
      }

      case "annual": {
        const yearParam = searchParams.get("year");

        if (!yearParam) {
          // Si no se proporciona, usar el año actual
          const now = new Date();
          const data = await getAnnualReport(userId, now.getFullYear());
          return NextResponse.json(data);
        }

        const year = parseInt(yearParam);

        if (isNaN(year)) {
          return NextResponse.json({ error: "Año inválido" }, { status: 400 });
        }

        const data = await getAnnualReport(userId, year);
        return NextResponse.json(data);
      }

      case "category": {
        const categoryId = searchParams.get("categoryId");
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        if (!categoryId) {
          return NextResponse.json(
            { error: "ID de categoría requerido" },
            { status: 400 }
          );
        }

        if (!startDateParam || !endDateParam) {
          return NextResponse.json(
            { error: "Fechas de inicio y fin requeridas" },
            { status: 400 }
          );
        }

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);

        const data = await getCategoryReport(userId, categoryId, startDate, endDate);
        return NextResponse.json(data);
      }

      case "networth": {
        const data = await getNetWorthReport(userId);
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json(
          { error: "Tipo de reporte no válido" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
