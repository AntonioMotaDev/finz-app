import { PrismaClient } from "@prisma/client";
import {
  defaultExpenseCategories,
  defaultIncomeCategories,
} from "../lib/validations/category";
import * as dotenv from "dotenv";
import * as path from "path";

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Agregando categorías predeterminadas a todos los usuarios...");

  // Obtener todos los usuarios
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`📊 Encontrados ${users.length} usuarios`);

  for (const user of users) {
    console.log(`\n👤 Procesando usuario: ${user.email}`);

    // Verificar si ya tiene categorías
    const existingCategories = await prisma.category.findMany({
      where: { userId: user.id },
    });

    if (existingCategories.length > 0) {
      console.log(`   ⏭️  Ya tiene ${existingCategories.length} categorías, omitiendo...`);
      continue;
    }

    // Crear categorías predeterminadas
    const categories = [
      ...defaultExpenseCategories.map((cat) => ({
        ...cat,
        userId: user.id,
        isDefault: true,
      })),
      ...defaultIncomeCategories.map((cat) => ({
        ...cat,
        userId: user.id,
        isDefault: true,
      })),
    ];

    await prisma.category.createMany({
      data: categories,
      skipDuplicates: true,
    });

    console.log(`   ✅ ${categories.length} categorías creadas`);
  }

  console.log("\n🎉 Proceso completado!");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
