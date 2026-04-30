"use client";

import { useState } from "react";
import { Copy, Users, Gift } from "lucide-react";

interface Stats {
  totalReferred: number;
  confirmed: number;
  activeCoupons: number;
  totalRewardCoupons: number;
}

export function ReferralStats({
  referralCode,
  stats,
}: {
  referralCode: string | null;
  stats: Stats;
}) {
  const [copied, setCopied] = useState(false);

  const link = referralCode
    ? `${typeof window === "undefined" ? "" : window.location.origin}/signup?ref=${referralCode}`
    : "";

  function copy() {
    if (!referralCode) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-navy-900">친구 초대 보상</h3>
          <p className="text-xs text-navy-500">
            친구가 가입하면 양쪽에 1개월 무료 쿠폰이 발급됩니다
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="초대한 친구" value={stats.totalReferred} />
        <Stat label="결제 전환" value={stats.confirmed} />
        <Stat label="받은 쿠폰" value={stats.totalRewardCoupons} />
      </div>

      {referralCode && (
        <div className="mt-5 rounded-xl bg-navy-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-navy-500">
            내 추천 코드
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm font-mono font-bold text-navy-900">
              {referralCode}
            </code>
            <button onClick={copy} className="btn-secondary !py-2 !px-3 text-xs">
              <Copy className="mr-1 h-3.5 w-3.5" />
              {copied ? "복사됨!" : "링크 복사"}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-navy-500 truncate">
            {link}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-gold-500/10 p-3 text-xs text-navy-700">
        <Gift className="-mt-0.5 mr-1 inline h-3.5 w-3.5 text-gold-600" />
        피추천인 가입 시: 양쪽에 <strong>1개월 무료</strong> 쿠폰 (90일 유효)
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-navy-100 p-3 text-center">
      <div className="text-2xl font-black text-navy-900">{value}</div>
      <div className="mt-0.5 text-[11px] text-navy-500">{label}</div>
    </div>
  );
}
