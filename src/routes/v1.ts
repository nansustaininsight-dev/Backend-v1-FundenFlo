import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes';
import { borrowerRouter } from '../modules/borrower/borrower.routes';
import { healthRouter } from '../modules/health/health.routes';

export const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/borrower', borrowerRouter);
