import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignupForm } from "@/components/SignupForm";

export const metadata = { title: "회원가입 — 포트존" };

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-16">
        <div className="container-narrow max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-navy-900">회원가입</h1>
            <p className="mt-2 text-sm text-navy-600">
              가입하시면 카카오 알림톡으로 추천 종목을 받아보실 수 있습니다.
            </p>
            <div className="mt-6">
              <SignupForm />
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
