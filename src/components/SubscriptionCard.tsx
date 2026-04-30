"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";
import { formatKRW } from "@/lib/pricing";

interface Sub {
  id: string;
  category: string;
  markets: string;
  billingType: string;
  priceKrw: number;
  status: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  trialEndsAt?: Date | string | null;
}

export function SubscriptionCard({ sub }: { sub: Sub }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundResult, setRefundResult] = useState<string | null>(null);

  const cat = CATEGORIES.find((c) => c.id === sub.category);
  const marketIds = sub.markets.split(",").filter(Boolean);
  const isTrial = sub.status === "TRIAL" || sub.billingType === "TRIAL";
  const refundableStatuses = ["ACTIVE", "PENDING"];

  async function cancel() {
    if (!confirm("구독을 해지하시겠습니까? 다음 결제일부터 갱신되지 않습니다.")) return;
    setBusy(true);
    const res = await fetch(`/api/subscriptions/${sub.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("해지 실패");
  }

  async function requestRefund() {
    if (refundReason.trim().length < 5) {
      alert("환불 사유를 5자 이상 입력해주세요");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/subscriptions/${sub.id}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: refundReason.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setRefundResult(
        `환불 요청 등록됨. 검토 후 ${formatKRW(
          data.calc.refundAmountKrw
        )} 환불 예정 (잔여 ${data.calc.remainingDays}일).`
      );
      router.refresh();
    } else {
      setRefundResult(data.message ?? "환불 요청 실패");
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold text-navy-900">
            {cat?.name ?? sub.category}
          </div>
          {isTrial && (
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
              TRIAL
            </span>
          )}
        </div>
        <span className={statusClass(sub.status)}>{sub.status}</span>
      </div>
      <div className="mt-2 text-xs text-navy-500">
        {isTrial
          ? "7일 무료 체험"
          : `${sub.billingType === "YEARLY" ? "연간" : "월간"} · ${formatKRW(sub.priceKrw)}`}
        {sub.endDate && (
          <span className="ml-2 text-navy-400">
            ~ {new Date(sub.endDate).toLocaleDateString("ko-KR")}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {marketIds.map((id) => {
          const m = ALL_MARKETS.find((x) => x.id === id);
          return (
            <span
              key={id}
              className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-800"
            >
              {m?.name ?? id}
            </span>
          );
        })}
      </div>

      {(sub.status === "ACTIVE" ||
        sub.status === "PENDING" ||
        sub.status === "TRIAL") && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-navy-100 pt-4">
          <button
            onClick={cancel}
            disabled={busy}
            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            {busy ? "처리 중..." : "구독 해지"}
          </button>
          {refundableStatuses.includes(sub.status) && !isTrial && (
            <button
              onClick={() => setShowRefund((v) => !v)}
              className="text-xs font-semibold text-navy-700 hover:underline"
            >
              {showRefund ? "환불 요청 닫기" : "환불 요청"}
            </button>
          )}
        </div>
      )}

      {showRefund && (
        <div className="mt-4 rounded-xl bg-navy-50 p-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-navy-800">
              환불 사유 (5자 이상)
            </span>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              maxLength={500}
              className="input text-xs"
              placeholder="환불을 요청하는 사유를 입력해주세요"
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              onClick={requestRefund}
              disabled={busy}
              className="btn-primary !py-2 !px-3 text-xs"
            >
              {busy ? "요청 중..." : "환불 요청 제출"}
            </button>
          </div>
          {refundResult && (
            <div className="mt-3 rounded-lg bg-white p-3 text-xs text-navy-700">
              {refundResult}
            </div>
          )}
          <div className="mt-3 text-[11px] text-navy-500">
            환불 정책: 7일 이내 100% 환불, 이후 잔여일 일할 환불.
          </div>
        </div>
      )}
    </div>
  );
}

function statusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "rounded-full bg-mint-500 px-2.5 py-1 text-xs font-medium text-white";
    case "TRIAL":
      return "rounded-full bg-gold-500 px-2.5 py-1 text-xs font-medium text-navy-900";
    case "PENDING":
      return "rounded-full bg-navy-200 px-2.5 py-1 text-xs font-medium text-navy-700";
    case "CANCELLED":
    case "EXPIRED":
      return "rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-600";
    case "REFUNDED":
      return "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700";
    default:
      return "rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-700";
  }
}
