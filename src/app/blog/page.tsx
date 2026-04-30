import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogList } from "@/components/BlogList";

export const metadata = {
  title: "블로그 — 포트존",
  description:
    "주식·코인 시장 분석, 투자 전략, 시장 뉴스, 투자 가이드를 한 곳에서.",
  openGraph: {
    title: "포트존 블로그",
    description: "주식·코인 시장 분석과 투자 전략",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; category?: string; page?: string };
}

export default function BlogIndexPage({ searchParams }: Props) {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-wider text-gold-600">
              Insights
            </div>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">
              포트존 블로그
            </h1>
            <p className="mt-2 text-sm text-navy-600 md:text-lg">
              시장 분석 · 투자 전략 · 뉴스 · 가이드
            </p>
          </div>

          <BlogList
            initialQ={searchParams.q ?? ""}
            initialCategory={searchParams.category ?? ""}
            initialPage={Number(searchParams.page ?? "1")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
