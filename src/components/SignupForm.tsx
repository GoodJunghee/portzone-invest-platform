"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("약관에 동의해주세요.");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      password: String(fd.get("password") ?? ""),
      referralCode: String(fd.get("referralCode") ?? "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "가입 실패");
        return;
      }
      router.push("/mypage");
      router.refresh();
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="이름">
        <input name="name" required maxLength={40} className="input" placeholder="홍길동" />
      </Field>
      <Field label="이메일">
        <input
          name="email"
          type="email"
          required
          className="input"
          placeholder="example@portzone.kr"
        />
      </Field>
      <Field label="휴대폰 번호 (알림톡 수신용)">
        <input
          name="phone"
          required
          className="input"
          placeholder="01012345678"
          pattern="[0-9]{10,11}"
        />
      </Field>
      <Field label="비밀번호 (8자 이상)">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="input"
        />
      </Field>
      <Field label="추천 코드 (선택)">
        <input
          name="referralCode"
          className="input"
          maxLength={20}
          placeholder="가입 시 추천인 코드 입력"
        />
      </Field>

      <label className="flex items-start gap-2 text-sm text-navy-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          <Link href="/legal/terms" target="_blank" className="font-semibold underline">
            이용약관
          </Link>
          ,{" "}
          <Link
            href="/legal/privacy"
            target="_blank"
            className="font-semibold underline"
          >
            개인정보처리방침
          </Link>
          ,{" "}
          <Link
            href="/legal/disclaimer"
            target="_blank"
            className="font-semibold underline"
          >
            투자 유의사항
          </Link>{" "}
          및 <strong>알림톡 수신</strong>에 동의합니다.
        </span>
      </label>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "가입 중..." : "가입하기"}
      </button>

      <p className="text-center text-xs text-navy-500">
        가입 후 입력하신 이메일로 인증 링크가 발송됩니다.
      </p>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
      </span>
      {children}
    </label>
  );
}
