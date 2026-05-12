/**
 * Vercel Serverless Function entry point for the WageGlass Express backend.
 *
 * Required Vercel environment variables (set in server project → Settings → Env Vars):
 *   MONGO_URI        - MongoDB Atlas connection string
 *   JWT_SECRET       - At least 32-character random secret
 *   JWT_EXPIRES_IN   - e.g. "7d"
 *   CLIENT_URL       - Your Vercel frontend URL (e.g. https://fse-proj-sem6-client.vercel.app)
 *   NODE_ENV         - "production"
 *   COOKIE_SECURE    - "true"
 */

import type { IncomingMessage, ServerResponse } from 'http';
import mongoose from 'mongoose';

// ── MongoDB connection cache ────────────────────────────────────────────────
let isConnected = false;

async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Add it in the Vercel dashboard → Settings → Environment Variables.'
    );
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
}

// ── Validate required env vars up front ─────────────────────────────────────
function checkRequiredEnvVars(): string | null {
  const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'CLIENT_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    return `Missing required environment variables: ${missing.join(', ')}. Set them in Vercel dashboard → Settings → Environment Variables.`;
  }
  if ((process.env.JWT_SECRET?.length ?? 0) < 32) {
    return 'JWT_SECRET must be at least 32 characters long.';
  }
  return null;
}

// Helper to send JSON error response
function sendError(res: ServerResponse, status: number, code: string, message: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: { code, message } }));
}

// ── Serverless handler ──────────────────────────────────────────────────────
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // 1. Check env vars BEFORE importing the app (env.ts throws if vars are missing)
  const envError = checkRequiredEnvVars();
  if (envError) {
    console.error('❌ Configuration error:', envError);
    sendError(res, 500, 'CONFIG_ERROR', envError);
    return;
  }

  // 2. Connect to MongoDB
  try {
    await connectDB();
  } catch (err: any) {
    console.error('❌ DB connection failed:', err.message);
    sendError(res, 503, 'DB_CONNECTION_FAILED', `Database connection failed: ${err.message}`);
    return;
  }

  // 3. Dynamically import the Express app (so env.ts runs AFTER env vars are validated)
  try {
    const { default: app } = await import('../src/app');
    app(req as any, res as any);
  } catch (err: any) {
    console.error('❌ App initialization error:', err.message, err.stack);
    sendError(res, 500, 'INIT_ERROR', `Server initialization failed: ${err.message}`);
  }
}
