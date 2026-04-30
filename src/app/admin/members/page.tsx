import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { MemberSearch } from "@/components/admin/MemberSearch";

export const metadata = { title: "회원 관리 — 포트존 관리자" };
export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/mypage");

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <Link href="/admin" className="text-sm text-navy-500 hover:text-navy-900">
            ← 관리자 대시보드
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">회원 관리</h1>
          <p className="mt-1 text-sm text-navy-600">
            이름·이메일·전화로 검색하고 권한·인증·구독 상태로 필터링하세요.
          </p>

          <div className="mt-6">
            <MemberSearch />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
