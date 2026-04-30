"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

const NOTIF_CATEGORIES = CATEGORIES.filter((c) => c.id !== "ALLINONE");

export function AlimtalkTriggerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; highPriority: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      category: String(fd.get("category") ?? "DAYTRADE"),
      market: String(fd.get("market") ?? "KOSPI"),
      symbol: String(fd.get("symbol") ?? "").trim() || undefined,
      title: String(fd.get("title") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    const res = await fetch("/api/admin/alimtalk/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "발송 실패");
      return;
    }
    setResult({ count: data.count, highPriority: data.highPriority ?? 0 });
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">카테고리</span>
        <select name="category" className="input">
          {NOTIF_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">시장</span>
        <select name="market" className="input">
          {ALL_MARKETS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          종목 코드 (선택, 입력 시 관심종목 매치 우선 발송)
        </span>
        <input
          name="symbol"
          className="input"
          placeholder="예: 005930, AAPL, BTC"
          maxLength={20}
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">알림 제목</span>
        <input
          name="title"
          required
          className="input"
          placeholder="[포트존] 오늘의 단타 추천 종목"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">메시지</span>
        <textarea
          name="message"
          required
          rows={5}
          className="input"
          placeholder="▶ 종목명: OOO전자&#10;매수가: 12,500원&#10;목표가: 13,200원 (+5.6%)&#10;손절가: 12,200원"
        />
      </label>

      <div className="md:col-span-2 rounded-xl bg-navy-50 p-4 text-xs text-navy-600">
        해당 카테고리·시장을 구독한 회원에게만 발송됩니다.
        <br />
        <strong>종목 코드</strong>를 입력하면 관심종목으로 등록한 회원에겐{" "}
        <strong>HIGH 우선순위</strong>로 표시됩니다.
        <br />⚠️ 현재 알림톡 미연동 상태 — DB 큐 등록만 됩니다.
      </div>

      {error && (
        <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {result && (
        <div className="md:col-span-2 rounded-lg bg-mint-500/10 p-3 text-sm text-mint-600">
          {result.count}명에게 발송 큐 등록 완료.{" "}
          {result.highPriority > 0 && (
            <strong>관심종목 매치 {result.highPriority}건 (HIGH)</strong>
          )}
        </div>
      )}

      <div className="md:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "발송 중..." : "알림톡 발송"}
        </button>
      </div>
    </form>
  );
}
