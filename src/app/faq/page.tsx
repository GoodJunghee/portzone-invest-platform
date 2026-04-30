import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "자주 묻는 질문 — 포트존",
  description:
    "포트존 가입·결제·알림톡·환불 등 자주 묻는 질문 모음.",
};

const SECTIONS = [
  {
    title: "가입 / 계정",
    items: [
      {
        q: "가입에 필요한 정보는 무엇인가요?",
        a: "이메일·이름·휴대폰 번호·비밀번호 4가지입니다. 휴대폰 번호는 카카오 알림톡 수신을 위해 반드시 정확히 입력해주세요.",
      },
      {
        q: "이메일 인증은 꼭 해야 하나요?",
        a: "네, 가입 시 이메일 인증이 필수입니다. 인증 메일이 도착하지 않으면 마이페이지 → 계정 설정에서 재발송할 수 있습니다.",
      },
      {
        q: "비밀번호를 잊었어요.",
        a: "로그인 페이지의 '비밀번호를 잊으셨나요?' 링크를 클릭하시면 가입한 이메일로 재설정 링크가 발송됩니다. 링크는 1시간 동안 유효합니다.",
      },
      {
        q: "회원 탈퇴는 어떻게 하나요?",
        a: "마이페이지 → 계정 설정 하단의 '회원 탈퇴'에서 진행할 수 있습니다. 비밀번호와 'DELETE' 입력으로 본인 확인 후 즉시 처리됩니다.",
      },
    ],
  },
  {
    title: "체험 / 구독",
    items: [
      {
        q: "무료 체험은 어떻게 시작하나요?",
        a: "가입 즉시 자동으로 7일 무료 체험이 부여됩니다. 결제 정보 없이도 모든 시장의 단타 시그널을 받아보실 수 있습니다.",
      },
      {
        q: "체험 기간이 끝나면 자동으로 결제되나요?",
        a: "아니요. 체험은 결제 정보 없이 시작하므로 자동결제가 절대 일어나지 않습니다. 체험 종료 후 정식 구독을 원하시면 요금제 페이지에서 직접 결제하시면 됩니다.",
      },
      {
        q: "시장을 여러 개 선택하면 가격이 어떻게 되나요?",
        a: "선택한 시장 수에 따라 자동으로 할인이 적용됩니다. 1~2개는 정상가, 3~4개는 10%, 5~7개는 15%, 8개 전체는 20% 할인됩니다.",
      },
      {
        q: "장타는 왜 연간 결제만 되나요?",
        a: "장타 카테고리는 1달~1년 단위 보유를 전제로 하며, 시그널 빈도가 낮아 운영 효율을 위해 연간 결제 전용으로 운영합니다.",
      },
      {
        q: "올인원 패키지는 어떤 혜택이 있나요?",
        a: "단타·스윙·장타 세 카테고리를 한 번에 구독하면 합계 가격에서 35% 추가 할인이 적용됩니다. 모든 매매 호흡에 대응해야 하는 경우 가장 저렴합니다.",
      },
    ],
  },
  {
    title: "알림톡",
    items: [
      {
        q: "알림톡은 어떻게 받나요?",
        a: "가입 시 등록한 휴대폰 번호로 카카오 알림톡이 자동 발송됩니다. 카카오톡 친구추가 없이도 수신 가능합니다.",
      },
      {
        q: "알림 시점을 조절할 수 있나요?",
        a: "네, 마이페이지 → 알림 설정에서 장시작 전·마감 전·긴급 시그널을 각각 ON/OFF로 조절할 수 있습니다. '관심종목만 받기' 옵션도 있습니다.",
      },
      {
        q: "알림톡이 오지 않아요.",
        a: "다음을 확인해주세요: ① 마이페이지에서 휴대폰 번호 정확 여부, ② 이메일 인증 완료 여부, ③ 카카오톡 정보성 메시지 차단 여부. 그래도 오지 않으면 support@portzone.kr 로 문의해주세요.",
      },
    ],
  },
  {
    title: "환불 / 결제",
    items: [
      {
        q: "환불은 어떻게 받나요?",
        a: "마이페이지 → 구독 카드의 '환불 요청' 버튼을 통해 신청합니다. 시스템이 자동으로 환불 가능 금액을 계산해 보여줍니다. 검토 후 승인되면 결제 수단으로 환불됩니다.",
      },
      {
        q: "환불 정책이 어떻게 되나요?",
        a: "결제 후 7일 이내 해지 시 100% 환불됩니다. 이후엔 사용한 일수만큼 일할 차감 후 잔여일에 비례한 금액이 환불됩니다. 무료 체험은 환불 대상이 아닙니다.",
      },
      {
        q: "구독 해지는 환불과 다른가요?",
        a: "네. 해지는 다음 결제일부터 자동결제를 중단하는 것이고, 환불은 이미 결제한 금액 중 잔여분을 돌려받는 것입니다. 즉시 사용 중단 + 환불을 원하시면 환불 요청을 사용하세요.",
      },
    ],
  },
  {
    title: "투자 / 책임",
    items: [
      {
        q: "투자 손실에 대한 책임은 어떻게 되나요?",
        a: "포트존이 제공하는 모든 정보는 투자 판단의 참고 자료입니다. 최종 투자 결정과 그에 따른 손익은 사용자 본인의 책임이며, 회사는 투자 결과에 대해 어떠한 책임도 지지 않습니다.",
      },
      {
        q: "추천 종목의 적중률은 얼마나 되나요?",
        a: "포트존은 적중률을 보장하지 않으며, 적중률 수치를 마케팅에 사용하지 않습니다. 모든 분석은 시장 데이터를 기반으로 한 시그널일 뿐, 미래 수익을 보장하는 정보가 아닙니다.",
      },
      {
        q: "이게 투자 자문 서비스인가요?",
        a: "아닙니다. 포트존은 자본시장법상 투자자문업이 아니며, 회원의 개별 재무 상황·투자 목적·투자 경험을 고려한 맞춤형 자문을 제공하지 않습니다. 정식 자문이 필요하시면 자격을 갖춘 투자자문업자에게 문의해주세요.",
      },
    ],
  },
  {
    title: "기술 / 기타",
    items: [
      {
        q: "다크 모드를 지원하나요?",
        a: "네. 헤더 우측의 ☀️/🌙/💻 버튼으로 라이트·다크·시스템 자동 3가지 모드를 선택할 수 있습니다.",
      },
      {
        q: "모바일 앱이 있나요?",
        a: "별도 앱은 없습니다. 다만 PWA(Progressive Web App) 지원으로 모바일 브라우저에서 '홈 화면에 추가'하면 앱처럼 사용할 수 있습니다.",
      },
      {
        q: "친구 초대 보상은 어떻게 받나요?",
        a: "마이페이지의 '친구 초대 보상' 카드에서 본인의 추천 코드와 가입 링크를 복사할 수 있습니다. 친구가 가입하면 양쪽에 1개월 무료 쿠폰이 발급됩니다(90일 유효).",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12 md:py-16">
        <div className="container-narrow max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
            FAQ
          </div>
          <h1 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">
            자주 묻는 질문
          </h1>
          <p className="mt-2 text-sm text-navy-600 md:text-lg">
            궁금한 게 있으면 먼저 여기서 찾아보세요.
          </p>

          <div className="mt-10 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-navy-900">{section.title}</h2>
                <div className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-navy-100 bg-white p-5 open:shadow-card"
                    >
                      <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-navy-900">
                        {item.q}
                        <span className="ml-4 text-navy-400 transition group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-navy-600">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-navy-200 bg-white p-6 text-center">
            <h2 className="text-base font-bold text-navy-900">
              찾는 답이 없으신가요?
            </h2>
            <p className="mt-2 text-sm text-navy-600">
              고객지원으로 직접 문의해주시면 빠르게 답변드립니다.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/support" className="btn-primary !py-2 !px-4 text-xs">
                고객지원으로
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
