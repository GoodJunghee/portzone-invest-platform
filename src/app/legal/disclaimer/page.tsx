import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "투자 유의사항 — 포트존" };

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="bg-white py-16">
        <article className="container-narrow max-w-3xl">
          <div className="rounded-2xl border-2 border-gold-500 bg-gold-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-gold-600" />
              <div>
                <h2 className="text-lg font-bold text-navy-900">중요 — 반드시 읽어주세요</h2>
                <p className="mt-2 text-sm text-navy-700">
                  본 페이지의 내용은 회원이 서비스를 이용하기 전 반드시 숙지해야 할
                  사항입니다.
                </p>
              </div>
            </div>
          </div>

          <h1 className="mt-10 text-3xl font-bold text-navy-900">투자 유의사항</h1>

          <div className="prose prose-navy mt-6">
            <h2>1. 정보의 성격</h2>
            <p>
              포트존이 제공하는 모든 분석 보고서, 종목 추천, 시그널, 알림톡 메시지는{" "}
              <strong>투자 판단의 참고용 정보</strong>입니다. 특정 종목·자산의 매수/매도를
              권유하거나 보장하는 것이 아닙니다.
            </p>

            <h2>2. 투자 책임</h2>
            <p>
              모든 투자 결정과 그에 따른 손익은 <strong>회원 본인의 판단과 책임</strong>에
              있습니다. 회사는 회원의 투자 결과에 대해 어떠한 법적 책임도 지지 않습니다.
            </p>

            <h2>3. 투자 위험 고지</h2>
            <ul>
              <li>주식·코인 투자는 원금 손실의 위험이 있습니다.</li>
              <li>레버리지 투자(선물, 마진)는 원금을 초과하는 손실을 초래할 수 있습니다.</li>
              <li>코인 시장은 변동성이 매우 높으며 24시간 거래됩니다.</li>
              <li>해외 주식 투자는 환율 변동 위험이 추가됩니다.</li>
            </ul>

            <h2>4. 정보의 한계</h2>
            <ul>
              <li>분석 결과의 정확성·적시성·완전성을 보장하지 않습니다.</li>
              <li>과거 데이터를 기반으로 한 분석이며 미래 수익을 보장하지 않습니다.</li>
              <li>시장 상황은 예측 불가능한 외부 요인으로 급변할 수 있습니다.</li>
            </ul>

            <h2>5. 자본시장법 관련 고지</h2>
            <p>
              본 서비스는 「자본시장과 금융투자업에 관한 법률」상 투자자문업·투자일임업이
              아니며, 회원의 개별 재무 상황·투자 목적·투자 경험을 고려한 맞춤형 자문이
              아닙니다. 투자 자문이 필요한 경우 자격을 갖춘 투자자문업자에게 문의하시기
              바랍니다.
            </p>

            <h2>6. 권장 사항</h2>
            <ul>
              <li>본인의 재정 상태와 투자 목적에 맞춰 투자해주세요.</li>
              <li>잃어도 생활에 지장이 없는 자금으로 투자해주세요.</li>
              <li>분산 투자로 위험을 관리하세요.</li>
              <li>충분히 학습한 후 투자 판단을 내리세요.</li>
            </ul>

            <h2>7. 면책 동의</h2>
            <p>
              회원이 본 서비스에 가입하고 정보를 이용하는 것은 위 사항을 모두 이해하고
              동의함을 의미합니다.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
