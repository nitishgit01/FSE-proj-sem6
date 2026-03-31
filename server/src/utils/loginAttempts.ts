/**
 * In-memory login brute-force tracker.
 *
 * After MAX_ATTEMPTS failed login attempts within WINDOW_MS from a single IP,
 * all further login attempts from that IP are rejected with 429 for the
 * remainder of the window.
 *
 * Why in-memory (not Redis) for MVP:
 * - Zero extra infrastructure.
 * - Resets on deploy — acceptable for prototype.
 * - Production: swap `store` for a Redis hash with EXPIREAT.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count:   number;
  firstAt: number; // epoch ms of first failed attempt in this window
}

const store = new Map<string, AttemptRecord>();

/**
 * Record a failed login attempt for the given IP.
 * Returns the number of failures so far in this window.
 */
export const recordFailedAttempt = (ip: string): number => {
  const now    = Date.now();
  const record = store.get(ip);

  if (!record || now - record.firstAt >= WINDOW_MS) {
    // Start fresh window
    store.set(ip, { count: 1, firstAt: now });
    return 1;
  }

  record.count += 1;
  return record.count;
};

/**
 * Returns how many minutes remain in the lockout window.
 * Returns 0 if IP is not locked.
 */
export const getLockoutMinutes = (ip: string): number => {
  const record = store.get(ip);
  if (!record) return 0;
  const elapsed = Date.now() - record.firstAt;
  if (elapsed >= WINDOW_MS || record.count < MAX_ATTEMPTS) return 0;
  return Math.ceil((WINDOW_MS - elapsed) / 60_000);
};

/**
 * Check whether an IP is currently locked out.
 */
export const isLockedOut = (ip: string): boolean =>
  getLockoutMinutes(ip) > 0;

/**
 * Clear the failed-attempt record for an IP on successful login.
 */
export const clearAttempts = (ip: string): void => {
  store.delete(ip);
};

/**
 * Sweep stale entries every 15 minutes to prevent unbounded growth.
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of store) {
    if (now - record.firstAt >= WINDOW_MS) {
      store.delete(ip);
    }
  }
}, WINDOW_MS).unref(); // .unref() so the timer doesn't block process exit
