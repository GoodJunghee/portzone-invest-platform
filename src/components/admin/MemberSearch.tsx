"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  emailVerified: boolean;
  deletedAt?: string | null;
  referralCode?: string | null;
  createdAt: string;
  _count: { subscriptions: number; watchlist: number; notifications: number };
  subscriptions: { status: string; category: string; billingType: string }[];
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function MemberSearch() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [emailVerified, setEmailVerified] = useState("");
  const [hasActive, setHasActive] = useState("");
  const [deleted, setDeleted] = useState("false");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (emailVerified) params.set("emailVerified", emailVerified);
    if (hasActive) params.set("hasActive", hasActive);
    if (deleted) params.set("deleted", deleted);
    params.set("page", String(page));
    params.set("pageSize", "20");

    fetch(`/api/admin/members?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [q, role, emailVerified, hasActive, deleted, page]);

  return (
    <div>
      <div className="card">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,1fr,1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="이름·이메일·전화 검색"
              className="input !pl-9"
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">전체 권한</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select
            value={emailVerified}
            onChange={(e) => {
              setEmailVerified(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">이메일 인증 전체</option>
            <option value="true">인증됨</option>
            <option value="false">미인증</option>
          </select>
          <select
            value={hasActive}
            onChange={(e) => {
              setHasActive(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">구독 상태 전체</option>
            <option value="true">활성/체험 있음</option>
            <option value="false">활성 없음</option>
          </select>
          <select
            value={deleted}
            onChange={(e) => {
              setDeleted(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="false">정상 회원</option>
            <option value="true">탈퇴 회원</option>
          </select>
        </div>
        <div className="mt-3 text-xs text-navy-500">
          {pagination && <span>총 {pagination.total.toLocaleString()}명</span>}
          {loading && <span className="ml-2">로딩 중...</span>}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 card overflow-x-auto">
        {items.length === 0 && !loading ? (
          <p className="py-8 text-center text-sm text-navy-500">
            조건에 맞는 회원이 없습니다.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs text-navy-500">
                <th className="py-2 font-medium">이름</th>
                <th className="py-2 font-medium">이메일</th>
                <th className="py-2 font-medium">전화</th>
                <th className="py-2 font-medium">권한</th>
                <th className="py-2 font-medium">인증</th>
                <th className="py-2 font-medium">구독</th>
                <th className="py-2 font-medium">관심</th>
                <th className="py-2 font-medium">알림</th>
                <th className="py-2 font-medium">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium text-navy-900">{u.name}</td>
                  <td className="py-3 text-navy-700 max-w-[200px] truncate">
                    {u.email}
                  </td>
                  <td className="py-3 text-navy-700 font-mono text-xs">{u.phone}</td>
                  <td className="py-3">
                    <span
                      className={
                        u.role === "ADMIN"
                          ? "rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900"
                          : "text-xs text-navy-500"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    {u.emailVerified ? (
                      <span className="text-mint-600 text-xs">✓</span>
                    ) : (
                      <span className="text-navy-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {u.subscriptions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.subscriptions.map((s, i) => (
                          <span
                            key={i}
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              s.status === "TRIAL"
                                ? "bg-gold-500/20 text-gold-700"
                                : "bg-mint-500/20 text-mint-700"
                            }`}
                          >
                            {s.category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-navy-400 text-xs">
                        ({u._count.subscriptions})
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-navy-700 text-xs">
                    {u._count.watchlist}
                  </td>
                  <td className="py-3 text-navy-700 text-xs">
                    {u._count.notifications}
                  </td>
                  <td className="py-3 text-navy-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-navy-200 bg-white p-2 text-navy-700 hover:bg-navy-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-sm text-navy-700">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
            className="rounded-lg border border-navy-200 bg-white p-2 text-navy-700 hover:bg-navy-50 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
