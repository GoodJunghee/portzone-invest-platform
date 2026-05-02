"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS, CATEGORIES, MARKETS, MarketId } from "@/lib/constants";
import { BillingType, calculatePrice, formatKRW } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Check, Info } from "lucide-react";
import { LoginModal } from "./LoginModal";

type Category = (typeof CATEGORIES)[number]["id"];

interface CouponPreview {
  finalPriceKrw: number;
  discountKrw: number;
  freeMonths: number;
  message?: string;
  ok: boolean;
}

type PendingAction = "SUBSCRIBE" | "COUPON" | null;

export function PricingCalculator({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("DAYTRADE");
  const [billing, setBilling] = useState<BillingType>("MONTHLY");
  const [markets, setMarkets] = useState<MarketId[]>(["KOSPI"]);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [authed, setAuthed] = useState(isLoggedIn);

  const breakdown = useMemo(
    () => calculatePrice(category, markets, billing),
    [category, markets, billing]
  );

  // 카테고리/시장/주기가 변경되면 적용된 쿠폰 미리보기 자동 해제 (가격이 바뀌면 재계산 필요)
  useEffect(() => {
    setCouponPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, billing, markets.join(",")]);

  const toggleMarket = (id: MarketId) => {
    setMarkets((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => setMarkets(ALL_MARKETS.map((m) => m.id) as MarketId[]);
  const clearAll = () => setMarkets([]);

  function openLoginModal(action: PendingAction, message: string) {
    setPendingAction(action);
    setLoginModalMessage(message);
    setLoginModalOpen(true);
  }

  async function applyCoupon() {
    if (!couponCode.trim() || breakdown.finalPrice <= 0) return;
    if (!authed) {
      openLoginModal("COUPON", "쿠폰 사용을 위해 로그인이 필요합니다.");
      return;
    }
    setCouponLoading(true);
    const res = await fetch("/api/coupons/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponCode.trim(),
        basePriceKrw: breakdown.finalPrice,
      }),
    });
    const data = await res.json();
    setCouponLoading(false);
    if (res.status === 401) {
      // 세션 만료 등의 케이스 — 다시 로그인 모달
      setAuthed(false);
      openLoginModal("COUPON", "세션이 만료되었습니다. 다시 로그인해주세요.");
      return;
    }
    if (!res.ok) {
      setCouponPreview({
        ok: false,
        message: data.message ?? "쿠폰 적용 실패",
        finalPriceKrw: breakdown.finalPrice,
        discountKrw: 0,
        freeMonths: 0,
      });
      return;
    }
    setCouponPreview({
      ok: true,
      finalPriceKrw: data.finalPriceKrw,
      discountKrw: data.discountKrw,
      freeMonths: data.freeMonths,
    });
  }

  function clearCoupon() {
    setCouponCode("");
    setCouponPreview(null);
  }

  async function performSubscribe() {
    if (breakdown.unavailable || markets.length === 0) return;
    setSubmitting(true);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        markets,
        billingType: billing,
        priceKrw: breakdown.finalPrice,
        couponCode: couponPreview?.ok ? couponCode.trim() : undefined,
      }),
    });
    setSubmitting(false);
    if (res.status === 401) {
      setAuthed(false);
      openLoginModal("SUBSCRIBE", "구독 신청을 위해 로그인이 필요합니다.");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message ?? "구독 신청 실패");
      return;
    }
    router.push("/checkout/success");
  }

  function onSubscribe() {
    if (breakdown.unavailable || markets.length === 0) return;
    if (!authed) {
      openLoginModal(
        "SUBSCRIBE",
        "구독 신청을 위해 로그인이 필요합니다. 로그인 후 자동으로 진행됩니다."
      );
      return;
    }
    void performSubscribe();
  }

  function onLoginSuccess() {
    setAuthed(true);
    // 모달 닫힌 후 대기 중이던 액션 자동 재실행
    const action = pendingAction;
    setPendingAction(null);
    if (action === "SUBSCRIBE") {
      void performSubscribe();
    } else if (action === "COUPON") {
      void applyCoupon();
    }
  }

  const finalAfterCoupon = couponPreview?.ok
    ? couponPreview.finalPriceKrw
    : breakdown.finalPrice;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
      {/* LEFT: 선택 영역 */}
      <div className="space-y-6">
        {/* 카테고리 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900">1. 카테고리 선택</h3>
            <span className="text-xs text-navy-500">단타 / 스윙 / 장타 / 올인원</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategory(c.id);
                  if (c.id === "LONGTERM") setBilling("YEARLY");
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  category === c.id
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-navy-200 bg-white text-navy-900 hover:border-navy-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">{c.name}</span>
                  {category === c.id && <Check className="h-4 w-4" />}
                </div>
                <div
                  className={cn(
                    "mt-1 text-xs",
                    category === c.id ? "text-navy-100" : "text-navy-500"
                  )}
                >
                  {c.holdPeriod}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 시장 다중선택 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900">
              2. 시장 선택{" "}
              <span className="text-sm text-navy-500">(다중 선택 가능)</span>
            </h3>
            <div className="flex gap-2 text-xs">
              <button
                onClick={selectAll}
                className="rounded-full border border-navy-200 px-3 py-1 hover:bg-navy-50"
              >
                전체 선택
              </button>
              <button
                onClick={clearAll}
                className="rounded-full border border-navy-200 px-3 py-1 hover:bg-navy-50"
              >
                전체 해제
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
              주식
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {MARKETS.STOCK.map((m) => (
                <MarketChip
                  key={m.id}
                  selected={markets.includes(m.id)}
                  onClick={() => toggleMarket(m.id)}
                  name={m.name}
                  region={m.region}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
              코인
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {MARKETS.CRYPTO.map((m) => (
                <MarketChip
                  key={m.id}
                  selected={markets.includes(m.id)}
                  onClick={() => toggleMarket(m.id)}
                  name={m.name}
                  region={m.region}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-navy-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy-500" />
              <div className="text-xs text-navy-600">
                <span className="font-semibold text-navy-900">
                  시장 다중선택 할인:
                </span>{" "}
                3~4개 10% / 5~7개 15% / 8개 전체 20% · 현재 선택 {markets.length}개
              </div>
            </div>
          </div>
        </div>

        {/* 결제 주기 */}
        <div className="card">
          <h3 className="text-base font-bold text-navy-900">3. 결제 주기</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              disabled={category === "LONGTERM"}
              onClick={() => setBilling("MONTHLY")}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                billing === "MONTHLY" && category !== "LONGTERM"
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-navy-200 bg-white",
                category === "LONGTERM" && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className="text-sm font-bold">월간</div>
              <div
                className={cn(
                  "mt-1 text-xs",
                  billing === "MONTHLY" && category !== "LONGTERM"
                    ? "text-navy-100"
                    : "text-navy-500"
                )}
              >
                매월 결제
              </div>
            </button>
            <button
              onClick={() => setBilling("YEARLY")}
              className={cn(
                "relative rounded-xl border p-4 text-left transition",
                billing === "YEARLY"
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-navy-200 bg-white"
              )}
            >
              <div className="text-sm font-bold">연간</div>
              <div
                className={cn(
                  "mt-1 text-xs",
                  billing === "YEARLY" ? "text-navy-100" : "text-navy-500"
                )}
              >
                2개월 무료 (월 요금 × 10)
              </div>
              <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                추천
              </span>
            </button>
          </div>
          {category === "LONGTERM" && (
            <p className="mt-3 text-xs text-navy-500">
              * 장타 카테고리는 연간 결제만 지원됩니다.
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: 가격 요약 */}
      <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="card border-2 border-navy-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              실시간 견적
            </span>
            <span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-medium text-white">
              {CATEGORIES.find((c) => c.id === category)?.name}
            </span>
          </div>

          <div className="mt-6">
            <div className="text-xs text-navy-500">선택한 시장</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {markets.length === 0 ? (
                <span className="text-sm text-navy-400">없음</span>
              ) : (
                markets.map((id) => {
                  const m = ALL_MARKETS.find((x) => x.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-800"
                    >
                      {m?.name}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          <div className="my-6 border-t border-navy-100" />

          {breakdown.unavailable ? (
            <div className="rounded-xl bg-navy-50 p-4 text-sm text-navy-700">
              {breakdown.unavailable}
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {breakdown.lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between text-sm",
                      line.type === "INFO" && "text-navy-500"
                    )}
                  >
                    <span
                      className={cn(
                        line.type === "DISCOUNT"
                          ? "text-mint-600"
                          : line.type === "INFO"
                          ? "text-navy-500"
                          : "text-navy-700"
                      )}
                    >
                      {line.label}
                    </span>
                    {line.amount !== 0 && (
                      <span
                        className={cn(
                          "font-semibold",
                          line.type === "DISCOUNT"
                            ? "text-mint-600"
                            : "text-navy-900"
                        )}
                      >
                        {formatKRW(line.amount)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* 쿠폰 입력 */}
              <div className="my-4 border-t border-dashed border-navy-200 pt-4">
                <div className="text-xs font-semibold text-navy-700">쿠폰 코드</div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponPreview(null);
                    }}
                    placeholder="REF-XXXXXXXX"
                    className="input !py-2 text-xs"
                    maxLength={40}
                  />
                  {couponPreview?.ok ? (
                    <button
                      onClick={clearCoupon}
                      className="btn-secondary !py-2 !px-3 text-xs"
                    >
                      해제
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="btn-primary !py-2 !px-3 text-xs"
                    >
                      {couponLoading ? "확인..." : "적용"}
                    </button>
                  )}
                </div>
                {couponPreview && !couponPreview.ok && (
                  <div className="mt-2 text-[11px] text-red-600">
                    {couponPreview.message}
                  </div>
                )}
                {couponPreview?.ok && (
                  <div className="mt-2 rounded-lg bg-mint-500/10 p-2 text-[11px] text-mint-600">
                    ✓ 쿠폰 적용
                    {couponPreview.discountKrw > 0 &&
                      ` · -${formatKRW(couponPreview.discountKrw)}`}
                    {couponPreview.freeMonths > 0 &&
                      ` · +${couponPreview.freeMonths}개월 무료`}
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-navy-500">
                    최종 결제 금액 ({billing === "YEARLY" ? "연" : "월"})
                  </div>
                  <div className="mt-1 text-3xl font-black text-navy-900">
                    {formatKRW(finalAfterCoupon)}
                  </div>
                </div>
                {billing === "YEARLY" && breakdown.finalMonthly > 0 && (
                  <div className="text-right text-xs text-navy-500">
                    월 환산
                    <br />
                    <span className="font-semibold text-navy-700">
                      {formatKRW(breakdown.finalMonthly)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            onClick={onSubscribe}
            disabled={
              !!breakdown.unavailable || markets.length === 0 || submitting
            }
            className={cn(
              "mt-6 w-full",
              breakdown.unavailable || markets.length === 0
                ? "btn-secondary opacity-60 cursor-not-allowed"
                : "btn-primary"
            )}
          >
            {submitting
              ? "신청 중..."
              : markets.length === 0
              ? "시장을 선택하세요"
              : authed
              ? "이 구성으로 구독 신청"
              : "로그인 후 구독 신청"}
          </button>

          <div className="mt-4 text-[11px] leading-relaxed text-navy-500">
            결제는 정식 오픈 후 PG 연동 시 활성화됩니다.
            <br />
            현재는 가입 및 구독 정보 사전 등록이 가능합니다.
          </div>
        </div>

        <PriceTableSummary />
      </div>

      <LoginModal
        open={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={onLoginSuccess}
        message={loginModalMessage ?? undefined}
      />
    </div>
  );
}

function MarketChip({
  selected,
  onClick,
  name,
  region,
}: {
  selected: boolean;
  onClick: () => void;
  name: string;
  region: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-xl border p-3 text-left transition",
        selected
          ? "border-navy-900 bg-navy-900 text-white"
          : "border-navy-200 bg-white text-navy-900 hover:border-navy-400"
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-semibold">{name}</span>
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>
      <span
        className={cn(
          "mt-0.5 text-[11px]",
          selected ? "text-navy-200" : "text-navy-500"
        )}
      >
        {region}
      </span>
    </button>
  );
}

function PriceTableSummary() {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 text-xs text-navy-600">
      <div className="font-semibold text-navy-900">단가표 (시장 1개당)</div>
      <ul className="mt-3 space-y-1.5">
        <li className="flex justify-between">
          <span>단타</span>
          <span className="font-medium text-navy-900">월 5,000원</span>
        </li>
        <li className="flex justify-between">
          <span>스윙</span>
          <span className="font-medium text-navy-900">월 2,000원</span>
        </li>
        <li className="flex justify-between">
          <span>장타</span>
          <span className="font-medium text-navy-900">연 10,000원</span>
        </li>
        <li className="flex justify-between border-t border-navy-100 pt-2">
          <span>올인원</span>
          <span className="font-medium text-navy-900">묶음 35% 할인</span>
        </li>
      </ul>
      <div className="mt-3 border-t border-navy-100 pt-3 text-[11px] leading-relaxed">
        다중선택 할인: 3~4개 10% · 5~7개 15% · 8개 전체 20%
        <br />
        연간 결제: 월 × 10 (2개월 무료)
      </div>
    </div>
  );
}
