import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  UserPlus,
  Sparkles,
  Settings,
  Bell,
  FileText,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "이용 가이드 — 포트존",
  description:
    "가입부터 알림톡 수신까지. 포트존 서비스 이용 단계별 안내.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-white py-16 md:py-20">
          <div className="container-narrow max-w-3xl text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
              How it works
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
              5단계로 끝나는 시작
            </h1>
            <p className="mt-4 text-base text-navy-600 md:text-lg">
              가입부터 첫 알림톡 수신까지 평균 3분이면 충분합니다.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-navy-50 py-16 md:py-20">
          <div className="container-narrow max-w-3xl">
            <ol className="space-y-6">
              <Step
                num={1}
                icon={<UserPlus className="h-5 w-5" />}
                title="회원가입"
                desc="이메일·이름·휴대폰 번호로 30초 가입. 이메일 인증을 마치면 7일 무료 체험이 자동으로 시작됩니다."
                details={[
                  "휴대폰 번호는 카카오 알림톡 수신용으로만 사용",
                  "추천 코드 입력 시 양쪽에 1개월 무료 쿠폰 발급",
                  "가입 즉시 7일 무료 체험 자동 활성화",
                ]}
              />
              <Step
                num={2}
                icon={<Sparkles className="h-5 w-5" />}
                title="무료 체험"
                desc="가입한 모든 회원에게 자동으로 7일 무료 체험이 부여됩니다. 결제 정보 없이 모든 시장의 단타 시그널을 받아볼 수 있습니다."
                details={[
                  "7일간 8개 시장 단타 시그널 미리보기",
                  "기간 종료 시 자동으로 무료 만료 (자동결제 없음)",
                  "체험 중 언제든 정식 구독 전환 가능",
                ]}
              />
              <Step
                num={3}
                icon={<Settings className="h-5 w-5" />}
                title="요금제 선택"
                desc="단타·스윙·장타·올인원 중 카테고리를 고르고, 8개 시장에서 원하는 시장을 다중 선택합니다. 시장 개수에 따라 자동 할인이 적용됩니다."
                details={[
                  "카테고리별 호흡에 맞춰 시그널 빈도 조절",
                  "시장 3개 이상 선택 시 10% 할인 (8개 전체 20%)",
                  "연간 결제 시 2개월 무료 (월 × 10)",
                ]}
              />
              <Step
                num={4}
                icon={<Bell className="h-5 w-5" />}
                title="알림 설정"
                desc="언제 어떤 알림을 받을지 직접 정합니다. 장시작 전·마감 전·긴급 시그널, 그리고 관심종목만 받기까지."
                details={[
                  "장시작 전 30분, 장마감 전 30분 자동 알림",
                  "관심종목 등록 후 매치 시 우선 알림 (HIGH 표시)",
                  "필요 없는 시점은 OFF로 끌 수 있음",
                ]}
              />
              <Step
                num={5}
                icon={<FileText className="h-5 w-5" />}
                title="실행"
                desc="알림톡으로 바로 매수가·목표가·손절가까지 받습니다. 더 깊이 보고 싶으면 마이페이지의 보고서로."
                details={[
                  "한 통의 알림톡에 핵심 정보 모두 포함",
                  "PDF 첨부 보고서로 분석 근거까지 확인",
                  "마이페이지에서 과거 시그널·보고서 누적 확인",
                ]}
              />
            </ol>

            <div className="mt-12 rounded-2xl bg-navy-900 p-8 text-center text-white">
              <h2 className="text-xl font-bold">3분 가입, 7일 무료 체험</h2>
              <p className="mt-2 text-sm text-navy-200">
                결제 정보 없이 시작하세요. 체험 종료 후 자동결제도 없습니다.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/signup" className="btn-gold">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  요금제 보기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Step({
  num,
  icon,
  title,
  desc,
  details,
}: {
  num: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  details: string[];
}) {
  return (
    <li className="card relative">
      <div className="absolute -left-3 -top-3 grid h-10 w-10 place-items-center rounded-xl bg-gold-500 text-base font-black text-navy-900 shadow-card">
        {num}
      </div>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-navy-900">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy-700">{desc}</p>
      <ul className="mt-3 space-y-1.5">
        {details.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-navy-600">
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-gold-500"></span>
            {d}
          </li>
        ))}
      </ul>
    </li>
  );
}
