"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else {
      const d = await res.json();
      setError(d.message ?? "처리 실패");
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-mint-500/10 p-4 text-sm text-mint-600">
        해당 이메일이 가입되어 있다면 비밀번호 재설정 링크를 발송해드렸습니다.
        메일함을 확인해주세요. (스팸함도 확인)
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">이메일</span>
        <input name="email" type="email" required className="input" />
      </label>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "발송 중..." : "재설정 링크 받기"}
      </button>
    </form>
  );
}
