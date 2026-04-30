import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignupForm } from "@/components/SignupForm";

export const metadata = { title: "회원가입 — 포트존" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: { ref?: string };
}

export default function SignupPage({ searchParams }: Props) {
  const refCode = (searchParams.ref ?? "").toUpperCase().slice(0, 20);
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-16">
        <div className="container-narrow max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-navy-900">회원가입</h1>
            <p className="mt-2 text-sm text-navy-600">
              가입 시 7일 무료 체험과 카카오 알림톡 수신이 자동 활성화됩니다.
            </p>
            {refCode && (
              <div className="mt-4 rounded-lg bg-gold-500/10 p-3 text-xs text-navy-700">
                🎁 추천 코드 <code className="font-bold">{refCode}</code>가 적용됩니다.
                가입 후 양쪽에 1개월 무료 쿠폰이 발급됩니다.
              </div>
            )}
            <div className="mt-6">
              <SignupForm initialReferralCode={refCode} />
            </div>
            <div className="mt-6 text-center text-sm text-navy-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-semibold text-navy-900 underline">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
