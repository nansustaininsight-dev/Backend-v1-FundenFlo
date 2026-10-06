import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { requireAuth } from '../../middlewares/require-auth';
import {
  logoutController,
  meController,
  profileController,
  refreshController,
  requestOtpController,
  resendOtpController,
  verifyOtpController,
} from './auth.controller';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: 'Too many OTP requests. Please try again later.',
      code: 'OTP_RATE_LIMIT',
    });
  },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: 'Too many attempts. Please try again later.',
      code: 'OTP_RATE_LIMIT',
    });
  },
});

export const authRouter = Router();

authRouter.post('/otp/request', otpLimiter, requestOtpController);
authRouter.post('/otp/resend', otpLimiter, resendOtpController);
authRouter.post('/otp/verify', verifyLimiter, verifyOtpController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', requireAuth, logoutController);
authRouter.patch('/profile', requireAuth, profileController);
authRouter.get('/me', requireAuth, meController);
