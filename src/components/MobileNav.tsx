"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { LogoutButton } from "./LogoutButton";
import type { Dictionary, Locale } from "@/lib/i18n";

export function MobileNav({
  locale,
  t,
  isLoggedIn,
  isAdmin,
}: {
  locale: Locale;
  t: Dictionary;
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-navy-200 text-navy-700 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-card-hover md:hidden dark:bg-navy-900 dark:border-l dark:border-navy-800"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-navy-100 p-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="grid h-7 w-7 place-items-center rounded-md bg-navy-900 text-white">
                  <span className="text-xs font-black">P</span>
                </div>
                <span className="text-base font-bold text-navy-900">
                  포트존<span className="text-gold-500">.</span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-navy-700 hover:bg-navy-50"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              <NavLink href="/#features" onClose={() => setOpen(false)}>
                {t.common.about}
              </NavLink>
              <NavLink href="/pricing" onClose={() => setOpen(false)}>
                {t.common.pricing}
              </NavLink>
              <NavLink href="/reports" onClose={() => setOpen(false)}>
                {t.common.reports}
              </NavLink>
              <NavLink href="/blog" onClose={() => setOpen(false)}>
                블로그
              </NavLink>
              <NavLink href="/about" onClose={() => setOpen(false)}>
                회사 소개
              </NavLink>
              <NavLink href="/how-it-works" onClose={() => setOpen(false)}>
                이용 가이드
              </NavLink>
              <NavLink href="/faq" onClose={() => setOpen(false)}>
                {t.common.faq}
              </NavLink>
              {isLoggedIn && (
                <>
                  <div className="my-2 border-t border-navy-100" />
                  {isAdmin && (
                    <NavLink href="/admin" onClose={() => setOpen(false)}>
                      관리자 대시보드
                    </NavLink>
                  )}
                  <NavLink href="/mypage" onClose={() => setOpen(false)}>
                    {t.common.mypage}
                  </NavLink>
                </>
              )}
            </nav>

            <div className="border-t border-navy-100 p-4">
              {isLoggedIn ? (
                <LogoutButton
                  className="btn-primary w-full !py-2.5 text-sm"
                />
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary mb-2 w-full !py-2.5 text-sm"
                  >
                    {t.common.login}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full !py-2.5 text-sm"
                  >
                    {t.common.signup}
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-navy-100 p-4">
              <span className="text-xs text-navy-500">테마 / 언어</span>
              <div className="flex items-center gap-1.5">
                <LangToggle current={locale} />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function NavLink({
  href,
  children,
  onClose,
}: {
  href: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="rounded-lg px-3 py-3 text-base font-medium text-navy-800 transition hover:bg-navy-50"
    >
      {children}
    </Link>
  );
}
