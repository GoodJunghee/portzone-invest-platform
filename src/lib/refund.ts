/**
 * 환불 일할 계산
 *
 * 정책:
 * - 월간 결제: 이용일 1일당 = 월요금 / 30 (기본 30일 정책)
 *   환불액 = 결제액 - (이용일수 × 일할요금) - 위약금
 * - 연간 결제: 이용일 1일당 = 연요금 / 365
 *   환불액 = 결제액 - (이용일수 × 일할요금)
 * - 7일 이내 해지: 100% 환불 (소비자 보호)
 * - Trial(체험): 환불 없음
 *
 * 위약금: 없음 (1차 정책. 추후 결제 처리수수료 등 차감 가능)
 */

export interface RefundCalc {
  refundable: boolean;
  reason?: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  perDayKrw: number;
  refundAmountKrw: number;
}

interface SubscriptionLike {
  billingType: string;       // MONTHLY | YEARLY | TRIAL
  status: string;            // ACTIVE | TRIAL | ...
  priceKrw: number;
  startDate: Date | null;
  endDate: Date | null;
}

export function calculateRefund(
  sub: SubscriptionLike,
  asOf: Date = new Date()
): RefundCalc {
  if (sub.billingType === "TRIAL" || sub.status === "TRIAL") {
    return zero("체험 구독은 환불 대상이 아닙니다");
  }
  if (!sub.startDate || !sub.endDate) {
    return zero("구독 시작/종료일이 설정되지 않았습니다");
  }
  if (sub.status === "REFUNDED") {
    return zero("이미 환불 처리된 구독입니다");
  }
  if (sub.status === "EXPIRED" || sub.status === "CANCELLED") {
    return zero("만료/해지된 구독은 환불할 수 없습니다");
  }

  const totalMs = sub.endDate.getTime() - sub.startDate.getTime();
  const totalDays = Math.max(1, Math.round(totalMs / (24 * 60 * 60 * 1000)));
  const usedMs = Math.max(0, asOf.getTime() - sub.startDate.getTime());
  const usedDays = Math.min(totalDays, Math.ceil(usedMs / (24 * 60 * 60 * 1000)));
  const remainingDays = Math.max(0, totalDays - usedDays);
  const perDayKrw = Math.floor(sub.priceKrw / totalDays);

  // 7일 이내 100% 환불
  if (usedDays <= 7) {
    return {
      refundable: true,
      totalDays,
      usedDays,
      remainingDays,
      perDayKrw,
      refundAmountKrw: sub.priceKrw,
    };
  }

  const refundAmount = Math.max(0, sub.priceKrw - usedDays * perDayKrw);
  return {
    refundable: refundAmount > 0,
    totalDays,
    usedDays,
    remainingDays,
    perDayKrw,
    refundAmountKrw: refundAmount,
    reason: refundAmount === 0 ? "잔여일이 없어 환불액이 0원입니다" : undefined,
  };
}

function zero(reason: string): RefundCalc {
  return {
    refundable: false,
    reason,
    totalDays: 0,
    usedDays: 0,
    remainingDays: 0,
    perDayKrw: 0,
    refundAmountKrw: 0,
  };
}
