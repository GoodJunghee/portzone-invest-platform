"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") ?? "");
    const pw2 = String(fd.get("password2") ?? "");
    if (pw !== pw2) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });
    setLoading(false);
    if (res.ok) {
      alert("비밀번호가 재설정되었습니다. 다시 로그인해주세요.");
      router.push("/login");
    } else {
      const d = await res.json();
      setError(d.message ?? "재설정 실패");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">새 비밀번호</span>
        <input name="password" type="password" required minLength={8} className="input" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          새 비밀번호 확인
        </span>
        <input name="password2" type="password" required minLength={8} className="input" />
      </label>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "변경 중..." : "비밀번호 재설정"}
      </button>
    </form>
  );
}
