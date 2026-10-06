import { env } from '../../config/env';
import { AppError } from '../../lib/app-error';
import type { OtpSms, SmsProvider } from './sms-provider';

export class DevSmsProvider implements SmsProvider {
  async sendOtp(input: OtpSms): Promise<void> {
    if (env.NODE_ENV === 'production') {
      throw new AppError(503, 'SMS_NOT_CONFIGURED', 'SMS provider is not configured.');
    }
    console.log(`[dev-sms] OTP for ${input.countryCode} ${input.mobile}: ${input.code}`);
  }
}

export function createSmsProvider(): SmsProvider {
  if (env.SMS_PROVIDER === 'mock') return new DevSmsProvider();
  throw new AppError(503, 'SMS_NOT_CONFIGURED', 'SMS provider is not configured.');
}
