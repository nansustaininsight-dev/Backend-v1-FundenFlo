import { randomInt } from 'node:crypto';

import bcrypt from 'bcrypt';

import { env } from '../../config/env';
import { AppError } from '../../lib/app-error';
import { prisma } from '../../lib/prisma';
import type { AuthSession, PublicUser } from './auth.types';
import type { RequestOtpInput, VerifyOtpInput } from './auth.schema';
import { createSmsProvider } from './dev-sms-provider';
import { issueSession, revokeRefreshToken, rotateRefreshToken, toPublicUser } from './token.service';

const sms = createSmsProvider();
const OTP_WINDOW_MS = 15 * 60 * 1000;

function nextOtpCode(): string {
  if (env.NODE_ENV !== 'production') return env.OTP_DEV_CODE ?? '123456';
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

async function issueOtp(input: RequestOtpInput): Promise<{ resendIn: number }> {
  const since = new Date(Date.now() - OTP_WINDOW_MS);
  const recent = await prisma.otpChallenge.count({
    where: { mobile: input.mobile, createdAt: { gte: since } },
  });
  if (recent >= env.OTP_MAX_REQUESTS) {
    throw new AppError(429, 'OTP_RATE_LIMIT', 'Too many OTP requests. Please try again later.');
  }

  const latest = await prisma.otpChallenge.findFirst({
    where: { mobile: input.mobile, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (latest && latest.resendAvailableAt.getTime() > Date.now()) {
    const wait = Math.max(1, Math.ceil((latest.resendAvailableAt.getTime() - Date.now()) / 1000));
    throw new AppError(429, 'OTP_COOLDOWN', `Please wait ${wait} seconds before requesting another code.`);
  }

  const code = nextOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const now = Date.now();
  const referralCode = input.referralCode ?? latest?.referralCode ?? null;

  await prisma.$transaction(async (tx) => {
    await tx.otpChallenge.updateMany({
      where: { mobile: input.mobile, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await tx.otpChallenge.create({
      data: {
        mobile: input.mobile,
        codeHash,
        referralCode,
        expiresAt: new Date(now + env.OTP_TTL_MINUTES * 60 * 1000),
        resendAvailableAt: new Date(now + env.OTP_RESEND_SECONDS * 1000),
      },
    });
  });

  await sms.sendOtp({ mobile: input.mobile, countryCode: input.countryCode, code });
  return { resendIn: env.OTP_RESEND_SECONDS };
}

export function requestOtp(input: RequestOtpInput): Promise<{ resendIn: number }> {
  return issueOtp(input);
}

export async function resendOtp(mobile: string): Promise<{ resendIn: number }> {
  return issueOtp({ mobile, countryCode: '+91' });
}

export async function verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { mobile: input.mobile, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!challenge) throw new AppError(400, 'OTP_NOT_FOUND', 'Request a code first.');
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    throw new AppError(400, 'OTP_EXPIRED', 'This code has expired. Please request a new one.');
  }

  const matches = await bcrypt.compare(input.otp, challenge.codeHash);
  if (!matches) {
    const attempts = challenge.attempts + 1;
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts,
        consumedAt: attempts >= env.OTP_MAX_ATTEMPTS ? new Date() : null,
      },
    });
    if (attempts >= env.OTP_MAX_ATTEMPTS) {
      throw new AppError(401, 'OTP_LOCKED', 'Too many incorrect attempts. Please request a new code.');
    }
    throw new AppError(401, 'OTP_INVALID', 'Incorrect code. Please check and try again.');
  }

  return prisma.$transaction(async (tx) => {
    const consumed = await tx.otpChallenge.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) throw new AppError(400, 'OTP_NOT_FOUND', 'Request a code first.');

    const user = await tx.user.upsert({
      where: { mobile: input.mobile },
      create: {
        mobile: input.mobile,
        countryCode: '+91',
        referralCode: challenge.referralCode,
      },
      update: {},
    });
    return issueSession(user, tx);
  });
}

export async function refreshSession(refreshToken: string): Promise<AuthSession> {
  return rotateRefreshToken(refreshToken);
}

export async function logout(userId: string, refreshToken: string): Promise<{ ok: true }> {
  await revokeRefreshToken(userId, refreshToken);
  return { ok: true };
}

export async function currentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Please log in again.');
  return toPublicUser(user);
}
