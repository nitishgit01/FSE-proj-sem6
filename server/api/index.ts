/**
 * Vercel Serverless Function entry point for the WageGlass Express backend.
 *
 * How it works:
 * - Vercel calls this handler for every incoming HTTP request.
 * - On the first (cold-start) invocation, it connects to MongoDB Atlas.
 * - On subsequent warm invocations it reuses the existing connection.
 * - The Express app (src/app.ts) handles routing exactly as before.
 *
 * Required Vercel environment variables (set in Vercel dashboard):
 *   MONGO_URI        - MongoDB Atlas connection string
 *   JWT_SECRET       - At least 32-character random secret
 *   JWT_EXPIRES_IN   - e.g. "7d"
 *   CLIENT_URL       - Your Vercel frontend URL (e.g. https://fse-proj-sem6-client.vercel.app)
 *   NODE_ENV         - "production"
 *   COOKIE_SECURE    - "true"
 */

import dotenv from 'dotenv';
// dotenv.config() is a no-op on Vercel (env vars are injected by the platform),
// but harmless and useful for local `vercel dev` testing.
dotenv.config();

import mongoose from 'mongoose';
import type { IncomingMessage, ServerResponse } from 'http';

// Import the Express app — routes, middleware, error handlers are all registered
import app from '../src/app';

// ── MongoDB connection cache ────────────────────────────────────────────────
// Vercel serverless functions may share a Node.js process between requests
// (warm invocations). We cache the connection state so we don't reconnect
// on every request — only on cold starts.

let isConnected = false;

async function connectDB(): Promise<void> {
  // Skip if we already have an open connection
  if (isConnected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set in Vercel dashboard.');
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log(`✅ MongoDB connected (serverless): ${mongoose.connection.host}`);
}

// ── Serverless handler ────────────────────────────────────────────────────────

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // Ensure DB is connected before Express handles the request
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ DB connection failed in serverless handler:', err);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database connection failed. Please try again shortly.',
        },
      })
    );
    return;
  }

  // Hand off to the Express app
  // Express accepts Node's IncomingMessage/ServerResponse natively
  app(req as any, res as any);
}
