import { prisma } from "./db";
import { ALL_MARKETS, CATEGORIES } from "./constants";

/**
 * MRR 계산 (Monthly Recurring Revenue)
 * - MONTHLY 구독: priceKrw 그대로
 * - YEARLY 구독: priceKrw / 12
 * - TRIAL 제외
 */
export async function calculateMRR(): Promise<number> {
  const active = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { priceKrw: true, billingType: true },
  });
  let mrr = 0;
  for (const s of active) {
    if (s.billingType === "YEARLY") mrr += Math.round(s.priceKrw / 12);
    else if (s.billingType === "MONTHLY") mrr += s.priceKrw;
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
    trialSubs,
    totalReports,
    notifSent,
    notifQueued,
    notifFailed,
    activeCoupons,
    pendingRefunds,
    mrr,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: last7 }, deletedAt: null } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "PENDING" } }),
    prisma.subscription.count({ where: { status: "CANCELLED" } }),
    prisma.subscription.count({ where: { status: "TRIAL" } }),
    prisma.report.count(),
    prisma.notificationLog.count({
      where: { status: "SENT", createdAt: { gte: last30 } },
    }),
    prisma.notificationLog.count({ where: { status: "QUEUED" } }),
    prisma.notificationLog.count({ where: { status: "FAILED" } }),
    prisma.coupon.count({ where: { status: "ACTIVE" } }),
    prisma.refundRequest.count({ where: { status: "PENDING" } }),
    calculateMRR(),
  ]);

  return {
    totalUsers,
    newUsers7d,
    activeSubs,
    pendingSubs,
    cancelledSubs,
    trialSubs,
    totalReports,
    notifSent,
    notifQueued,
    notifFailed,
    activeCoupons,
    pendingRefunds,
    mrr,
    arr: mrr * 12,
  };
}

/**
 * 일별 신규 가입 추이 (지난 N일)
 */
export async function getSignupTrend(days = 30) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: start }, deletedAt: null },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(toDateKey(d), 0);
  }

  for (const u of users) {
    const key = toDateKey(u.createdAt);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

/**
 * 일별 알림 발송 추이 (지난 N일)
 */
export async function getNotificationTrend(days = 30) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const logs = await prisma.notificationLog.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true, status: true },
  });

  const buckets = new Map<string, { sent: number; queued: number; failed: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(toDateKey(d), { sent: 0, queued: 0, failed: 0 });
  }

  for (const l of logs) {
    const key = toDateKey(l.createdAt);
    const b = buckets.get(key);
    if (!b) continue;
    if (l.status === "SENT") b.sent += 1;
    else if (l.status === "QUEUED") b.queued += 1;
    else if (l.status === "FAILED") b.failed += 1;
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    ...v,
  }));
}

/**
 * MRR 히스토리 — 활성 구독 시작일 기준 누적
 *
 * 단순화: subscription.startDate부터 endDate 사이 매달 priceKrw/12 (yearly) 또는 priceKrw (monthly)가
 * 그 달 MRR에 더해진다고 가정.
 */
export async function getMrrTrend(months = 6) {
  const now = new Date();
  const subs = await prisma.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "CANCELLED", "EXPIRED", "REFUNDED"] },
      billingType: { in: ["MONTHLY", "YEARLY"] },
      startDate: { not: null },
    },
    select: {
      startDate: true,
      endDate: true,
      cancelledAt: true,
      refundedAt: true,
      priceKrw: true,
      billingType: true,
    },
  });

  const buckets: { month: string; mrr: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d;
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    let mrr = 0;
    for (const s of subs) {
      if (!s.startDate) continue;
      const effectiveEnd =
        s.refundedAt ?? s.cancelledAt ?? s.endDate ?? new Date(8640000000000000);
      if (s.startDate > monthEnd) continue;
      if (effectiveEnd < monthStart) continue;
      mrr += s.billingType === "YEARLY" ? Math.round(s.priceKrw / 12) : s.priceKrw;
    }
    buckets.push({ month: key, mrr });
  }
  return buckets;
}

/**
 * 카테고리별 활성 구독 분포
 */
export async function getCategoryDistribution() {
  const subs = await prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "TRIAL"] } },
    select: { category: true },
  });
  const counts = new Map<string, number>();
  for (const c of CATEGORIES) counts.set(c.id, 0);
  for (const s of subs) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => {
    const meta = CATEGORIES.find((c) => c.id === category);
    return { category, name: meta?.name ?? category, count };
  });
}

/**
 * 시장별 활성 구독 분포 (다중 선택 분해)
 */
export async function getMarketDistribution() {
  const subs = await prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "TRIAL"] } },
    select: { markets: true },
  });
  const counts = new Map<string, number>();
  for (const m of ALL_MARKETS) counts.set(m.id, 0);
  for (const s of subs) {
    for (const m of s.markets.split(",")) {
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).map(([market, count]) => {
    const meta = ALL_MARKETS.find((m) => m.id === market);
    return { market, name: meta?.name ?? market, count };
  });
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
