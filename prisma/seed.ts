import { PrismaClient } from "@prisma/client";
import {
  defaultExpenseCategories,
  defaultIncomeCategories,
} from "../lib/validations/category";
import * as dotenv from "dotenv";
import * as path from "path";

// Cargar variables de entorno - buscar .env.local primero, luego .env
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Crear un usuario de ejemplo para desarrollo (opcional)
  const user = await prisma.user.upsert({
    where: { email: "demo@finz.app" },
    update: {},
    create: {
      email: "demo@finz.app",
      name: "Usuario Demo",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Usuario creado/actualizado: ${user.email}`);

  // Crear categorías predeterminadas de gastos
  console.log("📦 Creando categorías de gastos...");
  for (const category of defaultExpenseCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: category.name,
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: category.name,
        type: "EXPENSE",
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
    });
  }

  // Crear categorías predeterminadas de ingresos
  console.log("💰 Creando categorías de ingresos...");
  for (const category of defaultIncomeCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: category.name,
          type: "INCOME",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: category.name,
        type: "INCOME",
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
    });
  }

  console.log("✅ Categorías predeterminadas creadas");

  // Crear cuentas de ejemplo
  console.log("🏦 Creando cuentas de ejemplo...");
  
  const bankAccount = await prisma.financialAccount.upsert({
    where: { id: "seed-bank-account" },
    update: {},
    create: {
      id: "seed-bank-account",
      userId: user.id,
      name: "Cuenta Banco Principal",
      type: "BANK_ACCOUNT",
      balance: 15000,
      currency: "MXN",
      color: "#3B82F6",
      icon: "Building2",
      description: "Cuenta principal para gastos cotidianos",
    },
  });

  const savingsAccount = await prisma.financialAccount.upsert({
    where: { id: "seed-savings-account" },
    update: {},
    create: {
      id: "seed-savings-account",
      userId: user.id,
      name: "Cuenta de Ahorros",
      type: "SAVINGS_ACCOUNT",
      balance: 50000,
      currency: "MXN",
      color: "#10B981",
      icon: "PiggyBank",
      description: "Ahorros para emergencias",
    },
  });

  console.log("✅ Cuentas creadas");

  // Crear transacciones de ejemplo
  console.log("💸 Creando transacciones de ejemplo...");
  
  const alimentacionCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: "Alimentación", type: "EXPENSE" },
  });

  const salarioCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: "Salario", type: "INCOME" },
  });

  if (alimentacionCategory) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: alimentacionCategory.id,
        type: "EXPENSE",
        amount: 450.50,
        description: "Compra en supermercado",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        notes: "Despensa semanal",
      },
    });
  }

  if (salarioCategory) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: salarioCategory.id,
        type: "INCOME",
        amount: 15000,
        description: "Pago de nómina",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
      },
    });
  }

  console.log("✅ Transacciones creadas");

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
