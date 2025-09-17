import { PrismaClient } from "@prisma/client";

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

import { applyRoleBasedMiddleware } from './prismaMiddleware';

// Apply role-based middleware (will be a no-op if no session in context)
try {
  applyRoleBasedMiddleware(prisma);
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Failed to apply prisma role-based middleware', e);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
