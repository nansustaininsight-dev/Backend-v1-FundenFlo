import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth';
import { getEntityController, saveEntityController } from './borrower.controller';

export const borrowerRouter = Router();

borrowerRouter.put('/entity-type', requireAuth, saveEntityController);
borrowerRouter.get('/entity-type', requireAuth, getEntityController);
