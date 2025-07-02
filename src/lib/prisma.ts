import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Handle connection issues gracefully
prisma.$connect().catch((error) => {
  console.error("Failed to connect to database:", error)
  process.exit(1)
})

// Handle disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})