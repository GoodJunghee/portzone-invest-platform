import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReportSearch } from "@/components/ReportSearch";

export const metadata = { title: "보고서 — 포트존" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    q?: string;
    category?: string;
    market?: string;
    page?: string;
  };
}

export default function ReportsPage({ searchParams }: Props) {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <h1 className="text-3xl font-bold text-navy-900">보고서</h1>
          <p className="mt-2 text-sm text-navy-600">
            제목·요약 검색 + 카테고리/시장 필터로 원하는 보고서를 빠르게 찾아보세요.
          </p>

          <ReportSearch
            initialQ={searchParams.q ?? ""}
            initialCategory={searchParams.category ?? ""}
            initialMarket={searchParams.market ?? ""}
            initialPage={Number(searchParams.page ?? "1")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
