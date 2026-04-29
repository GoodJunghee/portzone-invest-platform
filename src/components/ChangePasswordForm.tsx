"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMsg(null);

    const fd = new FormData(e.currentTarget);
    const cur = String(fd.get("current") ?? "");
    const next = String(fd.get("next") ?? "");
    const next2 = String(fd.get("next2") ?? "");
    if (next !== next2) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: cur, newPassword: next }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("비밀번호가 변경되었습니다");
      (e.target as HTMLFormElement).reset();
    } else {
      const d = await res.json();
      setError(d.message ?? "변경 실패");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="현재 비밀번호" name="current" />
      <Field label="새 비밀번호 (8자 이상)" name="next" minLength={8} />
      <Field label="새 비밀번호 확인" name="next2" minLength={8} />
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {msg && (
        <div className="rounded-lg bg-mint-500/10 p-3 text-sm text-mint-600">{msg}</div>
      )}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  minLength,
}: {
  label: string;
  name: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      <input
        name={name}
        type="password"
        required
        minLength={minLength}
        className="input"
      />
    </label>
  );
}
