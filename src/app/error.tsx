"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <main className="grid min-h-screen place-items-center bg-navy-50 p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-navy-900">
              일시적인 오류가 발생했습니다
            </h1>
            <p className="mt-3 text-sm text-navy-600">
              잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터에 알려주세요.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-[11px] text-navy-400">
                ID: {error.digest}
              </p>
            )}
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={reset}
                className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800"
              >
                다시 시도
              </button>
              <Link
                href="/"
                className="rounded-lg border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-900 hover:bg-navy-50"
              >
                홈으로
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
