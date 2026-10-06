import { z } from 'zod';

export const entityTypeSchema = z.object({
  entityType: z.enum(['msme', 'individual'], {
    error: 'Select Business / MSME or Individual.',
  }),
});

export type EntityTypeInput = z.infer<typeof entityTypeSchema>;
