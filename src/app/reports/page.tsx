import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/db";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

export const metadata = { title: "보고서 — 포트존" };

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <h1 className="text-3xl font-bold text-navy-900">보고서</h1>
          <p className="mt-2 text-sm text-navy-600">
            구독 카테고리에 따라 열람 가능한 보고서가 달라집니다.
          </p>

          {reports.length === 0 ? (
            <div className="card mt-8 text-sm text-navy-500">
              등록된 보고서가 아직 없습니다. 관리자가 보고서를 업로드하면 이곳에 표시됩니다.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reports.map((r) => {
                const cat = CATEGORIES.find((c) => c.id === r.category);
                const mkt = ALL_MARKETS.find((m) => m.id === r.market);
                return (
                  <Link
                    key={r.id}
                    href={`/reports/${r.id}`}
                    className="card transition hover:shadow-card-hover"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-navy-900 px-2 py-0.5 text-white">
                        {cat?.name ?? r.category}
                      </span>
                      <span className="text-navy-500">{mkt?.name ?? r.market}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-navy-900 line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-xs text-navy-600 line-clamp-3">
                      {r.summary}
                    </p>
                    <div className="mt-3 text-[11px] text-navy-400">
                      {new Date(r.publishedAt).toLocaleDateString("ko-KR")}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
