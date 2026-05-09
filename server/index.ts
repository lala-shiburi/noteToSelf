import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { connectDB } from './config/db.js';
import quoteRoutes from './routes/quoteRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { scheduleDailyNotifications } from './cron/sendDailyNotifications.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ].filter((origin): origin is string => Boolean(origin))
);

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api', quoteRoutes);
app.use('/api', subscriptionRoutes);

void connectDB().then(() => {
  scheduleDailyNotifications();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
