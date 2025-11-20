import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import {
  defaultExpenseCategories,
  defaultIncomeCategories,
} from "@/lib/validations/category"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

// Función para crear categorías predeterminadas para un nuevo usuario
async function createDefaultCategories(userId: string) {
  try {
    const categories = [
      ...defaultExpenseCategories.map((cat) => ({
        ...cat,
        userId,
        isDefault: true,
      })),
      ...defaultIncomeCategories.map((cat) => ({
        ...cat,
        userId,
        isDefault: true,
      })),
    ];

    await prisma.category.createMany({
      data: categories,
      skipDuplicates: true,
    });

    console.log(`✅ Categorías predeterminadas creadas para usuario: ${userId}`);
  } catch (error) {
    console.error("Error creando categorías predeterminadas:", error);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM!,
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/error',
    verifyRequest: '/verify-request',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Crear categorías predeterminadas cuando se crea un nuevo usuario
      if (user.id) {
        await createDefaultCategories(user.id);
      }
    },
  },
  session: {
    strategy: "database",
  },
})
