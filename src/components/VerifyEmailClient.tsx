"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyEmailClient({ token }: { token: string }) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!mounted) return;
        const data = await res.json();
        if (res.ok) {
          setState("ok");
          setMessage("이메일 인증이 완료되었습니다.");
        } else {
          setState("error");
          setMessage(data.message ?? "인증 실패");
        }
      } catch {
        if (!mounted) return;
        setState("error");
        setMessage("네트워크 오류");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (state === "loading") {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-navy-500" />
        <p className="text-sm text-navy-600">인증 처리 중...</p>
      </div>
    );
  }
  if (state === "ok") {
    return (
      <div className="mt-6 flex flex-col items-center gap-4">
        <CheckCircle2 className="h-12 w-12 text-mint-600" />
        <p className="text-base font-semibold text-navy-900">{message}</p>
        <Link href="/mypage" className="btn-primary mt-4">
          마이페이지로
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <XCircle className="h-12 w-12 text-red-500" />
      <p className="text-base font-semibold text-navy-900">{message}</p>
      <Link href="/mypage" className="btn-secondary mt-4">
        마이페이지로
      </Link>
    </div>
  );
}
