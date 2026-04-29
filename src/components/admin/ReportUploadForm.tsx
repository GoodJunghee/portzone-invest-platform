"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

const REPORT_CATEGORIES = CATEGORIES.filter((c) => c.id !== "ALLINONE");

export function ReportUploadForm() {
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
    const res = await fetch("/api/admin/reports/upload", {
      method: "POST",
      body: fd, // multipart
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "업로드 실패");
      return;
    }
    setMsg("보고서 업로드 완료");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">제목</span>
        <input name="title" required className="input" />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">카테고리</span>
        <select name="category" className="input" required>
          {REPORT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">시장</span>
        <select name="market" className="input" required>
          {ALL_MARKETS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">요약</span>
        <input name="summary" required className="input" placeholder="한 줄 요약" />
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
