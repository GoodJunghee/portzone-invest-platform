import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BlogAdminClient } from "@/components/admin/BlogAdminClient";

export const metadata = { title: "블로그 관리 — 포트존 관리자" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/mypage");

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <Link href="/admin" className="text-sm text-navy-500 hover:text-navy-900">
            ← 관리자 대시보드
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">블로그 관리</h1>
          <p className="mt-1 text-sm text-navy-600">
            SEO 콘텐츠로 유입을 늘리세요. 시장 분석, 투자 전략, 뉴스, 가이드.
          </p>

          <div className="mt-6">
            <BlogAdminClient
              posts={posts.map((p) => ({
                ...p,
                publishedAt: p.publishedAt?.toISOString() ?? null,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
              }))}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
