import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculatePrice } from "@/lib/pricing";
import { previewCoupon, consumeCoupon } from "@/lib/coupon";
import { confirmReferralOnFirstPayment } from "@/lib/referral";
import { captureError } from "@/lib/sentry";
import { apiLimiter } from "@/lib/rate-limit";

const Schema = z.object({
  category: z.enum(["DAYTRADE", "SWING", "LONGTERM", "ALLINONE"]),
  markets: z
    .array(
      z.enum([
        "KOSPI",
        "KOSDAQ",
        "NASDAQ",
        "NYSE",
        "BINANCE",
        "BYBIT",
        "UPBIT",
        "BITHUMB",
      ])
    )
    .min(1)
    .max(8),
  billingType: z.enum(["MONTHLY", "YEARLY"]),
  priceKrw: z.number().int().min(0),
  couponCode: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인 필요" }, { status: 401 });
  }
  const rl = await apiLimiter(session.userId);
  if (!rl.success) {
    return NextResponse.json({ message: "잠시 후 다시 시도" }, { status: 429 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }
    const { category, markets, billingType, priceKrw, couponCode } = parsed.data;

    // 서버 측 가격 재검증
    const recalc = calculatePrice(category, markets, billingType);
    if (recalc.unavailable) {
      return NextResponse.json({ message: recalc.unavailable }, { status: 400 });
    }
    if (recalc.finalPrice !== priceKrw) {
      return NextResponse.json(
        { message: "가격 검증 실패", expected: recalc.finalPrice },
        { status: 400 }
      );
    }

    // 쿠폰 검증 + 적용 (옵션)
    let discountKrw = 0;
    let extraMonths = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const cp = await previewCoupon(session.userId, couponCode, priceKrw);
      if (!cp.success) {
        return NextResponse.json(
          { message: cp.message ?? "쿠폰 적용 실패" },
          { status: 400 }
        );
      }
      discountKrw = cp.discountKrw;
      extraMonths = cp.freeMonths;
      couponId = cp.couponId ?? null;
    }

    const finalPaymentKrw = Math.max(0, priceKrw - discountKrw);

    const now = new Date();
    const endDate = new Date(now);
    if (billingType === "YEARLY") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    if (extraMonths > 0) {
      endDate.setMonth(endDate.getMonth() + extraMonths);
    }

    // PG 미연동 — PENDING으로 저장 (이후 결제 완료 콜백에서 ACTIVE 전환)
    const sub = await prisma.subscription.create({
      data: {
        userId: session.userId,
        category,
        markets: markets.join(","),
        billingType,
        priceKrw: finalPaymentKrw,
        status: "PENDING",
        startDate: now,
        endDate,
        appliedCouponId: couponId,
      },
    });

    if (couponId) {
      await consumeCoupon(couponId, sub.id);
    }

    return NextResponse.json({
      ok: true,
      subscriptionId: sub.id,
      finalPriceKrw: finalPaymentKrw,
      discountKrw,
      extraMonths,
    });
  } catch (err) {
    captureError(err, { route: "subscriptions" });
    return NextResponse.json({ message: "처리 실패" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }
  const items = await prisma.subscription.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

/**
 * 구독을 ACTIVE로 전환할 때 사용 (실제 결제 완료 시점)
 * 현재는 PG 미연동이므로 외부 호출 안 됨 — 추후 연동 시 사용.
 */
export async function PATCH(req: Request) {
  void confirmReferralOnFirstPayment; // 참조 유지 (연동 시 사용)
  return NextResponse.json({ message: "PG 연동 후 활성화됩니다" }, { status: 501 });
}
