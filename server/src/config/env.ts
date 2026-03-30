import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // MongoDB
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cookie
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // CORS
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // Email — SMTP (optional: one of SMTP or RESEND)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Email — Resend (optional)
  RESEND_API_KEY: z.string().optional(),

  // From address
  FROM_EMAIL: z.string().email().default('noreply@wageglass.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
