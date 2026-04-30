import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Globe2, Bell, Shield, TrendingUp, Users, Sparkles } from "lucide-react";

export const metadata = {
  title: "회사 소개 — 포트존",
  description:
    "포트존은 투자자가 시장 정보에 휘둘리지 않고 자신만의 매매 원칙을 지킬 수 있도록 돕는 종목 추천 플랫폼입니다.",
  openGraph: {
    title: "회사 소개 — 포트존",
    description:
      "8개 시장의 단타·스윙·장타 시그널을 카카오 알림톡으로 빠르게.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-700 py-16 text-white md:py-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
                About PortZone
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                투자자에게 필요한 건 더 많은 정보가 아니라
                <br />
                <span className="text-gold-500">정확한 타이밍</span>입니다.
              </h1>
              <p className="mt-6 text-base text-navy-100 md:text-xl">
                포트존은 흩어진 시장 데이터를 분석해 진짜 매매 시그널만
                골라드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-white py-16 md:py-20">
          <div className="container-narrow max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
              Mission
            </div>
            <h2 className="mt-3 text-2xl font-bold text-navy-900 md:text-3xl">
              우리가 풀고 싶은 문제
            </h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-navy-700">
              <p>
                개인 투자자는 매일 수백 개의 종목 정보를 봅니다. 유튜브, 텔레그램,
                네이버 카페, 단톡방, 트위터…. 정보의 양은 충분하지만, 정작 결정을
                내려야 할 순간엔 무엇을 믿어야 할지 모르는 게 현실입니다.
              </p>
              <p>
                포트존은 <strong>매매에 직접 도움이 되는 정보</strong>만 골라
                정확한 타이밍에 알려드리는 것을 목표로 합니다. 8개 시장의
                실시간 데이터를 단타·스윙·장타 카테고리별로 정리해, 회원이
                자신만의 매매 원칙을 지키며 투자할 수 있도록 돕습니다.
              </p>
              <p>
                정보가 너무 많을 때 가장 필요한 건, 결국 <strong>정제된 한
                줄</strong>입니다.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-navy-50 py-16 md:py-20">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
                Values
              </div>
              <h2 className="mt-3 text-2xl font-bold text-navy-900 md:text-3xl">
                포트존이 일하는 방식
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <ValueCard
                icon={<Globe2 className="h-6 w-6" />}
                title="시장의 경계 없이"
                desc="국내 주식·해외 주식·코인을 한 플랫폼에서. 시장이 다르다고 분석 도구가 따로 있을 이유는 없습니다."
              />
              <ValueCard
                icon={<Bell className="h-6 w-6" />}
                title="놓치지 않게"
                desc="앱을 켜야만 볼 수 있는 정보는 무용합니다. 카카오톡으로 즉시 도착해 의사결정 시간을 단축합니다."
              />
              <ValueCard
                icon={<Shield className="h-6 w-6" />}
                title="투명하게"
                desc="가격은 다중선택 할인까지 미리 계산해서 보여드립니다. 결제 후 ‘몰랐어요’가 없도록."
              />
              <ValueCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="시간을 아끼게"
                desc="단타에 필요한 시그널 빈도와 장타의 호흡은 다릅니다. 카테고리를 분리해 본인의 호흡에 맞는 정보만."
              />
              <ValueCard
                icon={<Users className="h-6 w-6" />}
                title="책임감 있게"
                desc="모든 정보는 참고용임을 명확히 합니다. 투자는 본인의 책임이며, 우리는 그 결정을 더 쉽게 만들 뿐."
              />
              <ValueCard
                icon={<Sparkles className="h-6 w-6" />}
                title="군더더기 없이"
                desc="알림 한 통에 매수가·목표가·손절가까지. 추가 클릭 없이 바로 행동할 수 있게."
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16 md:py-20">
          <div className="container-narrow">
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-4">
              <Stat label="지원 시장" value="8" unit="개" />
              <Stat label="구독 카테고리" value="4" unit="종" />
              <Stat label="알림 채널" value="카카오" unit="알림톡" />
              <Stat label="무료 체험" value="7" unit="일" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy-900 py-16 text-white md:py-20">
          <div className="container-narrow text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              지금 바로 7일 무료 체험을 시작하세요
            </h2>
            <p className="mt-3 text-navy-200">
              결제 정보 없이 가입만으로 모든 시장 시그널을 7일간 받아볼 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-gold">
                무료로 시작하기
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                작동 방식 보기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ValueCard({
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
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy-900 text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">{desc}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-navy-100 p-6 text-center">
      <div className="text-xs uppercase tracking-wider text-navy-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline justify-center gap-1">
        <span className="text-3xl font-black text-navy-900 md:text-4xl">
          {value}
        </span>
        {unit && <span className="text-sm text-navy-500">{unit}</span>}
      </div>
    </div>
  );
}
