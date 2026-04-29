import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limit
 *
 * Upstash Redis가 환경변수에 설정되어 있으면 Redis 기반 글로벌 rate limit,
 * 아니면 in-memory 기반 (단일 인스턴스만 동작 — 개발/저트래픽용).
 *
 * 환경변수:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

const hasUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Upstash Redis 또는 가짜 ephemeral cache
const redis = hasUpstash
  ? Redis.fromEnv()
  : null;

// in-memory fallback (배포 환경에선 인스턴스마다 분리됨, 개발/단일 컨테이너용)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  /** 시간 창 (밀리초) */
  windowMs: number;
  /** 시간 창당 최대 요청 수 */
  max: number;
  /** Redis prefix (기능별 구분) */
  prefix: string;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * 5초에 5회 — 일반 API
 */
export const apiLimiter = createLimiter({
  windowMs: 5_000,
  max: 5,
  prefix: "api",
});

/**
 * 1분에 5회 — 로그인/가입 (brute force 방지)
 */
export const authLimiter = createLimiter({
  windowMs: 60_000,
  max: 5,
  prefix: "auth",
});

/**
 * 1시간에 3회 — 비밀번호 재설정 / 이메일 인증 재발송
 */
export const emailLimiter = createLimiter({
  windowMs: 60 * 60_000,
  max: 3,
  prefix: "email",
});

function createLimiter(opts: RateLimitOptions) {
  if (redis) {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(opts.max, `${opts.windowMs} ms`),
      prefix: opts.prefix,
      analytics: false,
    });
    return async (identifier: string): Promise<RateLimitResult> => {
      const r = await limiter.limit(identifier);
      return {
        success: r.success,
        limit: r.limit,
        remaining: r.remaining,
        reset: r.reset,
      };
    };
  }

  return async (identifier: string): Promise<RateLimitResult> => {
    const key = `${opts.prefix}:${identifier}`;
    const now = Date.now();
    const entry = memoryStore.get(key);
    if (!entry || entry.resetAt <= now) {
      memoryStore.set(key, { count: 1, resetAt: now + opts.windowMs });
      return {
        success: true,
        limit: opts.max,
        remaining: opts.max - 1,
        reset: now + opts.windowMs,
      };
    }
    entry.count += 1;
    const success = entry.count <= opts.max;
    return {
      success,
      limit: opts.max,
      remaining: Math.max(0, opts.max - entry.count),
      reset: entry.resetAt,
    };
  };
}

/**
 * IP 기반 rate limit (Vercel은 x-forwarded-for 헤더 사용)
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
