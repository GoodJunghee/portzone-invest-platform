/**
 * Sentry 헬퍼
 *
 * Sentry SDK 초기화는 Wizard가 만든 다음 파일들이 자동으로 처리:
 * - sentry.server.config.ts
 * - sentry.edge.config.ts
 * - src/instrumentation.ts
 * - src/instrumentation-client.ts
 *
 * 이 파일은 단순히 captureException 호출을 일관된 인터페이스로 노출.
 */
import * as Sentry from "@sentry/nextjs";

export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Sentry가 어떤 이유로 실패해도 앱이 죽지 않도록
  }
  // 운영 환경에서도 콘솔에 한 줄 남겨 디버깅 편의 확보
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", error, context);
  }
}
