"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, LogIn } from "lucide-react";
import { LoginForm } from "./LoginForm";

interface Props {
  open: boolean;
  onClose: () => void;
  /** 로그인 성공 시 호출. 미지정 시 모달만 닫음. */
  onSuccess?: () => void;
  /** 모달 상단에 표시할 안내 문구 (예: "구독 신청을 위해 로그인이 필요합니다") */
  message?: string;
}

export function LoginModal({ open, onClose, onSuccess, message }: Props) {
  // ESC 닫기 + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover dark:bg-navy-800 md:p-8">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-navy-500 hover:bg-navy-50 hover:text-navy-900"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white">
          <LogIn className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-navy-900">로그인</h2>
        {message ? (
          <p className="mt-1 text-sm text-navy-600">{message}</p>
        ) : (
          <p className="mt-1 text-sm text-navy-600">
            계속하려면 로그인이 필요합니다.
          </p>
        )}

        <div className="mt-6">
          <LoginForm
            noRedirect
            onSuccess={() => {
              onClose();
              onSuccess?.();
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-navy-600">
          <Link
            href="/forgot-password"
            className="hover:text-navy-900 hover:underline"
            onClick={onClose}
          >
            비밀번호를 잊으셨나요?
          </Link>
          <Link
            href="/signup"
            className="font-semibold text-navy-900 underline"
            onClick={onClose}
          >
            무료 가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
