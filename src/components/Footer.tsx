import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n-server";

export function Footer() {
  const { t } = getServerDictionary();
  return (
    <footer className="border-t border-navy-100 bg-navy-50">
      <div className="container-narrow py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="text-lg font-bold text-navy-900">
              포트존<span className="text-gold-500">.</span>
            </div>
            <p className="mt-3 text-sm text-navy-600 max-w-xs">
              주식·코인 종목 추천 플랫폼.
              <br />
              알림톡으로 빠르게 받아보세요.
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-navy-500">
              본 서비스에서 제공하는 종목 추천 및 보고서는 투자 판단의 참고용 정보이며,
              최종 투자 결정은 사용자 본인의 책임입니다.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">{t.footer.services}</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/pricing" className="hover:text-navy-900">
                  {t.common.pricing}
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-navy-900">
                  {t.common.reports}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-navy-900">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-navy-900">
                  이용 가이드
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">고객 지원</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/about" className="hover:text-navy-900">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-navy-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-navy-900">
                  고객지원
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">{t.footer.company}</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/legal/terms" className="hover:text-navy-900">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-navy-900">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="hover:text-navy-900">
                  {t.footer.disclaimer}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-navy-200 pt-6 text-xs text-navy-500">
          © 2026 PortZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
