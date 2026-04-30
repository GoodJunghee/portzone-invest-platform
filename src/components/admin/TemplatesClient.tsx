"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, FileText, MessageSquare } from "lucide-react";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

const REPORT_CATS = CATEGORIES.filter((c) => c.id !== "ALLINONE");

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  market: string;
  titlePattern: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AlimtalkTemplate {
  id: string;
  name: string;
  category: string;
  market?: string | null;
  title: string;
  body: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function TemplatesClient({
  reportTemplates,
  alimtalkTemplates,
}: {
  reportTemplates: ReportTemplate[];
  alimtalkTemplates: AlimtalkTemplate[];
}) {
  const [tab, setTab] = useState<"REPORT" | "ALIMTALK">("REPORT");

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-xl border border-navy-200 bg-white p-1">
        <TabButton active={tab === "REPORT"} onClick={() => setTab("REPORT")}>
          <FileText className="mr-1.5 inline h-3.5 w-3.5" />
          보고서 템플릿 ({reportTemplates.length})
        </TabButton>
        <TabButton active={tab === "ALIMTALK"} onClick={() => setTab("ALIMTALK")}>
          <MessageSquare className="mr-1.5 inline h-3.5 w-3.5" />
          알림톡 템플릿 ({alimtalkTemplates.length})
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === "REPORT" ? (
          <ReportTemplatesPanel templates={reportTemplates} />
        ) : (
          <AlimtalkTemplatesPanel templates={alimtalkTemplates} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Report templates ---------- */

function ReportTemplatesPanel({ templates }: { templates: ReportTemplate[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      category: String(fd.get("category") ?? "DAYTRADE"),
      market: String(fd.get("market") ?? "KOSPI"),
      titlePattern: String(fd.get("titlePattern") ?? ""),
      summary: String(fd.get("summary") ?? ""),
      content: String(fd.get("content") ?? ""),
    };
    const res = await fetch("/api/admin/templates/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      setCreating(false);
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message ?? "생성 실패");
    }
  }

  async function remove(id: string) {
    if (!confirm("이 템플릿을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/templates/reports/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-xs text-navy-500">
          변수 예: <code className="rounded bg-navy-100 px-1">{`{{symbol}}`}</code>{" "}
          <code className="rounded bg-navy-100 px-1">{`{{name}}`}</code>{" "}
          <code className="rounded bg-navy-100 px-1">{`{{date}}`}</code>
        </p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="btn-primary !py-2 !px-3 text-xs"
        >
          {creating ? "닫기" : "+ 새 보고서 템플릿"}
        </button>
      </div>

      {creating && (
        <form onSubmit={create} className="card mb-6 grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">템플릿 이름</span>
            <input name="name" required className="input" maxLength={80} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium">카테고리</span>
            <select name="category" className="input">
              {REPORT_CATS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium">시장</span>
            <select name="market" className="input">
              {ALL_MARKETS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">제목 패턴</span>
            <input
              name="titlePattern"
              required
              className="input"
              maxLength={120}
              placeholder="[코스피 단타] {{date}} {{name}} 시그널"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">요약</span>
            <input name="summary" required className="input" maxLength={300} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">본문 (HTML)</span>
            <textarea
              name="content"
              required
              rows={6}
              className="input font-mono text-xs"
            />
          </label>
          {error && (
            <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="btn-primary !py-2 !px-4 text-xs"
            >
              {busy ? "저장 중..." : "템플릿 저장"}
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 ? (
        <div className="card text-center text-sm text-navy-500">
          저장된 템플릿이 없습니다.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {templates.map((t) => (
            <li key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-navy-900">{t.name}</div>
                  <div className="mt-0.5 text-[11px] text-navy-500">
                    {t.category} · {t.market}
                  </div>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-navy-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 text-xs text-navy-700">
                <div className="font-mono line-clamp-1">{t.titlePattern}</div>
                <div className="mt-1 line-clamp-2 text-navy-600">{t.summary}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Alimtalk templates ---------- */

function AlimtalkTemplatesPanel({ templates }: { templates: AlimtalkTemplate[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const market = String(fd.get("market") ?? "");
    const body = {
      name: String(fd.get("name") ?? ""),
      category: String(fd.get("category") ?? "DAYTRADE"),
      market: market || null,
      title: String(fd.get("title") ?? ""),
      body: String(fd.get("body") ?? ""),
      description: String(fd.get("description") ?? "") || null,
    };
    const res = await fetch("/api/admin/templates/alimtalk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      setCreating(false);
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message ?? "생성 실패");
    }
  }

  async function remove(id: string) {
    if (!confirm("이 템플릿을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/templates/alimtalk/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-xs text-navy-500">
          변수: <code className="rounded bg-navy-100 px-1">{`{{symbol}}`}</code>{" "}
          <code className="rounded bg-navy-100 px-1">{`{{name}}`}</code>{" "}
          <code className="rounded bg-navy-100 px-1">{`{{buy}}`}</code>{" "}
          <code className="rounded bg-navy-100 px-1">{`{{target}}`}</code>{" "}
          <code className="rounded bg-navy-100 px-1">{`{{stop}}`}</code>
        </p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="btn-primary !py-2 !px-3 text-xs"
        >
          {creating ? "닫기" : "+ 새 알림톡 템플릿"}
        </button>
      </div>

      {creating && (
        <form onSubmit={create} className="card mb-6 grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">템플릿 이름</span>
            <input name="name" required className="input" maxLength={80} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium">카테고리</span>
            <select name="category" className="input">
              {REPORT_CATS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium">시장 (선택)</span>
            <select name="market" className="input">
              <option value="">모든 시장</option>
              {ALL_MARKETS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">알림 제목</span>
            <input name="title" required className="input" maxLength={120} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">메시지 본문</span>
            <textarea name="body" required rows={6} className="input" maxLength={2000} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium">설명 (선택)</span>
            <input name="description" className="input" maxLength={300} />
          </label>
          {error && (
            <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="btn-primary !py-2 !px-4 text-xs"
            >
              {busy ? "저장 중..." : "템플릿 저장"}
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 ? (
        <div className="card text-center text-sm text-navy-500">
          저장된 템플릿이 없습니다.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {templates.map((t) => (
            <li key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-navy-900">{t.name}</div>
                  <div className="mt-0.5 text-[11px] text-navy-500">
                    {t.category}
                    {t.market ? ` · ${t.market}` : " · 모든 시장"}
                  </div>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-navy-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 text-xs text-navy-700">
                <div className="font-semibold line-clamp-1">{t.title}</div>
                <div className="mt-1 line-clamp-3 whitespace-pre-line text-navy-600">
                  {t.body}
                </div>
              </div>
              {t.description && (
                <div className="mt-2 text-[11px] text-navy-400 line-clamp-1">
                  {t.description}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
