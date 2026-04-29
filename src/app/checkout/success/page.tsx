import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "구독 신청 완료 — 포트존" };

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-50 py-20">
        <div className="container-narrow max-w-xl">
          <div className="card text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-500/10 text-mint-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-navy-900">
              구독 신청 완료
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              사전 등록이 완료되었습니다.
              <br />
              정식 결제는 PG 연동 완료 후 활성화되며,
              <br />
              결제 전까지는 <strong>PENDING</strong> 상태로 유지됩니다.
            </p>

            <div className="mt-8 flex flex-col gap-2">
              <Link href="/mypage" className="btn-primary">
                내 구독 정보 보기
              </Link>
              <Link href="/" className="btn-secondary">
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
