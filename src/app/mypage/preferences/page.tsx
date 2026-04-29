import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PreferencesForm } from "@/components/PreferencesForm";

export const metadata = { title: "알림 설정 — 포트존" };

export default async function PreferencesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const pref = await prisma.notifyPreference.findUnique({
    where: { userId: session.userId },
  });

  const initial = pref ?? {
    alimtalkEnabled: true,
    emailEnabled: true,
    preMarketOpen: true,
    preMarketClose: true,
    urgentSignal: true,
  };

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow max-w-2xl">
          <Link href="/mypage" className="text-sm text-navy-500 hover:text-navy-900">
            ← 마이페이지
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">알림 설정</h1>
          <p className="mt-2 text-sm text-navy-600">
            알림 채널과 수신 시점을 직접 조절할 수 있습니다.
          </p>

          <div className="mt-8 card">
            <PreferencesForm initial={initial} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
