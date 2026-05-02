"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

const REPORT_CATEGORIES = CATEGORIES.filter((c) => c.id !== "ALLINONE");

interface Report {
  id: string;
  title: string;
  category: string;
  market: string;
  summary: string;
  fileUrl?: string | null;
  isPublic?: boolean;
  publishedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function ReportSearch({
  initialQ,
  initialCategory,
  initialMarket,
  initialPage,
  isLoggedIn,
}: {
  initialQ: string;
  initialCategory: string;
  initialMarket: string;
  initialPage: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [market, setMarket] = useState(initialMarket);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [items, setItems] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (market) params.set("market", market);
    params.set("page", String(page));
    params.set("pageSize", "12");

    fetch(`/api/reports?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [q, category, market, page]);

  // URL 동기화 (얕은 push로 페이지 전체 리렌더 방지)
  useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q); else params.delete("q");
    if (category) params.set("category", category); else params.delete("category");
    if (market) params.set("market", market); else params.delete("market");
    if (page > 1) params.set("page", String(page)); else params.delete("page");
    startTransition(() => {
      router.replace(`/reports?${params.toString()}`, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, market, page]);

  function reset() {
    setQ("");
    setCategory("");
    setMarket("");
    setPage(1);
  }

  return (
    <div className="mt-6">
      {/* Filter bar */}
      <div className="card">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="제목·요약 검색"
              className="input !pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">전체 카테고리</option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={market}
            onChange={(e) => {
              setMarket(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">전체 시장</option>
            <optgroup label="주식">
              {ALL_MARKETS.filter((m) => m.group === "STOCK").map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
            <optgroup label="코인">
              {ALL_MARKETS.filter((m) => m.group === "CRYPTO").map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
          </select>
          {(q || category || market) && (
            <button onClick={reset} className="btn-secondary !py-2 !px-4 text-xs">
              초기화
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-navy-500">
          {pagination && (
            <span>
              총 <strong>{pagination.total.toLocaleString()}</strong>건
              {q && <> · &ldquo;{q}&rdquo; 검색결과</>}
            </span>
          )}
          {loading && <span className="ml-2">로딩 중...</span>}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {items.length === 0 && !loading ? (
          <div className="card text-center text-sm text-navy-500">
            조건에 맞는 보고서가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((r) => {
              const cat = REPORT_CATEGORIES.find((c) => c.id === r.category);
              const mkt = ALL_MARKETS.find((m) => m.id === r.market);
              const locked = !isLoggedIn && !r.isPublic;
              return (
                <Link
                  key={r.id}
                  href={`/reports/${r.id}`}
                  className="card relative transition hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-navy-900 px-2 py-0.5 text-white">
                      {cat?.name ?? r.category}
                    </span>
                    <span className="text-navy-500">{mkt?.name ?? r.market}</span>
                    {r.fileUrl && (
                      <span className="rounded-full bg-gold-500 px-2 py-0.5 text-navy-900">
                        PDF
                      </span>
                    )}
                    {r.isPublic && (
                      <span className="rounded-full bg-mint-500 px-2 py-0.5 text-white">
                        무료
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-navy-900 line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-xs text-navy-600 line-clamp-3">
                    {r.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-navy-400">
                    <span>{new Date(r.publishedAt).toLocaleDateString("ko-KR")}</span>
                    {locked && (
                      <span className="inline-flex items-center gap-1 text-navy-500">
                        <Lock className="h-3 w-3" />
                        로그인 필요
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="rounded-lg border border-navy-200 bg-white p-2 text-navy-700 transition hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <PageNumbers
            current={pagination.page}
            total={pagination.totalPages}
            onPick={setPage}
          />
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="rounded-lg border border-navy-200 bg-white p-2 text-navy-700 transition hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function PageNumbers({
  current,
  total,
  onPick,
}: {
  current: number;
  total: number;
  onPick: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", total);
    } else if (current >= total - 3) {
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
  }
  return (
    <>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`d${i}`} className="px-2 text-navy-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPick(p as number)}
            className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition ${
              p === current
                ? "bg-navy-900 text-white"
                : "border border-navy-200 bg-white text-navy-700 hover:bg-navy-50"
            }`}
          >
            {p}
          </button>
        )
      )}
    </>
  );
}
