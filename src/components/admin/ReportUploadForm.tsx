"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

const REPORT_CATEGORIES = CATEGORIES.filter((c) => c.id !== "ALLINONE");

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  market: string;
  titlePattern: string;
  summary: string;
  content: string;
}

export function ReportUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTpl, setSelectedTpl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("DAYTRADE");
  const [market, setMarket] = useState("KOSPI");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/admin/templates/reports")
      .then((r) => r.json())
      .then((data) => setTemplates(data.items ?? []))
      .catch(() => {});
  }, []);

  function applyTemplate(id: string) {
    setSelectedTpl(id);
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setCategory(tpl.category);
    setMarket(tpl.market);
    setTitle(tpl.titlePattern);
    setSummary(tpl.summary);
    setContent(tpl.content);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/reports/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "업로드 실패");
      return;
    }
    setMsg("보고서 업로드 완료");
    (e.target as HTMLFormElement).reset();
    setTitle("");
    setSummary("");
    setContent("");
    setSelectedTpl("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      {templates.length > 0 && (
        <label className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-navy-800">
            템플릿 적용 (선택)
          </span>
          <select
            value={selectedTpl}
            onChange={(e) => applyTemplate(e.target.value)}
            className="input"
          >
            <option value="">템플릿 선택...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category} · {t.market})
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">제목</span>
        <input
          name="title"
          required
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">카테고리</span>
        <select
          name="category"
          className="input"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {REPORT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">시장</span>
        <select
          name="market"
          className="input"
          required
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        >
          {ALL_MARKETS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">요약</span>
        <input
          name="summary"
          required
          className="input"
          placeholder="한 줄 요약"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          본문 (HTML 허용)
        </span>
        <textarea
          name="content"
          required
          rows={6}
          className="input font-mono text-xs"
          placeholder="<h3>분석 결과</h3><p>...</p>"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          PDF 첨부 (선택, 최대 10MB)
        </span>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          className="block w-full text-sm text-navy-700 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-800"
        />
      </label>

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
          {loading ? "업로드 중..." : "보고서 업로드"}
        </button>
      </div>
    </form>
  );
}
