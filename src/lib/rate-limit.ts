import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create Redis client (with fallback for development)
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// In-memory fallback for development
class MemoryStore {
  private data: Map<string, { count: number; reset: number }> = new Map()

  async get(key: string) {
    const item = this.data.get(key)
    if (!item) return null
    if (Date.now() > item.reset) {
      this.data.delete(key)
      return null
    }
    return item.count.toString()
  }

  async set(key: string, value: string, expirySeconds: number) {
    this.data.set(key, {
      count: parseInt(value),
      reset: Date.now() + expirySeconds * 1000,
    })
  }

  async incr(key: string) {
    const item = this.data.get(key)
    if (!item || Date.now() > item.reset) {
      this.data.set(key, { count: 1, reset: Date.now() + 3600000 })
      return 1
    }
    item.count++
    return item.count
  }
}

const memoryStore = new MemoryStore()

// Rate limiters for different endpoints
export const rateLimiters = {
  // Public detection: 3 per hour per IP
  publicDetection: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
        prefix: "ratelimit:public:detect",
      })
    : new Ratelimit({
        // @ts-ignore - Memory store for development
        redis: memoryStore,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
        prefix: "ratelimit:public:detect",
      }),

  // Auth endpoints: 5 per minute per IP
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "ratelimit:auth",
      })
    : new Ratelimit({
        // @ts-ignore
        redis: memoryStore,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "ratelimit:auth",
      }),

  // API endpoints: based on plan
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "ratelimit:api",
      })
    : new Ratelimit({
        // @ts-ignore
        redis: memoryStore,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "ratelimit:api",
      }),

  // General: 100 per minute per IP
  general: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "ratelimit:general",
      })
    : new Ratelimit({
        // @ts-ignore
        redis: memoryStore,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "ratelimit:general",
      }),
}

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const result = await limiter.limit(identifier)
  
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}

// Helper to get IP from request
export function getIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  return xff ? xff.split(",")[0].trim() : "127.0.0.1"
}

