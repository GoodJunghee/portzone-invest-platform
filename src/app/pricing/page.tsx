import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCalculator } from "@/components/PricingCalculator";

export const metadata = {
  title: "요금제 — 포트존",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-16">
        <div className="container-narrow">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
              Pricing
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-900 md:text-5xl">
              내가 받을 시장만 골라서.
            </h1>
            <p className="mt-4 text-base text-navy-600 md:text-lg">
              시장을 다중 선택하면 자동으로 할인이 적용됩니다.
              올인원은 단타+스윙+장타 통합 35% 할인.
            </p>
          </div>

          <div className="mt-12">
            <PricingCalculator />
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center text-xs text-navy-500">
            * 표시 가격은 부가세 포함. 결제는 정식 오픈 시 PG 연동 후 활성화됩니다.
            <br />* 본 서비스 정보는 투자 참고용이며 최종 책임은 사용자 본인에게 있습니다.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
