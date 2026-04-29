import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ReportDetailPage({ params }: Props) {
  const session = await getSession();
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return notFound();

  const cat = CATEGORIES.find((c) => c.id === report.category);
  const mkt = ALL_MARKETS.find((m) => m.id === report.market);

  return (
    <>
      <Header />
      <main className="bg-white py-12">
        <article className="container-narrow max-w-3xl">
          <Link
            href="/reports"
            className="text-sm text-navy-500 hover:text-navy-900"
          >
            ← 보고서 목록
          </Link>
          <div className="mt-6 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-navy-900 px-2.5 py-1 font-medium text-white">
              {cat?.name ?? report.category}
            </span>
            <span className="text-navy-500">{mkt?.name ?? report.market}</span>
            <span className="text-navy-400">·</span>
            <span className="text-navy-500">
              {new Date(report.publishedAt).toLocaleDateString("ko-KR")}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            {report.title}
          </h1>
          <p className="mt-4 text-base text-navy-600 md:text-lg">
            {report.summary}
          </p>

          <div className="my-8 border-t border-navy-100" />

          {!session ? (
            <div className="card border-2 border-dashed border-navy-200 bg-navy-50 text-center">
              <p className="text-sm text-navy-700">
                보고서 본문은 로그인 후 열람하실 수 있습니다.
              </p>
              <Link href="/login" className="btn-primary mt-4">
                로그인하기
              </Link>
            </div>
          ) : (
            <div
              className="prose max-w-none text-navy-800"
              dangerouslySetInnerHTML={{ __html: report.content }}
            />
          )}

          {report.fileUrl && session && (
            <a
              href={report.fileUrl}
              download
              className="btn-gold mt-8 inline-flex"
            >
              PDF 다운로드
            </a>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
