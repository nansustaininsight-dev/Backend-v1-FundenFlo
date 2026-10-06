import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './config/env';
import './types/express';
import { errorHandler } from './middlewares/error-handler';
import { notFound } from './middlewares/not-found';
import { v1Router } from './routes/v1';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/v1/health',
  }),
);

app.use('/api/v1', v1Router);
app.use(notFound);
app.use(errorHandler);
