"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS } from "@/lib/constants";
import { Trash2, Plus } from "lucide-react";

interface WatchlistItem {
  id: string;
  market: string;
  symbol: string;
  name: string;
  memo?: string | null;
  createdAt: string | Date;
}

export function WatchlistPanel({ items }: { items: WatchlistItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      market: String(fd.get("market") ?? "KOSPI"),
      symbol: String(fd.get("symbol") ?? "").trim(),
      name: String(fd.get("name") ?? "").trim(),
      memo: String(fd.get("memo") ?? "").trim() || null,
    };
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.message ?? "추가 실패");
      return;
    }
    (e.target as HTMLFormElement).reset();
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("관심 종목에서 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy-900">관심 종목</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="btn-secondary !py-1.5 !px-3 text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {open ? "닫기" : "추가"}
        </button>
      </div>

      {open && (
        <form onSubmit={add} className="mt-4 grid gap-3 rounded-xl bg-navy-50 p-4 md:grid-cols-4">
          <select name="market" className="input md:col-span-1">
            {ALL_MARKETS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            name="symbol"
            placeholder="종목코드"
            required
            className="input md:col-span-1"
          />
          <input
            name="name"
            placeholder="종목명"
            required
            className="input md:col-span-1"
          />
          <input
            name="memo"
            placeholder="메모 (선택)"
            className="input md:col-span-1"
          />
          {error && (
            <div className="md:col-span-4 rounded-lg bg-red-50 p-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary !py-2 md:col-span-4"
          >
            {submitting ? "추가 중..." : "관심 종목 추가"}
          </button>
        </form>
      )}

      <div className="mt-4">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-navy-500">
            아직 등록된 관심 종목이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-navy-100">
            {items.map((it) => {
              const m = ALL_MARKETS.find((x) => x.id === it.market);
              return (
                <li
                  key={it.id}
                  className="flex items-center gap-4 py-3"
                >
                  <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-800">
                    {m?.name ?? it.market}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy-900">
                      {it.name}{" "}
                      <span className="text-xs font-normal text-navy-500">
                        {it.symbol}
                      </span>
                    </div>
                    {it.memo && (
                      <div className="text-xs text-navy-500 truncate">
                        {it.memo}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="text-navy-400 hover:text-red-500"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
