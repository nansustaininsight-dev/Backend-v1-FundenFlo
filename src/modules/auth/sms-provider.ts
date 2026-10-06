export type OtpSms = {
  mobile: string;
  countryCode: string;
  code: string;
};

export interface SmsProvider {
  sendOtp(input: OtpSms): Promise<void>;
}
