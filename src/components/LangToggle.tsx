"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Locale } from "@/lib/i18n";

export function LangToggle({ current }: { current: Locale }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next: Locale = current === "ko" ? "en" : "ko";
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    setBusy(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={`Switch language (${current === "ko" ? "→ EN" : "→ KO"})`}
      aria-label="Toggle language"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-navy-200 px-2.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50 disabled:opacity-50"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{current === "ko" ? "KO" : "EN"}</span>
    </button>
  );
}
