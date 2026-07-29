// Simple in-memory rate limiter for Vercel serverless
// Note: per-instance only, not shared across instances,
// but still blocks simple brute-force attacks
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10; // 10 attempts per window

export function checkRateLimit(ip) {
  const now = Date.now();
  const key = `${ip}`;
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts) {
      if (now - entry.windowStart > WINDOW_MS * 2) {
        attempts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
