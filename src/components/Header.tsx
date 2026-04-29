import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="container-narrow flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-white">
            <span className="text-sm font-black">P</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-navy-900">
            포트존<span className="text-gold-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-navy-700 md:flex">
          <Link href="/#features" className="hover:text-navy-900">
            서비스 소개
          </Link>
          <Link href="/pricing" className="hover:text-navy-900">
            요금제
          </Link>
          <Link href="/reports" className="hover:text-navy-900">
            보고서
          </Link>
          <Link href="/#faq" className="hover:text-navy-900">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary !py-2 !px-4">
            로그인
          </Link>
          <Link href="/signup" className="btn-primary !py-2 !px-4">
            무료 가입
          </Link>
        </div>
      </div>
    </header>
  );
}
