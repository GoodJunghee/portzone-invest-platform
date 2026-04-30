import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n-server";

export function Footer() {
  const { t } = getServerDictionary();
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
                <Link href="/#faq" className="hover:text-navy-900">
                  {t.common.faq}
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
          <div>
            <h4 className="text-sm font-semibold text-navy-900">{t.footer.notice}</h4>
            <p className="mt-3 text-xs leading-relaxed text-navy-500">
              {t.footer.noticeBody}
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
