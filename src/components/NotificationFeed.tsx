"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface NotifItem {
  id: string;
  channel: string;
  category: string;
  market: string;
  title: string;
  message: string;
  status: string;
  priority: string;
  matchedSymbol?: string | null;
  sentAt?: string | Date | null;
  createdAt: string | Date;
}

const PAGE_SIZE = 15;

export function NotificationFeed({ initial }: { initial: NotifItem[] }) {
  const [items, setItems] = useState<NotifItem[]>(initial);
  const [cursor, setCursor] = useState<string | null>(
    initial.length === PAGE_SIZE ? initial[initial.length - 1]?.id ?? null : null
  );
  const [hasMore, setHasMore] = useState(initial.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading || !hasMore) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("cursor", cursor);
    params.set("limit", String(PAGE_SIZE));
    const res = await fetch(`/api/notifications?${params.toString()}`);
    setLoading(false);
    if (!res.ok) {
      setHasMore(false);
      return;
    }
    const data = await res.json();
    setItems((prev) => [...prev, ...(data.items ?? [])]);
    setCursor(data.nextCursor ?? null);
    setHasMore(!!data.nextCursor);
  }, [cursor, loading, hasMore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  if (items.length === 0) {
    return (
      <div className="card text-sm text-navy-500">발송된 알림이 없습니다.</div>
    );
  }

  return (
    <div className="card">
      <ul className="divide-y divide-navy-100">
        {items.map((n) => (
          <li key={n.id} className="flex items-start gap-4 py-3">
            <div
              className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                n.priority === "HIGH" ? "bg-gold-500" : "bg-mint-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                  {n.title}
                  {n.priority === "HIGH" && (
                    <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[9px] font-bold text-navy-900">
                      관심종목
                    </span>
                  )}
                </span>
                <span className="text-xs text-navy-500">
                  {n.sentAt
                    ? new Date(n.sentAt).toLocaleString("ko-KR")
                    : "대기중"}
                </span>
              </div>
              <div className="mt-1 text-xs text-navy-600 line-clamp-3 whitespace-pre-line">
                {n.message}
              </div>
              <div className="mt-1.5 text-[11px] text-navy-500">
                {n.category} · {n.market}
                {n.matchedSymbol && (
                  <span className="ml-2 text-gold-600">↳ {n.matchedSymbol}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="mt-4 flex items-center justify-center py-3">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-navy-400" />
        ) : !hasMore ? (
          <span className="text-xs text-navy-400">모든 알림을 불러왔습니다</span>
        ) : (
          <span className="text-xs text-navy-400">스크롤 시 자동 로드</span>
        )}
      </div>
    </div>
  );
}
