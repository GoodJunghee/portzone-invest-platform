"use client";

import { Ticket, Copy, CheckCircle2 } from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  type: string;
  valueInt: number;
  description: string;
  status: string;
  expiresAt?: Date | string | null;
}

export function CouponList({ items }: { items: CouponItem[] }) {
  const active = items.filter((c) => c.status === "ACTIVE");
  const used = items.filter((c) => c.status === "USED");
  const expired = items.filter((c) => c.status === "EXPIRED");

  if (items.length === 0) {
    return (
      <div className="card text-center text-sm text-navy-500">
        보유 쿠폰이 없습니다. 친구를 초대하면 1개월 무료 쿠폰을 받을 수 있어요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
            사용 가능 ({active.length})
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {active.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        </div>
      )}
      {used.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
            사용 완료 ({used.length})
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {used.map((c) => (
              <CouponCard key={c.id} coupon={c} dim />
            ))}
          </div>
        </div>
      )}
      {expired.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
            만료 ({expired.length})
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {expired.map((c) => (
              <CouponCard key={c.id} coupon={c} dim />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CouponCard({ coupon, dim }: { coupon: CouponItem; dim?: boolean }) {
  const valueText =
    coupon.type === "FREE_MONTH"
      ? `+${coupon.valueInt}개월 무료`
      : coupon.type === "PERCENT"
      ? `${coupon.valueInt}% 할인`
      : `${coupon.valueInt.toLocaleString()}원 할인`;

  const expiresText = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleDateString("ko-KR")
    : "—";

  return (
    <div
      className={`card relative ${
        dim ? "opacity-50" : "border-2 border-gold-500/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
            dim ? "bg-navy-100 text-navy-500" : "bg-gold-500 text-navy-900"
          }`}
        >
          {coupon.status === "USED" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Ticket className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-navy-900">{valueText}</div>
          <div className="mt-0.5 text-xs text-navy-600 line-clamp-1">
            {coupon.description}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-navy-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-navy-800">
              {coupon.code}
            </code>
            <CopyButton text={coupon.code} />
          </div>
          <div className="mt-1 text-[11px] text-navy-400">
            만료일: {expiresText}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="text-navy-400 hover:text-navy-700"
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(text);
        }
      }}
      title="코드 복사"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}
