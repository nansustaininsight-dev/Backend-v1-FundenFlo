import { Prisma } from '@prisma/client';

import { AppError } from '../../lib/app-error';
import { prisma } from '../../lib/prisma';
import type { ProfileInput } from './profile.schema';

export type SavedProfile = {
  fullName: string;
  pan: string;
  dob: string;
};

export async function saveProfile(userId: string, input: ProfileInput): Promise<SavedProfile> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { fullName: input.fullName, pan: input.pan, dob: input.dobDate },
    });
    if (!user.fullName || !user.pan) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
    }
    return { fullName: user.fullName, pan: user.pan, dob: input.dob };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'PAN_IN_USE', 'This PAN is already linked to another account.');
    }
    throw error;
  }
}
