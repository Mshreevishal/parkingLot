import { PrismaClient } from '@prisma/client';

// Prevent multiple PrismaClient instances in dev (hot-reloading) and serverless
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
