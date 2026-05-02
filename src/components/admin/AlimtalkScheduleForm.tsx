"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

const CATS = CATEGORIES.filter((c) => c.id !== "ALLINONE");

function defaultLocalDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30 - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function AlimtalkScheduleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const localDt = String(fd.get("scheduledAt") ?? "");
    const parsedDate = new Date(localDt);
    if (!localDt || isNaN(parsedDate.getTime())) {
      setLoading(false);
      setError("발송 시각이 올바르지 않습니다");
      return;
    }
    if (parsedDate.getTime() < Date.now() - 60_000) {
      setLoading(false);
      setError("과거 시각은 예약할 수 없습니다");
      return;
    }

    const body = {
      category: String(fd.get("category") ?? "DAYTRADE"),
      market: String(fd.get("market") ?? "KOSPI"),
      title: String(fd.get("title") ?? ""),
      message: String(fd.get("message") ?? ""),
      scheduledAt: parsedDate.toISOString(),
    };

    const res = await fetch("/api/admin/alimtalk/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "예약 실패");
      return;
    }
    setMsg("예약 발송 등록 완료");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">카테고리</span>
        <select name="category" className="input">
          {CATS.map((c) => (
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
        <span className="mb-1.5 block text-sm font-medium text-navy-800">발송 시각</span>
        <input
          name="scheduledAt"
          type="datetime-local"
          required
          defaultValue={defaultLocalDateTime()}
          className="input"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">알림 제목</span>
        <input name="title" required className="input" />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">메시지</span>
        <textarea name="message" required rows={5} className="input" />
      </label>

      <div className="md:col-span-2 rounded-xl bg-navy-50 p-4 text-xs text-navy-600">
        외부 cron이 <code className="rounded bg-white px-1">/api/cron/alimtalk</code>를
        주기적으로 호출하면 예약된 잡이 자동 발송됩니다.
      </div>

      {error && (
        <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {msg && (
        <div className="md:col-span-2 rounded-lg bg-mint-500/10 p-3 text-sm text-mint-600">
          {msg}
        </div>
      )}

      <div className="md:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "등록 중..." : "예약 발송 등록"}
        </button>
      </div>
    </form>
  );
}
