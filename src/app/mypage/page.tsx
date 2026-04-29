import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { WatchlistPanel } from "@/components/WatchlistPanel";

export const metadata = { title: "마이페이지 — 포트존" };
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, subs, notifs, accessibleReports, watchlist] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.subscription.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notificationLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.report.findMany({
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    prisma.watchlist.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">마이페이지</h1>
              <p className="mt-1 text-sm text-navy-600">
                {user.name}님 환영합니다 · {user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/mypage/preferences"
                className="btn-secondary !py-2 !px-4"
              >
                알림 설정
              </Link>
              <LogoutButton />
            </div>
          </div>

          {/* Subscription */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900">내 구독 정보</h2>
              <Link href="/pricing" className="text-sm font-semibold text-navy-900 hover:underline">
                + 구독 추가
              </Link>
            </div>
            {subs.length === 0 ? (
              <div className="card text-center">
                <p className="text-sm text-navy-600">
                  아직 구독중인 요금제가 없습니다.
                </p>
                <Link href="/pricing" className="btn-primary mt-4">
                  요금제 둘러보기
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subs.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    sub={{
                      ...s,
                      startDate: s.startDate?.toISOString() ?? null,
                      endDate: s.endDate?.toISOString() ?? null,
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Watchlist */}
          <section className="mt-10">
            <WatchlistPanel
              items={watchlist.map((w) => ({
                ...w,
                createdAt: w.createdAt.toISOString(),
              }))}
            />
          </section>

          {/* Notifications */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              최근 알림 내역
            </h2>
            <div className="card">
              {notifs.length === 0 ? (
                <p className="text-sm text-navy-500">발송된 알림이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {notifs.map((n) => (
                    <li key={n.id} className="flex items-start gap-4 py-3">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-mint-500"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-navy-900">
                            {n.title}
                          </span>
                          <span className="text-xs text-navy-500">
                            {n.sentAt
                              ? new Date(n.sentAt).toLocaleString("ko-KR")
                              : "대기중"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-navy-600 line-clamp-2">
                          {n.message}
                        </div>
                        <div className="mt-1.5 text-[11px] text-navy-500">
                          {n.category} · {n.market}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Reports */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">최신 보고서</h2>
            {accessibleReports.length === 0 ? (
              <div className="card text-sm text-navy-500">
                등록된 보고서가 아직 없습니다.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {accessibleReports.map((r) => (
                  <Link
                    key={r.id}
                    href={`/reports/${r.id}`}
                    className="card transition hover:shadow-card-hover"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-navy-900 px-2 py-0.5 text-white">
                        {r.category}
                      </span>
                      <span className="text-navy-500">{r.market}</span>
                      {r.fileUrl && (
                        <span className="rounded-full bg-gold-500 px-2 py-0.5 text-navy-900">
                          PDF
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-base font-bold text-navy-900 line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-xs text-navy-600 line-clamp-2">
                      {r.summary}
                    </p>
                    <div className="mt-3 text-[11px] text-navy-400">
                      {new Date(r.publishedAt).toLocaleDateString("ko-KR")}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
