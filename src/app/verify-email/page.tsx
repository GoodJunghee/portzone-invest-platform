import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerifyEmailClient } from "@/components/VerifyEmailClient";

export const metadata = { title: "이메일 인증 — 포트존" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: { token?: string };
}

export default function VerifyEmailPage({ searchParams }: Props) {
  const token = searchParams.token ?? "";
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-20">
        <div className="container-narrow max-w-md">
          <div className="card text-center">
            <h1 className="text-2xl font-bold text-navy-900">이메일 인증</h1>
            {token ? (
              <VerifyEmailClient token={token} />
            ) : (
              <>
                <p className="mt-4 text-sm text-navy-600">
                  이메일에 발송된 링크를 클릭해주세요.
                  <br />
                  메일을 받지 못하셨다면 인증 메일을 재발송할 수 있습니다.
                </p>
                <Link href="/mypage" className="btn-primary mt-6 inline-flex">
                  마이페이지로
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
