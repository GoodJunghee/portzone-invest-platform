"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({
  onSuccess,
  noRedirect,
}: {
  /** 로그인 성공 시 호출 (모달 닫기 등). 호출되면 redirect는 자동으로 안 함. */
  onSuccess?: (role: "USER" | "ADMIN") => void;
  /** redirect를 건너뛰고 router.refresh()만 실행 (모달 안에서 그대로 머무를 때) */
  noRedirect?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "로그인 실패");
        return;
      }
      const role = (data.role ?? "USER") as "USER" | "ADMIN";
      if (onSuccess) {
        onSuccess(role);
        router.refresh();
        return;
      }
      if (noRedirect) {
        router.refresh();
        return;
      }
      router.push(role === "ADMIN" ? "/admin" : "/mypage");
      router.refresh();
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">이메일</span>
        <input name="email" type="email" required className="input" autoFocus />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">비밀번호</span>
        <input name="password" type="password" required className="input" />
      </label>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
