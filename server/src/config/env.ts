/**
 * Environment configuration with fail-fast validation.
 *
 * All required variables are checked at startup — if any are missing
 * the process exits immediately with a descriptive error message.
 * Optional variables fall back to sensible defaults.
 *
 * Usage:
 * ```ts
 * import { config } from './config/env';
 * // or
 * import { env } from './config/env';
 * ```
 */

// ────────────────────────────────────────────────────────────────────
// Required env vars — throw if missing
// ────────────────────────────────────────────────────────────────────

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`   Add it to your .env file or set it in your hosting dashboard.`);
    process.exit(1);
  }
  return value;
};

/** Read an optional env var, returning undefined if not set. */
const optional = (key: string): string | undefined => process.env[key] || undefined;

// ────────────────────────────────────────────────────────────────────
// Typed config object
// ────────────────────────────────────────────────────────────────────

export interface EnvConfig {
  /** MongoDB Atlas connection string. */
  MONGO_URI: string;

  /** Secret key for signing JWT tokens. */
  JWT_SECRET: string;

  /** JWT token lifetime (e.g. "7d", "24h"). */
  JWT_EXPIRES_IN: string;

  /** Origin URL of the React client (for CORS). */
  CLIENT_URL: string;

  /** Port the Express server listens on. */
  PORT: number;

  /** Current runtime environment. */
  NODE_ENV: 'development' | 'production' | 'test';

  /** Whether cookies require HTTPS (true in production). */
  COOKIE_SECURE: boolean;

  /** Cookie domain for cross-subdomain support. */
  COOKIE_DOMAIN: string;

  // ── Email (all optional — falls back to console logging) ────────

  /** SMTP hostname (e.g. smtp.gmail.com). */
  SMTP_HOST?: string;

  /** SMTP port (defaults to 587 if SMTP_HOST is set). */
  SMTP_PORT?: number;

  /** SMTP username / email address. */
  SMTP_USER?: string;

  /** SMTP password or app-specific password. */
  SMTP_PASS?: string;

  /** Sender address shown in verification emails. */
  FROM_EMAIL?: string;

  /** Resend API key (alternative to SMTP). */
  RESEND_API_KEY?: string;
}

export const config: EnvConfig = {
  // Required
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: required('JWT_EXPIRES_IN'),
  CLIENT_URL: required('CLIENT_URL'),

  // Optional with defaults
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',

  // Email (all optional)
  SMTP_HOST: optional('SMTP_HOST'),
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_USER: optional('SMTP_USER'),
  SMTP_PASS: optional('SMTP_PASS'),
  FROM_EMAIL: optional('FROM_EMAIL'),
  RESEND_API_KEY: optional('RESEND_API_KEY'),
};

// Export as both `config` and `env` for backwards compatibility
export { config as env };

export default config;
