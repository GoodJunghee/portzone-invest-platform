"use client";

import { useEffect } from "react";

/**
 * 페이지 로드 시 localStorage 또는 시스템 설정에 따라 다크 모드 클래스를 적용.
 * 깜빡임(FOUC) 방지를 위해 inline script를 head에 삽입한 다음, 렌더링 후 transition 활성화.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 첫 렌더 후에 transition 활성화 (초기 점프 방지)
    const t = setTimeout(() => {
      document.documentElement.classList.add("theme-ready");
    }, 50);
    return () => clearTimeout(t);
  }, []);
  return <>{children}</>;
}

/**
 * <head>에 직접 삽입할 inline script (layout.tsx의 next/script로 사용).
 * 이 스크립트는 React hydration 전에 실행되어 다크 모드를 즉시 적용.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem("pz_theme");
    var prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored === "dark" || (!stored && prefers);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
