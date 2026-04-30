"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BLOG_CATEGORIES, blogCategoryName, blogCategoryEmoji } from "@/lib/blog";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  category: string;
  tags?: string | null;
  authorName: string;
  publishedAt?: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function BlogList({
  initialQ,
  initialCategory,
  initialPage,
}: {
  initialQ: string;
  initialCategory: string;
  initialPage: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [items, setItems] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", String(page));
    params.set("pageSize", "12");

    fetch(`/api/blog?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [q, category, page]);

  useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q); else params.delete("q");
    if (category) params.set("category", category); else params.delete("category");
    if (page > 1) params.set("page", String(page)); else params.delete("page");
    startTransition(() => {
      router.replace(`/blog?${params.toString()}`, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page]);

  function reset() {
    setQ("");
    setCategory("");
    setPage(1);
  }

  return (
    <div className="mt-8">
      {/* Filter bar */}
      <div className="card">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="제목·요약·태그 검색"
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
            {BLOG_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          {(q || category) && (
            <button onClick={reset} className="btn-secondary !py-2 !px-4 text-xs">
              초기화
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-navy-500">
          {pagination && <span>총 {pagination.total.toLocaleString()}개의 포스트</span>}
          {loading && <span className="ml-2">로딩 중...</span>}
        </div>
      </div>

      {/* Posts */}
      <div className="mt-6">
        {items.length === 0 && !loading ? (
          <div className="card text-center text-sm text-navy-500">
            아직 게시된 포스트가 없습니다.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="card transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                {p.coverImageUrl && (
                  <div
                    className="-mx-6 -mt-6 mb-4 h-40 rounded-t-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.coverImageUrl})` }}
                  />
                )}
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-navy-100 px-2.5 py-0.5 font-medium text-navy-800">
                    {blogCategoryEmoji(p.category)} {blogCategoryName(p.category)}
                  </span>
                  {p.publishedAt && (
                    <span className="text-navy-500">
                      {new Date(p.publishedAt).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-bold text-navy-900 line-clamp-2">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-navy-600 line-clamp-3">
                  {p.excerpt}
                </p>
                {p.tags && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] text-navy-600"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="rounded-lg border border-navy-200 bg-white p-2 text-navy-700 hover:bg-navy-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-sm text-navy-700">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="rounded-lg border border-navy-200 bg-white p-2 text-navy-700 hover:bg-navy-50 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
