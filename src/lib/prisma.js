import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting
// database connections.
const globalForPrisma = globalThis;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Neon (serverless Postgres) auto-suspends when idle; the first query after a
// while can fail to connect (P1001/P1017) while the compute wakes up. Retry
// those transient connection errors so queries wait for the DB instead of
// crashing the page.
function isTransientConnError(e) {
  return (
    e?.code === 'P1001' ||
    e?.code === 'P1017' ||
    /Can't reach database server|Server has closed the connection/i.test(e?.message || '')
  );
}

function createPrisma() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError;
        // Up to 5 attempts with increasing back-off (~0.4s → 2s), enough for a cold start.
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            return await query(args);
          } catch (e) {
            if (!isTransientConnError(e)) throw e;
            lastError = e;
            await sleep(400 * (attempt + 1));
          }
        }
        throw lastError;
      }
    }
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
