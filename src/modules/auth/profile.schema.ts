import { z } from 'zod';

const NAME = /^[A-Za-z][A-Za-z .'-]*$/;
const PAN = /^[A-Z]{5}\d{4}[A-Z]$/;

function dobError(value: string, today = new Date()): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'Enter your date of birth as DD/MM/YYYY.';
  const parts = value.split('/').map(Number);
  const dd = parts[0];
  const mm = parts[1];
  const yyyy = parts[2];
  if (dd === undefined || mm === undefined || yyyy === undefined) return 'Enter your date of birth as DD/MM/YYYY.';
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return 'Enter a valid date.';
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date > start) return 'Date of birth can’t be in the future.';
  let age = start.getFullYear() - yyyy;
  const monthDelta = start.getMonth() - (mm - 1);
  if (monthDelta < 0 || (monthDelta === 0 && start.getDate() < dd)) age -= 1;
  if (age < 18) return 'You need to be 18 or older to continue.';
  if (age > 100) return 'Enter a valid date of birth.';
  return null;
}

export const profileSchema = z
  .object({
    fullName: z.string(),
    pan: z.string(),
    dob: z.string(),
  })
  .transform((value, ctx) => {
    const fullName = value.fullName.trim().replace(/\s+/g, ' ');
    const pan = value.pan.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const nameMessage =
      fullName.length < 2
        ? 'Enter your full name.'
        : fullName.length > 80 || !NAME.test(fullName)
          ? 'Use the name printed on your PAN, letters only.'
          : null;
    const panMessage = PAN.test(pan) ? null : 'Enter a valid PAN, for example ABCDE1234F.';
    const dateMessage = dobError(value.dob);
    const message = nameMessage ?? panMessage ?? dateMessage;
    if (message) {
      ctx.addIssue({ code: 'custom', message });
      return z.NEVER;
    }
    const parts = value.dob.split('/').map(Number);
    const dobDate = new Date(Date.UTC(parts[2] ?? 0, (parts[1] ?? 1) - 1, parts[0] ?? 1));
    return { fullName, pan, dob: value.dob, dobDate };
  });

export type ProfileInput = z.infer<typeof profileSchema>;
