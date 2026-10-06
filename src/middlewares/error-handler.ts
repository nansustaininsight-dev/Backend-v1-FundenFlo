import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env';
import { AppError } from '../lib/app-error';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Invalid request';
    res.status(400).json({ message, code: 'VALIDATION_ERROR' });
    return;
  }

  if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(500).json({ message: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' });
}
