import { prisma } from "./db";

/**
 * 쿠폰 적용 결과
 */
export interface CouponApplyResult {
  success: boolean;
  message?: string;
  finalPriceKrw: number;
  discountKrw: number;
  freeMonths: number; // FREE_MONTH 쿠폰일 때 추가 개월수
  couponId?: string;
}

/**
 * 쿠폰 적용 (가격 미리보기용 — 실제 차감은 결제 확정 시점)
 */
export async function previewCoupon(
  userId: string,
  code: string,
  basePriceKrw: number
): Promise<CouponApplyResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || coupon.userId !== userId) {
    return base("유효하지 않은 쿠폰", basePriceKrw);
  }
  if (coupon.status !== "ACTIVE") {
    return base("이미 사용되었거나 만료된 쿠폰", basePriceKrw);
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return base("만료된 쿠폰", basePriceKrw);
  }

  switch (coupon.type) {
    case "FREE_MONTH":
      return {
        success: true,
        finalPriceKrw: basePriceKrw, // 결제는 동일, 사용 기간이 늘어남
        discountKrw: 0,
        freeMonths: coupon.valueInt,
        couponId: coupon.id,
      };
    case "PERCENT": {
      const pct = Math.max(0, Math.min(100, coupon.valueInt));
      const discount = Math.round((basePriceKrw * pct) / 100);
      return {
        success: true,
        finalPriceKrw: basePriceKrw - discount,
        discountKrw: discount,
        freeMonths: 0,
        couponId: coupon.id,
      };
    }
    case "FIXED_AMOUNT": {
      const discount = Math.min(basePriceKrw, coupon.valueInt);
      return {
        success: true,
        finalPriceKrw: basePriceKrw - discount,
        discountKrw: discount,
        freeMonths: 0,
        couponId: coupon.id,
      };
    }
    default:
      return base("지원하지 않는 쿠폰 유형", basePriceKrw);
  }
}

function base(msg: string, base: number): CouponApplyResult {
  return {
    success: false,
    message: msg,
    finalPriceKrw: base,
    discountKrw: 0,
    freeMonths: 0,
  };
}

/**
 * 쿠폰을 실제 사용 처리 (구독 생성 트랜잭션 안에서 호출)
 */
export async function consumeCoupon(couponId: string, subscriptionId: string) {
  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      status: "USED",
      usedAt: new Date(),
      appliedSubId: subscriptionId,
    },
  });
}

/**
 * 만료된 쿠폰 정리 (cron 용)
 */
export async function expireCoupons() {
  const result = await prisma.coupon.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: new Date() },
    },
    data: { status: "EXPIRED" },
  });
  return result.count;
}
