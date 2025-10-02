import { PrismaClient } from "@prisma/client";

<<<<<<< HEAD
import { PrismaClient } from '@prisma/client';

=======
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

<<<<<<< HEAD
=======
import { applyRoleBasedMiddleware } from './prismaMiddleware';

// Apply role-based middleware (will be a no-op if no session in context)
try {
  applyRoleBasedMiddleware(prisma);
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Failed to apply prisma role-based middleware', e);
}

>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
