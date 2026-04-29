"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirmText = String(fd.get("confirm") ?? "");

    setLoading(true);
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirm: confirmText }),
    });
    setLoading(false);
    if (res.ok) {
      alert("탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");
      router.push("/");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message ?? "탈퇴 실패");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-navy-700">
        탈퇴 시 활성 구독은 즉시 해지되며, 누적된 알림 내역과 보고서 열람 권한이 모두
        사라집니다. 동일 이메일로 재가입은 가능하지만 기존 데이터는 복구되지 않습니다.
      </p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          비밀번호 확인
        </span>
        <input name="password" type="password" required className="input" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          확인을 위해 <code className="rounded bg-navy-100 px-1.5 py-0.5">DELETE</code>{" "}
          를 입력해주세요
        </span>
        <input name="confirm" required className="input" placeholder="DELETE" />
      </label>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "처리 중..." : "회원 탈퇴"}
      </button>
    </form>
  );
}
