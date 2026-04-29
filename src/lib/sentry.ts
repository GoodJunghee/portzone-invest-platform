/**
 * Sentry 초기화 (옵션, NEXT_PUBLIC_SENTRY_DSN 설정 시 활성화)
 *
 * Vercel 환경변수에 NEXT_PUBLIC_SENTRY_DSN 등록 시 자동 활성화.
 * 미설정 시 모든 호출은 no-op (에러 발생 안 함).
 */
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

let initialized = false;

export function initSentry() {
  if (initialized || !SENTRY_DSN) return;
  initialized = true;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
}

/**
 * 에러 캡처 — Sentry 미설정 시 console.error로 fallback
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("[error]", error, context);
  }
}

initSentry();
