/**
 * In-memory JWT blacklist for invalidated tokens.
 *
 * When a user logs out, their JWT is added here. The requireAuth middleware
 * checks this set before accepting a token.
 *
 * LIMITATIONS:
 * - In-memory only — resets on server restart (acceptable for MVP).
 * - Not shared across multiple server instances.
 *
 * PRODUCTION UPGRADE: Replace with Redis using TTL matching JWT expiry:
 *   await redis.set(`blacklist:${token}`, '1', 'EX', jwtTtlSeconds);
 *   const blocked = await redis.exists(`blacklist:${token}`);
 */

const blacklisted = new Set<string>();

/**
 * Periodic cleanup: remove expired tokens from the set.
 * JWTs have a max lifetime of 7 days. We sweep every hour and remove
 * entries older than 7 days to prevent unbounded memory growth.
 *
 * Implementation: store insertion time alongside the token.
 */
const insertionTimes = new Map<string, number>();

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (matches JWT maxAge)

/** Add a token to the blacklist. */
export const blacklistToken = (token: string): void => {
  blacklisted.add(token);
  insertionTimes.set(token, Date.now());
};

/** Check if a token has been blacklisted. */
export const isBlacklisted = (token: string): boolean =>
  blacklisted.has(token);

/** Sweep expired entries (called on a timer). */
const sweep = (): void => {
  const now = Date.now();
  for (const [token, insertedAt] of insertionTimes) {
    if (now - insertedAt > MAX_AGE_MS) {
      blacklisted.delete(token);
      insertionTimes.delete(token);
    }
  }
};

// Sweep every hour
setInterval(sweep, 60 * 60 * 1000).unref();
