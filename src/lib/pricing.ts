import { CategoryId, MarketId } from "./constants";

/**
 * 가격 정책
 * - 시장 1개당 기본 단가
 * - 시장 다중 선택 할인 (3~4개 10%, 5~7개 15%, 8개 20%)
 * - 연간 결제: 월 요금 × 10 (2개월 무료)
 * - 올인원: (단타+스윙+장타) × 0.65 (35% 묶음 할인)
 * - 장타는 연간 전용
 */

export const BASE_PRICE = {
  DAYTRADE: 5000,    // 시장 1개당 월 단가 (원)
  SWING: 2000,       // 시장 1개당 월 단가 (원)
  LONGTERM_YEARLY: 10000, // 시장 1개당 연 단가 (원, 연간 전용)
} as const;

export const ALLINONE_BUNDLE_RATE = 0.65; // 35% 묶음 할인
export const YEARLY_MONTHS = 10;          // 연간 결제 시 곱하는 개월 수 (2개월 무료)

export type BillingType = "MONTHLY" | "YEARLY";

export function getMultiMarketDiscount(count: number): number {
  if (count >= 8) return 0.20;
  if (count >= 5) return 0.15;
  if (count >= 3) return 0.10;
  return 0;
}

export interface PriceLine {
  label: string;
  amount: number;          // 양수=가산 / 음수=할인
  type: "BASE" | "DISCOUNT" | "INFO";
}

export interface PriceBreakdown {
  category: CategoryId;
  markets: MarketId[];
  billingType: BillingType;
  marketCount: number;
  multiDiscountRate: number;     // 다중선택 할인율 0~0.2
  baseMonthly: number;           // 단가표 기준 월 합계 (할인 전)
  finalMonthly: number;          // 다중선택 할인 적용 후 월 환산
  finalPrice: number;            // 최종 결제 금액 (월간 또는 연간)
  lines: PriceLine[];            // 견적서 항목 (UI 출력용)
  unavailable?: string;
}

/**
 * 카테고리별 시장 1개당 월 단가 (장타는 연 단가 ÷ 12로 환산)
 */
function unitMonthly(category: CategoryId): number {
  switch (category) {
    case "DAYTRADE":
      return BASE_PRICE.DAYTRADE;
    case "SWING":
      return BASE_PRICE.SWING;
    case "LONGTERM":
      return Math.round(BASE_PRICE.LONGTERM_YEARLY / 12);
    case "ALLINONE":
      // 단타+스윙+장타(월환산) 합 × 0.65
      return Math.round(
        (BASE_PRICE.DAYTRADE +
          BASE_PRICE.SWING +
          BASE_PRICE.LONGTERM_YEARLY / 12) *
          ALLINONE_BUNDLE_RATE
      );
  }
}

function categoryLabel(category: CategoryId) {
  switch (category) {
    case "DAYTRADE":
      return "단타";
    case "SWING":
      return "스윙";
    case "LONGTERM":
      return "장타";
    case "ALLINONE":
      return "올인원";
  }
}

export function calculatePrice(
  category: CategoryId,
  markets: MarketId[],
  billing: BillingType
): PriceBreakdown {
  const lines: PriceLine[] = [];
  const marketCount = markets.length;

  if (marketCount === 0) {
    return {
      category,
      markets,
      billingType: billing,
      marketCount: 0,
      multiDiscountRate: 0,
      baseMonthly: 0,
      finalMonthly: 0,
      finalPrice: 0,
      lines: [],
      unavailable: "시장을 1개 이상 선택해주세요",
    };
  }

  if (category === "LONGTERM" && billing === "MONTHLY") {
    return {
      category,
      markets,
      billingType: billing,
      marketCount,
      multiDiscountRate: 0,
      baseMonthly: 0,
      finalMonthly: 0,
      finalPrice: 0,
      lines: [],
      unavailable: "장타는 연간 결제만 지원됩니다",
    };
  }

  // 단가
  const unit = unitMonthly(category);
  const baseMonthly = unit * marketCount;

  // 다중선택 할인
  const discountRate = getMultiMarketDiscount(marketCount);
  const discountedMonthly = Math.round(baseMonthly * (1 - discountRate));
  const multiDiscountAmount = baseMonthly - discountedMonthly;

  // 견적 라인 구성
  if (category === "ALLINONE") {
    lines.push({
      label: `올인원 묶음 단가 (${marketCount}개 시장 × ${unit.toLocaleString()}원/월)`,
      amount: baseMonthly,
      type: "BASE",
    });
    lines.push({
      label: "올인원 묶음 할인 35% 적용가",
      amount: 0,
      type: "INFO",
    });
  } else {
    lines.push({
      label: `${categoryLabel(category)} 단가 (${marketCount}개 시장 × ${unit.toLocaleString()}원/월)`,
      amount: baseMonthly,
      type: "BASE",
    });
  }

  if (discountRate > 0) {
    lines.push({
      label: `시장 다중선택 할인 ${Math.round(discountRate * 100)}%`,
      amount: -multiDiscountAmount,
      type: "DISCOUNT",
    });
  }

  let finalPrice = discountedMonthly;
  if (billing === "YEARLY") {
    const yearlyFull = discountedMonthly * 12;
    const yearlyFinal = discountedMonthly * YEARLY_MONTHS;
    const yearlyDiscount = yearlyFull - yearlyFinal;

    lines.push({
      label: "연간 환산 (월 × 12)",
      amount: yearlyFull,
      type: "INFO",
    });
    lines.push({
      label: "연간 결제 할인 (2개월 무료)",
      amount: -yearlyDiscount,
      type: "DISCOUNT",
    });
    finalPrice = yearlyFinal;
  }

  return {
    category,
    markets,
    billingType: billing,
    marketCount,
    multiDiscountRate: discountRate,
    baseMonthly,
    finalMonthly: discountedMonthly,
    finalPrice,
    lines,
  };
}

export function formatKRW(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return sign + new Intl.NumberFormat("ko-KR").format(Math.abs(amount)) + "원";
}
