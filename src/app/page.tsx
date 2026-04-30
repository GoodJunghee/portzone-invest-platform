import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";
import { getServerDictionary } from "@/lib/i18n-server";
import { ArrowRight, Bell, FileText, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  const { t } = getServerDictionary();
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold-500 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-mint-500 blur-3xl" />
          </div>
          <div className="container-narrow relative py-16 md:py-28">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                {t.hero.badge}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-6xl">
                {t.hero.title1}
                <br />
                <span className="text-gold-500">{t.hero.title2}</span>
                {t.hero.title3}
              </h1>
              <p className="mt-6 max-w-2xl text-base text-navy-100 md:text-xl">
                {t.hero.subtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/pricing" className="btn-gold">
                  {t.hero.ctaPricing}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  {t.hero.ctaSignup}
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 text-sm md:grid-cols-4">
                <Stat label={t.hero.statMarkets} value={t.hero.statMarketsValue} />
                <Stat label={t.hero.statCategories} value={t.hero.statCategoriesValue} />
                <Stat label={t.hero.statChannel} value={t.hero.statChannelValue} />
                <Stat label={t.hero.statStage} value={t.hero.statStageValue} />
              </div>
            </div>
          </div>
        </section>

        {/* Markets */}
        <section className="bg-white py-16 md:py-20">
          <div className="container-narrow">
            <SectionHeader
              eyebrow={t.marketSection.eyebrow}
              title={t.marketSection.title}
              desc={t.marketSection.desc}
            />
            <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2">
              <MarketGroupCard
                title={t.marketSection.stockTitle}
                items={ALL_MARKETS.filter((m) => m.group === "STOCK")}
                accent="navy"
              />
              <MarketGroupCard
                title={t.marketSection.cryptoTitle}
                items={ALL_MARKETS.filter((m) => m.group === "CRYPTO")}
                accent="gold"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-navy-50 py-16 md:py-20">
          <div className="container-narrow">
            <SectionHeader
              eyebrow={t.categorySection.eyebrow}
              title={t.categorySection.title}
              desc={t.categorySection.desc}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 md:grid-cols-4">
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  className="card transition hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-navy-900">
                      {c.name}
                    </span>
                    <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-700">
                      {c.holdPeriod}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-navy-600">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/pricing" className="btn-primary">
                {t.categorySection.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-16 md:py-20">
          <div className="container-narrow">
            <SectionHeader
              eyebrow={t.features.eyebrow}
              title={t.features.title}
              desc={t.features.desc}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 md:grid-cols-3 md:gap-6">
              <FeatureCard
                icon={<Bell className="h-6 w-6" />}
                title="카카오 알림톡"
                desc="장시작 전·마감 전, 그리고 주요 시그널 발생 시 즉시 알림. 놓칠 일 없습니다."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="심층 보고서"
                desc="추천 근거, 진입가, 목표가, 손절가까지. 단순 시그널이 아닌 분석 보고서."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="다중 시장 통합"
                desc="국내 주식부터 글로벌 코인까지. 8개 시장을 한 구독으로 관리."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="투명한 가격 정책"
                desc="선택한 시장 수에 따른 자동 할인. 숨겨진 비용 없이 명확하게."
              />
              <FeatureCard
                icon={<Bell className="h-6 w-6" />}
                title="카테고리별 분리 발송"
                desc="단타 구독자에겐 단타 알림만. 본인이 받기로 한 정보만 정확히."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="누적 데이터"
                desc="과거 보고서와 시그널을 마이페이지에서 언제든 다시 확인."
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-navy-50 py-16 md:py-20">
          <div className="container-narrow max-w-4xl">
            <SectionHeader
              eyebrow={t.faq.eyebrow}
              title={t.faq.title}
              desc={t.faq.desc}
            />
            <div className="mt-10 space-y-3 md:mt-12">
              <FaqItem
                q="알림톡은 어떻게 받나요?"
                a="가입 시 등록한 휴대폰 번호로 카카오 알림톡이 자동 발송됩니다. 카카오톡 친구추가 없이도 수신 가능합니다."
              />
              <FaqItem
                q="시장을 여러 개 선택하면 가격이 어떻게 되나요?"
                a="선택한 시장 수에 따라 자동으로 할인이 적용됩니다. 3~4개는 10%, 5~7개는 15%, 8개 전체 선택 시 20% 할인됩니다."
              />
              <FaqItem
                q="장타는 왜 연간 결제만 되나요?"
                a="장타 카테고리는 1달~1년 단위 보유를 전제로 하며, 시그널 빈도가 낮아 운영 효율을 위해 연간 결제 전용으로 운영합니다."
              />
              <FaqItem
                q="투자 손실에 대한 책임은 어떻게 되나요?"
                a="포트존이 제공하는 모든 정보는 투자 판단의 참고 자료입니다. 최종 투자 결정과 그에 따른 손익은 사용자 본인의 책임입니다."
              />
              <FaqItem
                q="구독 해지는 언제든 가능한가요?"
                a="네, 마이페이지에서 언제든지 해지할 수 있습니다. 해지 시 다음 결제일부터 자동결제가 중단됩니다."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-navy-900 py-16 md:py-20 text-white">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t.finalCta.title}
            </h2>
            <p className="mt-4 text-navy-200">{t.finalCta.subtitle}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-gold">
                {t.hero.ctaSignup}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                {t.common.pricing}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white md:text-3xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-navy-200">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm text-navy-600 md:text-lg">{desc}</p>
    </div>
  );
}

function MarketGroupCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: ReadonlyArray<{ id: string; name: string; region: string }>;
  accent: "navy" | "gold";
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-navy-900">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            accent === "navy"
              ? "bg-navy-900 text-white"
              : "bg-gold-500 text-navy-900"
          }`}
        >
          {items.length}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {items.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-navy-100 bg-navy-50 p-4"
          >
            <div className="text-sm font-semibold text-navy-900">{m.name}</div>
            <div className="mt-1 text-xs text-navy-500">{m.region}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="card transition hover:-translate-y-1 hover:shadow-card-hover">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-navy-100 bg-white p-5 open:shadow-card">
      <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-navy-900">
        {q}
        <span className="ml-4 text-navy-400 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-navy-600">{a}</p>
    </details>
  );
}
