import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import submissionRoutes from './routes/submission.routes';
import statsRoutes from './routes/stats.routes';
import roleRoutes from './routes/role.routes';

const app = express();

// ── Middleware Stack (ORDER MATTERS) ──────────────────────

// 1. Security headers
app.use(helmet());

// 2. CORS — restrict to known frontend origin
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // Required for HttpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Parse JSON request bodies
app.use(express.json({ limit: '10kb' }));

// 4. Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Parse HttpOnly cookies
app.use(cookieParser());

// 6. Sanitise against NoSQL injection (strips $ and .)
app.use(mongoSanitize());

// 7. Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. Request logging (dev only)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 9. Global rate limiter
app.use(globalLimiter);

// ── Health Check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/roles', roleRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
    },
  });
});

// ── Global Error Handler (MUST be last) ───────────────────
app.use(errorHandler);

export default app;
