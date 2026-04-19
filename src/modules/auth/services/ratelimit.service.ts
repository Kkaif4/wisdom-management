/**
 * Rate Limit Service (In-memory)
 *
 * Implements a simple sliding-window rate limiter.
 * In a multi-instance production environment, this should be replaced
 * with a Redis-backed implementation.
 */

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const loginLimit: RateLimitConfig = { windowMs: 60 * 1000, max: 5 }; // 5 attempts per minute
const registerLimit: RateLimitConfig = { windowMs: 60 * 60 * 1000, max: 3 }; // 3 registrations per hour

class RateLimiter {
  private buckets: Map<string, number[]> = new Map();

  async isRateLimited(key: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing attempts and filter out expired ones
    let attempts = this.buckets.get(key) || [];
    attempts = attempts.filter((timestamp) => timestamp > windowStart);

    if (attempts.length >= config.max) {
      return true;
    }

    // Add current attempt and update bucket
    attempts.push(now);
    this.buckets.set(key, attempts);
    return false;
  }

  // Cleanup old entries to prevent memory leak
  cleanup() {
    const now = Date.now();
    for (const [key, attempts] of this.buckets.entries()) {
      const windowStart = now - 60 * 60 * 1000; // 1hr max window
      const valid = attempts.filter((t) => t > windowStart);
      if (valid.length === 0) {
        this.buckets.delete(key);
      } else {
        this.buckets.set(key, valid);
      }
    }
  }
}

const limiter = new RateLimiter();

// Run cleanup every 10 minutes
setInterval(() => limiter.cleanup(), 10 * 60 * 1000);

export class RateLimitService {
  /**
   * Checks if a login attempt should be throttled.
   * Key: IP + email
   */
  static async checkLogin(ip: string, email: string): Promise<boolean> {
    const key = `auth:login:${ip}:${email}`;
    const limited = await limiter.isRateLimited(key, loginLimit);
    if (limited) {
      console.warn(
        `[RATE_LIMIT_SERVICE] [checkLogin] Rate limit EXCEEDED for: ${email} (IP: ${ip})`,
      );
    }
    return limited;
  }

  /**
   * Checks if a registration attempt should be throttled.
   * Key: IP
   */
  static async checkRegistration(ip: string): Promise<boolean> {
    const key = `auth:register:${ip}`;
    const limited = await limiter.isRateLimited(key, registerLimit);
    if (limited) {
      console.warn(
        `[RATE_LIMIT_SERVICE] [checkRegistration] Rate limit EXCEEDED for: ${ip}`,
      );
    }
    return limited;
  }
}
