import { prisma } from "./db";
import { ALL_MARKETS } from "./constants";

/**
 * 무료 체험 정책
 * - 신규 가입자에게 자동 부여 (단타 + 모든 시장 미리보기)
 * - 기간: 7일
 * - 1인 1회 (User.trialUsedAt이 null인 경우만)
 * - 결제 의무 없음
 */
export const TRIAL_DURATION_DAYS = 7;

export async function grantTrialIfEligible(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialUsedAt: true, deletedAt: true },
  });
  if (!user || user.deletedAt) return null;
  if (user.trialUsedAt) return null; // 이미 사용

  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const allMarketIds = ALL_MARKETS.map((m) => m.id).join(",");

  const [sub] = await prisma.$transaction([
    prisma.subscription.create({
      data: {
        userId,
        category: "DAYTRADE", // 가장 활발한 카테고리로 시작
        markets: allMarketIds,
        billingType: "TRIAL",
        priceKrw: 0,
        status: "TRIAL",
        startDate: now,
        endDate: trialEnd,
        trialEndsAt: trialEnd,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { trialUsedAt: now },
    }),
  ]);

  return sub;
}

/**
 * 만료된 trial을 정리 (cron 용)
 */
export async function expireTrials() {
  const now = new Date();
  const result = await prisma.subscription.updateMany({
    where: {
      status: "TRIAL",
      OR: [
        { trialEndsAt: { lte: now } },
        { endDate: { lte: now } },
      ],
    },
    data: { status: "EXPIRED" },
  });
  return result.count;
}
