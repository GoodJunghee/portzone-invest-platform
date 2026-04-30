import { prisma } from "./db";
import { generateToken } from "./tokens";

/**
 * 리퍼럴 보상 정책
 * - 피추천인 가입 시 → 양쪽에 1개월 무료 쿠폰(`FREE_MONTH 1`) 발급
 * - 쿠폰 유효기간: 90일
 * - 피추천인이 첫 결제(또는 trial 후 ACTIVE 전환) 시 referrerReward.status = CONFIRMED
 *   (취소 등 부정 방지: 첫 결제 전엔 쿠폰을 사용 못 하도록 status=PENDING으로 둠)
 */

const COUPON_TTL_DAYS = 90;
const COUPON_FREE_MONTHS = 1;

export async function issueReferralRewards(
  referrerId: string,
  referredUserId: string
) {
  // 중복 방지
  const exists = await prisma.referralReward.findUnique({
    where: { referrerId_referredId: { referrerId, referredId: referredUserId } },
  });
  if (exists) return null;

  const expiresAt = new Date(
    Date.now() + COUPON_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const referrerCoupon = await prisma.coupon.create({
    data: {
      userId: referrerId,
      code: `REF-${generateToken(6).slice(0, 8).toUpperCase()}`,
      type: "FREE_MONTH",
      valueInt: COUPON_FREE_MONTHS,
      description: `친구 초대 보상 — ${COUPON_FREE_MONTHS}개월 무료`,
      source: "REFERRAL_REFERRER",
      expiresAt,
    },
  });

  const referredCoupon = await prisma.coupon.create({
    data: {
      userId: referredUserId,
      code: `WEL-${generateToken(6).slice(0, 8).toUpperCase()}`,
      type: "FREE_MONTH",
      valueInt: COUPON_FREE_MONTHS,
      description: `추천 가입 보상 — ${COUPON_FREE_MONTHS}개월 무료`,
      source: "REFERRAL_REFERRED",
      expiresAt,
    },
  });

  await prisma.referralReward.create({
    data: {
      referrerId,
      referredId: referredUserId,
      referrerCouponId: referrerCoupon.id,
      referredCouponId: referredCoupon.id,
    },
  });

  return { referrerCoupon, referredCoupon };
}

export async function getReferralStats(userId: string) {
  const [totalReferred, confirmed, activeCoupons, totalRewardCoupons] =
    await Promise.all([
      prisma.user.count({ where: { referredById: userId } }),
      prisma.referralReward.count({
        where: { referrerId: userId, status: "CONFIRMED" },
      }),
      prisma.coupon.count({
        where: {
          userId,
          source: "REFERRAL_REFERRER",
          status: "ACTIVE",
        },
      }),
      prisma.coupon.count({
        where: { userId, source: "REFERRAL_REFERRER" },
      }),
    ]);

  return {
    totalReferred,
    confirmed,
    activeCoupons,
    totalRewardCoupons,
  };
}

/**
 * 피추천인이 첫 정식 결제(ACTIVE 전환) 시 호출:
 * referral 보상을 CONFIRMED로 표시
 */
export async function confirmReferralOnFirstPayment(referredUserId: string) {
  await prisma.referralReward.updateMany({
    where: {
      referredId: referredUserId,
      status: "ISSUED",
    },
    data: { status: "CONFIRMED" },
  });
}
