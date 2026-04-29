import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

export const metadata = { title: "계정 설정 — 포트존" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow max-w-2xl">
          <Link href="/mypage" className="text-sm text-navy-500 hover:text-navy-900">
            ← 마이페이지
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">계정 설정</h1>

          {!user.emailVerified && (
            <div className="mt-6">
              <EmailVerificationBanner email={user.email} />
            </div>
          )}

          <section className="mt-8">
            <h2 className="mb-4 text-base font-bold text-navy-900">기본 정보</h2>
            <div className="card">
              <Row label="이름" value={user.name} />
              <Row label="이메일" value={user.email} />
              <Row label="휴대폰" value={user.phone} />
              <Row
                label="추천 코드"
                value={user.referralCode ?? "—"}
                hint="친구가 가입 시 입력하면 양쪽에 보너스 적용 (예정)"
              />
              <Row
                label="이메일 인증"
                value={user.emailVerified ? "완료" : "미완료"}
              />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-base font-bold text-navy-900">비밀번호 변경</h2>
            <div className="card">
              <ChangePasswordForm />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-base font-bold text-red-600">회원 탈퇴</h2>
            <div className="card border-red-200">
              <DeleteAccountForm />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between border-b border-navy-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-xs text-navy-500">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-navy-400">{hint}</div>}
      </div>
      <div className="font-medium text-navy-900">{value}</div>
    </div>
  );
}
