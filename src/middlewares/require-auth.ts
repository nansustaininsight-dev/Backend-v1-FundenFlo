import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { AppError } from '../lib/app-error';
import { prisma } from '../lib/prisma';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
    if (!token) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const userId = typeof payload === 'string' ? '' : payload.sub;
    if (!userId) throw new AppError(401, 'TOKEN_INVALID', 'Please log in again.');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'borrower') throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');

    req.user = { id: user.id, mobile: user.mobile, role: user.role };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'TOKEN_INVALID', 'Please log in again.'));
      return;
    }
    next(error);
  }
}
