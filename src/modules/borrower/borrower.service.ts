import { AppError } from '../../lib/app-error';
import { prisma } from '../../lib/prisma';
import type { EntityTypeInput } from './borrower.schema';

export type EntityChoice = {
  id: string;
  entityType: 'msme' | 'individual';
};

export async function saveEntityType(userId: string, input: EntityTypeInput): Promise<EntityChoice> {
  const existing = await prisma.loanFile.findFirst({
    where: { userId, status: 'draft' },
    orderBy: { updatedAt: 'desc' },
  });
  const saved = existing
    ? await prisma.loanFile.update({
        where: { id: existing.id },
        data: { entityType: input.entityType },
      })
    : await prisma.loanFile.create({
        data: { userId, entityType: input.entityType },
      });
  return { id: saved.id, entityType: saved.entityType };
}

export async function getEntityType(userId: string): Promise<EntityChoice> {
  const current = await prisma.loanFile.findFirst({
    where: { userId, status: 'draft' },
    orderBy: { updatedAt: 'desc' },
  });
  if (!current) throw new AppError(404, 'ENTITY_NOT_SET', 'Select who this loan is for.');
  return { id: current.id, entityType: current.entityType };
}
