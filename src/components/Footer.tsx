import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-navy-50">
      <div className="container-narrow py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-lg font-bold text-navy-900">
              포트존<span className="text-gold-500">.</span>
            </div>
            <p className="mt-3 text-sm text-navy-600">
              주식·코인 종목 추천 플랫폼.
              <br />
              알림톡으로 빠르게 받아보세요.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">서비스</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/pricing" className="hover:text-navy-900">
                  요금제
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-navy-900">
                  보고서
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-navy-900">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">회사 / 정책</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/legal/terms" className="hover:text-navy-900">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-navy-900">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="hover:text-navy-900">
                  투자 유의사항
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">고지사항</h4>
            <p className="mt-3 text-xs leading-relaxed text-navy-500">
              본 서비스에서 제공하는 종목 추천 및 보고서는 투자 판단의 참고용 정보이며,
              최종 투자 결정은 사용자 본인의 책임입니다.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-navy-200 pt-6 text-xs text-navy-500">
          © 2026 PortZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
