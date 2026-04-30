import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
  });
  if (!report) return { title: "보고서 — 포트존" };

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://portzone-invest-platform.vercel.app";

  return {
    title: `${report.title} — 포트존`,
    description: report.summary,
    alternates: { canonical: `${baseUrl}/reports/${report.id}` },
    openGraph: {
      title: report.title,
      description: report.summary,
      type: "article",
    },
  };
}

export default async function ReportDetailPage({ params }: Props) {
  const session = await getSession();
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return notFound();

  const cat = CATEGORIES.find((c) => c.id === report.category);
  const mkt = ALL_MARKETS.find((m) => m.id === report.market);

  // 비로그인이라도 isPublic 보고서는 본문 공개 (마케팅용 샘플)
  const canRead = !!session || report.isPublic;

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
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-navy-900 px-2.5 py-1 font-medium text-white">
              {cat?.name ?? report.category}
            </span>
            <span className="text-navy-500">{mkt?.name ?? report.market}</span>
            <span className="text-navy-400">·</span>
            <span className="text-navy-500">
              {new Date(report.publishedAt).toLocaleDateString("ko-KR")}
            </span>
            {report.isPublic && (
              <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                🎁 무료 샘플
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            {report.title}
          </h1>
          <p className="mt-4 text-base text-navy-600 md:text-lg">
            {report.summary}
          </p>

          <div className="my-8 border-t border-navy-100" />

          {!canRead ? (
            <div className="card border-2 border-dashed border-navy-200 bg-navy-50 text-center">
              <p className="text-sm text-navy-700">
                보고서 본문은 로그인 후 열람하실 수 있습니다.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Link href="/login" className="btn-primary">
                  로그인하기
                </Link>
                <Link href="/signup" className="btn-secondary">
                  무료 가입
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div
                className="prose max-w-none text-navy-800"
                dangerouslySetInnerHTML={{ __html: report.content }}
              />

              {report.fileUrl && (
                <a
                  href={report.fileUrl}
                  download
                  className="btn-gold mt-8 inline-flex"
                >
                  PDF 다운로드
                </a>
              )}

              {!session && report.isPublic && (
                <div className="mt-12 rounded-2xl border border-navy-200 bg-navy-50 p-6 text-center">
                  <h2 className="text-base font-bold text-navy-900">
                    더 많은 종목 시그널이 필요하신가요?
                  </h2>
                  <p className="mt-2 text-sm text-navy-600">
                    7일 무료 체험으로 8개 시장의 단타 시그널을 받아보세요.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Link href="/signup" className="btn-primary !py-2 !px-4 text-xs">
                      무료 가입
                    </Link>
                    <Link
                      href="/pricing"
                      className="btn-secondary !py-2 !px-4 text-xs"
                    >
                      요금제 보기
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
