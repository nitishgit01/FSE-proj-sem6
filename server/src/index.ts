import dotenv from 'dotenv';

// Load .env BEFORE importing config (config reads process.env at import time)
dotenv.config();

import connectDB from './config/db';
import { config } from './config/env';
import app from './app';

/**
 * WageGlass server entry point.
 *
 * 1. Load environment variables from .env
 * 2. Validate required env vars (fail-fast via config/env.ts)
 * 3. Connect to MongoDB Atlas
 * 4. Start Express on config.PORT
 * 5. Register graceful shutdown handlers
 */
const startServer = async (): Promise<void> => {
  // Connect to MongoDB
  await connectDB();

  // Start Express
  const server = app.listen(config.PORT, () => {
    console.log(`🚀 WageGlass server running on port ${config.PORT}`);
    console.log(`📍 Environment: ${config.NODE_ENV}`);
    console.log(`🔗 Client URL: ${config.CLIENT_URL}`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('🛑 HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10 seconds if connections hang
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
