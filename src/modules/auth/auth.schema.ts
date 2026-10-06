import { z } from 'zod';

const mobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.');

const referralCode = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.toUpperCase();
}, z.string().regex(/^[A-Z0-9]{4,12}$/, 'Use 4–12 letters or numbers.').optional());

export const requestOtpSchema = z.object({
  mobile,
  countryCode: z.string().refine((value) => value === '+91', 'Only Indian mobile numbers (+91) are supported.'),
  referralCode,
});

export const resendOtpSchema = z.object({
  mobile,
});

export const verifyOtpSchema = z.object({
  mobile,
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
