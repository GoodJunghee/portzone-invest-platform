import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "페이지를 찾을 수 없습니다 — 포트존",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-20">
        <div className="container-narrow max-w-xl text-center">
          <div className="inline-block rounded-full bg-navy-900 px-4 py-1 text-xs font-bold text-white">
            404
          </div>
          <h1 className="mt-6 text-3xl font-bold text-navy-900 md:text-4xl">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-4 text-sm text-navy-600 md:text-base">
            주소가 변경되었거나 삭제된 페이지일 수 있습니다.
            <br />
            메인으로 이동해 다시 시도해주세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Link>
            <Link href="/pricing" className="btn-secondary">
              요금제 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-3 text-left">
            <Suggestion
              href="/blog"
              title="블로그"
              desc="시장 분석·투자 전략·뉴스·가이드"
            />
            <Suggestion
              href="/reports"
              title="보고서"
              desc="단타·스윙·장타 분석 보고서"
            />
            <Suggestion
              href="/legal/disclaimer"
              title="투자 유의사항"
              desc="서비스 이용 전 반드시 읽어주세요"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Suggestion({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center justify-between transition hover:shadow-card-hover"
    >
      <div>
        <div className="text-sm font-semibold text-navy-900">{title}</div>
        <div className="text-xs text-navy-600">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-navy-400" />
    </Link>
  );
}
