import { prisma } from '../../lib/prisma';

export type HealthReport = {
  status: 'ok' | 'degraded';
  service: 'fundenflo-api';
  database: 'up' | 'down';
  timestamp: string;
};

export async function getHealth(): Promise<HealthReport> {
  const timestamp = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', service: 'fundenflo-api', database: 'up', timestamp };
  } catch {
    return { status: 'degraded', service: 'fundenflo-api', database: 'down', timestamp };
  }
}
