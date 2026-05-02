// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://7ec2207bbb0de7573a18d8bed13e559a@o4511304335687680.ingest.us.sentry.io/4511304340996096",

  // 운영에선 트랜잭션 샘플링 비율 낮춰서 무료 한도 보호
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // PII 전송 비활성화 (개인정보처리방침 준수)
  sendDefaultPii: false,
});
