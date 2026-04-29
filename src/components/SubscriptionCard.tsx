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
}

export function SubscriptionCard({ sub }: { sub: Sub }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const cat = CATEGORIES.find((c) => c.id === sub.category);
  const marketIds = sub.markets.split(",").filter(Boolean);

  async function cancel() {
    if (!confirm("구독을 해지하시겠습니까? 다음 결제일부터 갱신되지 않습니다.")) return;
    setBusy(true);
    const res = await fetch(`/api/subscriptions/${sub.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("해지 실패");
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-navy-900">
          {cat?.name ?? sub.category}
        </div>
        <span
          className={
            sub.status === "ACTIVE"
              ? "rounded-full bg-mint-500 px-2.5 py-1 text-xs font-medium text-white"
              : sub.status === "PENDING"
              ? "rounded-full bg-gold-500 px-2.5 py-1 text-xs font-medium text-navy-900"
              : sub.status === "CANCELLED"
              ? "rounded-full bg-navy-200 px-2.5 py-1 text-xs font-medium text-navy-700"
              : "rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-700"
          }
        >
          {sub.status}
        </span>
      </div>
      <div className="mt-2 text-xs text-navy-500">
        {sub.billingType === "YEARLY" ? "연간" : "월간"} · {formatKRW(sub.priceKrw)}
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

      {(sub.status === "ACTIVE" || sub.status === "PENDING") && (
        <div className="mt-5 border-t border-navy-100 pt-4">
          <button
            onClick={cancel}
            disabled={busy}
            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            {busy ? "처리 중..." : "구독 해지"}
          </button>
        </div>
      )}
    </div>
  );
}
