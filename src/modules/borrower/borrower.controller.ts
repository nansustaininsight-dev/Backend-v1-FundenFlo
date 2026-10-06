import type { Request, Response } from 'express';

import { AppError } from '../../lib/app-error';
import { asyncHandler } from '../../lib/async-handler';
import { entityTypeSchema } from './borrower.schema';
import { getEntityType, saveEntityType } from './borrower.service';

export const saveEntityController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');
  const body = entityTypeSchema.parse(req.body);
  res.status(200).json(await saveEntityType(req.user.id, body));
});

export const getEntityController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');
  res.status(200).json(await getEntityType(req.user.id));
});
