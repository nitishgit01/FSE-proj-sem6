import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas (or local MongoDB) using the MONGO_URI
 * environment variable.
 *
 * Call this once at server startup before registering routes.
 * The function will:
 * - Log a success message on connection.
 * - Log the error and exit the process on failure (fail-fast).
 * - Register a listener for unexpected disconnections.
 *
 * @example
 * ```ts
 * import connectDB from './config/db';
 * await connectDB();
 * ```
 */
const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose 8 uses the new URL parser and unified topology
      // by default — no need for deprecated options.
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }

  // ── Handle unexpected disconnections after initial connect ──────
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
};

export default connectDB;
