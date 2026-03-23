/**
 * Prisma client singleton (Prisma v7 + pg adapter).
 *
 * Prerequisites:
 *   npm run db:push   — push schema to your PostgreSQL instance
 *   npm run db:seed   — seed with showcase data
 *
 * Import: import { db } from "@/lib/db"
 *
 * Requires DATABASE_URL in .env.local:
 *   DATABASE_URL="postgresql://user:password@localhost:5432/amproject"
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
