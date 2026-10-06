import type { Request, Response } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import { getHealth } from './health.service';

export const healthController = asyncHandler(async (_req: Request, res: Response) => {
  const report = await getHealth();
  res.status(report.database === 'up' ? 200 : 503).json(report);
});
