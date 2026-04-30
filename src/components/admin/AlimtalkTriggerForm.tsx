"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";
import { applyTemplate, extractVariables } from "@/lib/template";

const NOTIF_CATEGORIES = CATEGORIES.filter((c) => c.id !== "ALLINONE");

interface AlimtalkTemplate {
  id: string;
  name: string;
  category: string;
  market?: string | null;
  title: string;
  body: string;
}

export function AlimtalkTriggerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; highPriority: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [templates, setTemplates] = useState<AlimtalkTemplate[]>([]);
  const [selectedTpl, setSelectedTpl] = useState("");
  const [category, setCategory] = useState("DAYTRADE");
  const [market, setMarket] = useState("KOSPI");
  const [symbol, setSymbol] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [vars, setVars] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/templates/alimtalk")
      .then((r) => r.json())
      .then((data) => setTemplates(data.items ?? []))
      .catch(() => {});
  }, []);

  const variableKeys = useMemo(() => {
    const set = new Set<string>([
      ...extractVariables(title),
      ...extractVariables(body),
    ]);
    return Array.from(set);
  }, [title, body]);

  function applyTpl(id: string) {
    setSelectedTpl(id);
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setCategory(tpl.category);
    if (tpl.market) setMarket(tpl.market);
    setTitle(tpl.title);
    setBody(tpl.body);
    setVars({});
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const finalTitle = applyTemplate(title, vars);
    const finalBody = applyTemplate(body, vars);

    const payload = {
      category,
      market,
      symbol: symbol.trim() || undefined,
      title: finalTitle,
      message: finalBody,
    };

    const res = await fetch("/api/admin/alimtalk/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "발송 실패");
      return;
    }
    setResult({ count: data.count, highPriority: data.highPriority ?? 0 });
    setVars({});
    setSymbol("");
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
            onChange={(e) => applyTpl(e.target.value)}
            className="input"
          >
            <option value="">템플릿 선택...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category}
                {t.market ? ` · ${t.market}` : ""})
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">카테고리</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          {NOTIF_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">시장</span>
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="input"
        >
          {ALL_MARKETS.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          종목 코드 (선택, 입력 시 관심종목 매치 우선)
        </span>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="input"
          placeholder="예: 005930, AAPL, BTC"
          maxLength={20}
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          알림 제목 (변수: {`{{name}} 등`})
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">메시지</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={5}
          className="input"
        />
      </label>

      {variableKeys.length > 0 && (
        <div className="md:col-span-2 rounded-xl bg-navy-50 p-4">
          <div className="mb-2 text-xs font-semibold text-navy-700">
            변수 값 입력 ({variableKeys.length}개)
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {variableKeys.map((k) => (
              <label key={k} className="block">
                <span className="mb-1 block text-[11px] font-mono text-navy-600">
                  {`{{${k}}}`}
                </span>
                <input
                  value={vars[k] ?? ""}
                  onChange={(e) =>
                    setVars((prev) => ({ ...prev, [k]: e.target.value }))
                  }
                  className="input !py-2 text-sm"
                />
              </label>
            ))}
          </div>
          {/* Preview */}
          <div className="mt-3 rounded-lg bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-500">
              미리보기
            </div>
            <div className="mt-1 text-sm font-semibold text-navy-900">
              {applyTemplate(title, vars) || "(제목 없음)"}
            </div>
            <div className="mt-1 whitespace-pre-line text-xs text-navy-700">
              {applyTemplate(body, vars) || "(본문 없음)"}
            </div>
          </div>
        </div>
      )}

      <div className="md:col-span-2 rounded-xl bg-navy-50 p-4 text-xs text-navy-600">
        해당 카테고리·시장을 구독한 회원에게만 발송됩니다.
        <br />
        <strong>종목 코드</strong>를 입력하면 관심종목 등록자에게 <strong>HIGH 우선순위</strong>로
        표시됩니다.
        <br />⚠️ 현재 알림톡 미연동 — DB 큐 등록만 됩니다.
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
