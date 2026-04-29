import { prisma } from "./db";

/**
 * MRR 계산 (Monthly Recurring Revenue)
 * - MONTHLY 구독: priceKrw 그대로
 * - YEARLY 구독: priceKrw / 12
 */
export async function calculateMRR(): Promise<number> {
  const active = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { priceKrw: true, billingType: true },
  });
  let mrr = 0;
  for (const s of active) {
    if (s.billingType === "YEARLY") mrr += Math.round(s.priceKrw / 12);
    else mrr += s.priceKrw;
  }
  return mrr;
}

export async function getStats() {
  const now = new Date();
  const last7 = new Date(now);
  last7.setDate(last7.getDate() - 7);
  const last30 = new Date(now);
  last30.setDate(last30.getDate() - 30);

  const [
    totalUsers,
    newUsers7d,
    activeSubs,
    pendingSubs,
    cancelledSubs,
    totalReports,
    notifSent,
    notifQueued,
    notifFailed,
    mrr,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last7 } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "PENDING" } }),
    prisma.subscription.count({ where: { status: "CANCELLED" } }),
    prisma.report.count(),
    prisma.notificationLog.count({
      where: { status: "SENT", createdAt: { gte: last30 } },
    }),
    prisma.notificationLog.count({ where: { status: "QUEUED" } }),
    prisma.notificationLog.count({ where: { status: "FAILED" } }),
    calculateMRR(),
  ]);

  return {
    totalUsers,
    newUsers7d,
    activeSubs,
    pendingSubs,
    cancelledSubs,
    totalReports,
    notifSent,
    notifQueued,
    notifFailed,
    mrr,
    arr: mrr * 12,
  };
}
