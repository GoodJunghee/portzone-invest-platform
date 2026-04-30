import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { MobileNav } from "./MobileNav";
import { getServerDictionary } from "@/lib/i18n-server";

export function Header() {
  const { t, locale } = getServerDictionary();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-100 bg-white/90 backdrop-blur dark:bg-navy-900/80">
      <div className="container-narrow flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-white">
            <span className="text-sm font-black">P</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-navy-900">
            포트존<span className="text-gold-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-navy-700 lg:flex">
          <Link href="/#features" className="hover:text-navy-900">
            {t.common.about}
          </Link>
          <Link href="/pricing" className="hover:text-navy-900">
            {t.common.pricing}
          </Link>
          <Link href="/reports" className="hover:text-navy-900">
            {t.common.reports}
          </Link>
          <Link href="/blog" className="hover:text-navy-900">
            블로그
          </Link>
          <Link href="/#faq" className="hover:text-navy-900">
            {t.common.faq}
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1.5">
            <LangToggle current={locale} />
            <ThemeToggle />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="btn-secondary !py-2 !px-3 text-xs">
              {t.common.login}
            </Link>
            <Link href="/signup" className="btn-primary !py-2 !px-3 text-xs">
              {t.common.signup}
            </Link>
          </div>
          <MobileNav locale={locale} t={t} />
        </div>
      </div>
    </header>
  );
}
