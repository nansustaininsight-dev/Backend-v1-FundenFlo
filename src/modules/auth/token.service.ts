import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import type { Prisma, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { AppError } from '../../lib/app-error';
import { prisma } from '../../lib/prisma';
import type { AuthSession, PublicUser } from './auth.types';

type TokenStore = Prisma.TransactionClient | typeof prisma;

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function toPublicUser(user: Pick<User, 'id' | 'mobile' | 'fullName' | 'pan' | 'dob'>): PublicUser {
  const publicUser: PublicUser = { id: user.id, mobile: user.mobile };
  if (user.fullName) publicUser.fullName = user.fullName;
  if (user.pan) publicUser.pan = user.pan;
  if (user.dob) {
    const day = String(user.dob.getUTCDate()).padStart(2, '0');
    const month = String(user.dob.getUTCMonth() + 1).padStart(2, '0');
    publicUser.dob = `${day}/${month}/${user.dob.getUTCFullYear()}`;
  }
  return publicUser;
}

export async function issueSession(user: User, store: TokenStore = prisma): Promise<AuthSession> {
  const secret = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  const refresh = await store.refreshToken.create({
    data: { userId: user.id, tokenHash: hashSecret(secret), expiresAt },
  });
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL_SECONDS,
    jwtid: randomBytes(16).toString('hex'),
  });
  return { token, refreshToken: `${refresh.id}.${secret}`, user: toPublicUser(user) };
}

function readRefreshToken(refreshToken: string): { id: string; secret: string } {
  const dot = refreshToken.indexOf('.');
  const id = dot > 0 ? refreshToken.slice(0, dot) : '';
  const secret = dot > 0 ? refreshToken.slice(dot + 1) : '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || !secret) {
    throw new AppError(401, 'REFRESH_INVALID', 'Please log in again.');
  }
  return { id, secret };
}

function hashesMatch(storedHex: string, secret: string): boolean {
  const actual = Buffer.from(storedHex, 'hex');
  const expected = Buffer.from(hashSecret(secret), 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function rotateRefreshToken(refreshToken: string): Promise<AuthSession> {
  const parsed = readRefreshToken(refreshToken);
  const current = await prisma.refreshToken.findUnique({
    where: { id: parsed.id },
    include: { user: true },
  });
  if (!current || !hashesMatch(current.tokenHash, parsed.secret)) {
    throw new AppError(401, 'REFRESH_INVALID', 'Please log in again.');
  }
  if (current.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: current.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, 'REFRESH_REUSED', 'This session is no longer valid. Please log in again.');
  }
  if (current.expiresAt.getTime() <= Date.now()) {
    throw new AppError(401, 'REFRESH_EXPIRED', 'Your session has expired. Please log in again.');
  }

  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
    return issueSession(current.user, tx);
  });
}

export async function revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const parsed = readRefreshToken(refreshToken);
  const current = await prisma.refreshToken.findUnique({ where: { id: parsed.id } });
  if (!current || current.userId !== userId || !hashesMatch(current.tokenHash, parsed.secret)) {
    throw new AppError(401, 'REFRESH_INVALID', 'Please log in again.');
  }
  if (!current.revokedAt) {
    await prisma.refreshToken.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
  }
}
