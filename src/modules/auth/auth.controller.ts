import type { Request, Response } from 'express';

import { AppError } from '../../lib/app-error';
import { asyncHandler } from '../../lib/async-handler';
import { refreshTokenSchema, requestOtpSchema, resendOtpSchema, verifyOtpSchema } from './auth.schema';
import { currentUser, logout, refreshSession, requestOtp, resendOtp, verifyOtp } from './auth.service';

export const requestOtpController = asyncHandler(async (req: Request, res: Response) => {
  const body = requestOtpSchema.parse(req.body);
  res.status(200).json(await requestOtp(body));
});

export const resendOtpController = asyncHandler(async (req: Request, res: Response) => {
  const body = resendOtpSchema.parse(req.body);
  res.status(200).json(await resendOtp(body.mobile));
});

export const verifyOtpController = asyncHandler(async (req: Request, res: Response) => {
  const body = verifyOtpSchema.parse(req.body);
  res.status(200).json(await verifyOtp(body));
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const body = refreshTokenSchema.parse(req.body);
  res.status(200).json(await refreshSession(body.refreshToken));
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');
  const body = refreshTokenSchema.parse(req.body);
  res.status(200).json(await logout(req.user.id, body.refreshToken));
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');
  res.status(200).json({ user: await currentUser(req.user.id) });
});
