import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TemplatesClient } from "@/components/admin/TemplatesClient";

export const metadata = { title: "템플릿 관리 — 포트존 관리자" };
export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/mypage");

  const [reportTemplates, alimtalkTemplates] = await Promise.all([
    prisma.reportTemplate.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.alimtalkTemplate.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <Link href="/admin" className="text-sm text-navy-500 hover:text-navy-900">
            ← 관리자 대시보드
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">템플릿 관리</h1>
          <p className="mt-1 text-sm text-navy-600">
            자주 쓰는 보고서·알림톡 양식을 저장하고 빠르게 재사용하세요. 변수는{" "}
            <code className="rounded bg-navy-100 px-1.5">{`{{변수명}}`}</code>{" "}
            형식.
          </p>

          <TemplatesClient
            reportTemplates={reportTemplates.map((t) => ({
              ...t,
              createdAt: t.createdAt.toISOString(),
              updatedAt: t.updatedAt.toISOString(),
            }))}
            alimtalkTemplates={alimtalkTemplates.map((t) => ({
              ...t,
              createdAt: t.createdAt.toISOString(),
              updatedAt: t.updatedAt.toISOString(),
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
