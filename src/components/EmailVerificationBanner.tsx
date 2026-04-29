"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setSending(true);
    setError(null);
    const res = await fetch("/api/auth/verify-email/resend", {
      method: "POST",
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      const d = await res.json();
      setError(d.message ?? "재발송 실패");
    }
  }

  return (
    <div className="rounded-2xl border border-gold-500 bg-gold-500/5 p-4">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-navy-900">
            이메일 인증이 필요합니다
          </div>
          <div className="mt-1 text-xs text-navy-600">
            <strong>{email}</strong>로 인증 메일을 발송했습니다. 메일함을 확인해주세요.
            <br />
            메일을 받지 못하셨다면 재발송할 수 있습니다.
          </div>
          {sent ? (
            <div className="mt-3 text-xs text-mint-600">
              ✓ 인증 메일을 다시 발송했습니다.
            </div>
          ) : (
            <button
              onClick={resend}
              disabled={sending}
              className="mt-3 text-xs font-semibold text-navy-900 underline disabled:opacity-50"
            >
              {sending ? "재발송 중..." : "인증 메일 재발송"}
            </button>
          )}
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
