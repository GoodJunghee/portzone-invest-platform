import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCalculator } from "@/components/PricingCalculator";
import { getServerDictionary } from "@/lib/i18n-server";

export const metadata = {
  title: "요금제 — 포트존",
};

export default function PricingPage() {
  const { t } = getServerDictionary();
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12 md:py-16">
        <div className="container-narrow">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
              {t.pricing.eyebrow}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl md:text-5xl">
              {t.pricing.title}
            </h1>
            <p className="mt-4 text-sm text-navy-600 md:text-lg">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="mt-10 md:mt-12">
            <PricingCalculator />
          </div>

          <div className="mx-auto mt-12 md:mt-16 max-w-3xl text-center text-xs text-navy-500">
            {t.pricing.footnote}
            <br />* 본 서비스 정보는 투자 참고용이며 최종 책임은 사용자 본인에게 있습니다.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
