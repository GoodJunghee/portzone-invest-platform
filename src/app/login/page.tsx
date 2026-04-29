import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "로그인 — 포트존" };

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-16">
        <div className="container-narrow max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-navy-900">로그인</h1>
            <p className="mt-2 text-sm text-navy-600">
              포트존 계정으로 로그인하세요.
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
            <div className="mt-4 text-right text-xs">
              <Link href="/forgot-password" className="text-navy-600 hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <div className="mt-6 text-center text-sm text-navy-600">
              아직 계정이 없으신가요?{" "}
              <Link href="/signup" className="font-semibold text-navy-900 underline">
                무료 가입
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
