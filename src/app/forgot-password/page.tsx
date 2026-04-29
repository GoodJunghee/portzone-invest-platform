import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata = { title: "비밀번호 찾기 — 포트존" };

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-16">
        <div className="container-narrow max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-navy-900">비밀번호 찾기</h1>
            <p className="mt-2 text-sm text-navy-600">
              가입 시 사용한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
            </p>
            <div className="mt-6">
              <ForgotPasswordForm />
            </div>
            <div className="mt-6 text-center text-sm text-navy-600">
              <Link href="/login" className="font-semibold text-navy-900 underline">
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
