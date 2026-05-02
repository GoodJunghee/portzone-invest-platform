import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, MessageCircle, FileText, AlertTriangle, Clock } from "lucide-react";

export const metadata = {
  title: "고객지원 — 포트존",
  description:
    "포트존 서비스 이용 중 문의사항이 있으시다면 이메일·카카오톡으로 연락주세요.",
};

export default function SupportPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12 md:py-16">
        <div className="container-narrow max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
            Support
          </div>
          <h1 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">
            고객지원
          </h1>
          <p className="mt-2 text-sm text-navy-600 md:text-lg">
            서비스 이용 중 문의사항·불편사항이 있으시면 아래로 연락주세요.
          </p>

          {/* Contact channels */}
          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <ChannelCard
              icon={<Mail className="h-5 w-5" />}
              title="이메일 문의"
              desc="모든 일반 문의 / 환불·결제 문의"
              value="support@portzone.kr"
              href="mailto:support@portzone.kr"
              note="평일 24시간 내 응답"
            />
            <ChannelCard
              icon={<MessageCircle className="h-5 w-5" />}
              title="카카오톡 채널"
              desc="실시간 상담 (오픈 예정)"
              value="@portzone"
              note="채널 개설 후 안내 예정"
            />
            <ChannelCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="장애 신고"
              desc="서비스 이상·로그인 불가 등"
              value="incident@portzone.kr"
              href="mailto:incident@portzone.kr"
              note="긴급 사안 4시간 내 응답"
            />
          </section>

          {/* Operating hours */}
          <section className="mt-10">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-900">운영 시간</h2>
                  <p className="text-xs text-navy-500">
                    한국 표준시 (KST) 기준
                  </p>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 text-sm text-navy-700 md:grid-cols-2">
                <li className="flex justify-between border-b border-navy-100 py-2">
                  <span>평일 (월–금)</span>
                  <span className="font-semibold">10:00 — 18:00</span>
                </li>
                <li className="flex justify-between border-b border-navy-100 py-2">
                  <span>이메일 응답</span>
                  <span className="font-semibold">평일 24시간 내</span>
                </li>
                <li className="flex justify-between border-b border-navy-100 py-2">
                  <span>주말 / 공휴일</span>
                  <span className="font-semibold">휴무 (긴급 장애만)</span>
                </li>
                <li className="flex justify-between border-b border-navy-100 py-2 md:border-b-0">
                  <span>알림톡 발송 (운영)</span>
                  <span className="font-semibold">시장 시간 자동</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Self-service */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              먼저 확인해보세요
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <SelfHelpCard
                href="/faq"
                icon={<MessageCircle className="h-4 w-4" />}
                title="자주 묻는 질문 (FAQ)"
                desc="가입·결제·알림톡 수신 등 자주 묻는 내용"
              />
              <SelfHelpCard
                href="/how-it-works"
                icon={<FileText className="h-4 w-4" />}
                title="서비스 이용 가이드"
                desc="가입부터 알림톡 수신까지 단계별 안내"
              />
              <SelfHelpCard
                href="/legal/disclaimer"
                icon={<AlertTriangle className="h-4 w-4" />}
                title="투자 유의사항"
                desc="서비스 이용 전 반드시 읽어주세요"
              />
              <SelfHelpCard
                href="/mypage/account"
                icon={<FileText className="h-4 w-4" />}
                title="계정 설정"
                desc="비밀번호 변경 / 회원 탈퇴 / 이메일 인증"
              />
            </div>
          </section>

          {/* Notice */}
          <section className="mt-10">
            <div className="rounded-2xl border border-gold-500 bg-gold-500/5 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" />
                <div className="text-sm text-navy-700">
                  <strong className="block text-navy-900">투자 자문 문의는 답변이 불가합니다</strong>
                  <p className="mt-1 text-xs text-navy-600">
                    개별 종목의 매수/매도 시점, 투자 전략에 대한 1:1 자문은 자본시장법상
                    별도의 자격이 필요합니다. 관련 문의는 정식 투자자문업자에게 문의해주세요.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ChannelCard({
  icon,
  title,
  desc,
  value,
  href,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: string;
  href?: string;
  note: string;
}) {
  const Wrapper: React.ElementType = href ? "a" : "div";
  const props = href ? { href } : {};
  return (
    <Wrapper
      {...props}
      className="card transition hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-navy-900">{title}</h3>
      <p className="mt-1 text-xs text-navy-500">{desc}</p>
      <div className="mt-3 font-mono text-sm font-semibold text-navy-900 break-all">
        {value}
      </div>
      <div className="mt-2 text-[11px] text-navy-500">{note}</div>
    </Wrapper>
  );
}

function SelfHelpCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card transition hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-700">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-navy-900">{title}</div>
          <div className="mt-0.5 text-xs text-navy-600">{desc}</div>
        </div>
      </div>
    </Link>
  );
}
