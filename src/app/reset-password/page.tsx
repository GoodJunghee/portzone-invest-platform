import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata = { title: "비밀번호 재설정 — 포트존" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: Props) {
  const token = searchParams.token ?? "";
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-16">
        <div className="container-narrow max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold text-navy-900">비밀번호 재설정</h1>
            {!token ? (
              <>
                <p className="mt-3 text-sm text-navy-600">
                  유효하지 않은 링크입니다. 비밀번호 찾기를 다시 시도해주세요.
                </p>
                <Link href="/forgot-password" className="btn-primary mt-6 inline-flex">
                  비밀번호 찾기
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-navy-600">
                  새 비밀번호를 입력해주세요. (8자 이상)
                </p>
                <div className="mt-6">
                  <ResetPasswordForm token={token} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
