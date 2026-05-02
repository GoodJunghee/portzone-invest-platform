import { NextResponse } from "next/server";
import { expireTrials } from "@/lib/trial";
import { expireCoupons } from "@/lib/coupon";
import { captureError } from "@/lib/sentry";

/**
 * 만료 처리 cron
 * - 만료된 trial 구독 → EXPIRED
 * - 만료된 쿠폰 → EXPIRED
 *
 * Vercel Cron이 호출 (Bearer 헤더 또는 ?key=)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const secret = process.env.CRON_SECRET ?? "";
  const provided = bearer || key;
  // 운영에선 CRON_SECRET 미설정 시 무조건 차단 (cron 라우트 공개 방지)
  if (process.env.NODE_ENV === "production" && !secret) {
    return NextResponse.json({ message: "cron secret not configured" }, { status: 503 });
  }
  if (secret && provided !== secret) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const [trials, coupons] = await Promise.all([expireTrials(), expireCoupons()]);
    return NextResponse.json({ ok: true, expired: { trials, coupons } });
  } catch (err) {
    captureError(err, { route: "cron/expire" });
    return NextResponse.json({ message: "expire failed" }, { status: 500 });
  }
}
