import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

export function getLimiter() {
  // In tests or when Upstash is not configured, return a no-op limiter
  if (
    process.env.NODE_ENV === 'test' ||
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return {
      async limit() {
        return { success: true, limit: 0, reset: 0, remaining: 0 } as const;
      },
    } as unknown as Ratelimit;
  }

  if (!limiter) {
    try {
      const redis = Redis.fromEnv();
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        analytics: true,
        prefix: "rl",
      });
    } catch {
      // Fallback to no-op if construction fails
      return {
        async limit() {
          return { success: true, limit: 0, reset: 0, remaining: 0 } as const;
        },
      } as unknown as Ratelimit;
    }
  }
  return limiter;
}


