"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Mode = "light" | "dark" | "system";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem("pz_theme") as Mode | null) ?? "system";
    setMode(stored);
  }, []);

  function apply(next: Mode) {
    setMode(next);
    if (next === "system") {
      localStorage.removeItem("pz_theme");
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefers);
    } else {
      localStorage.setItem("pz_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  }

  if (!mounted) {
    return (
      <div className="grid h-9 w-9 place-items-center rounded-lg border border-navy-200 text-navy-700">
        <Monitor className="h-4 w-4" />
      </div>
    );
  }

  function next() {
    const order: Mode[] = ["light", "dark", "system"];
    const idx = order.indexOf(mode);
    apply(order[(idx + 1) % order.length]);
  }

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  const label = mode === "light" ? "라이트" : mode === "dark" ? "다크" : "시스템";

  return (
    <button
      onClick={next}
      title={`테마: ${label} (클릭해서 변경)`}
      aria-label="테마 전환"
      className="grid h-9 w-9 place-items-center rounded-lg border border-navy-200 text-navy-700 transition hover:bg-navy-50"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
