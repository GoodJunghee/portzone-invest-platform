import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportUploadForm } from "@/components/admin/ReportUploadForm";
import { AlimtalkTriggerForm } from "@/components/admin/AlimtalkTriggerForm";
import { AlimtalkScheduleForm } from "@/components/admin/AlimtalkScheduleForm";
import { ALL_MARKETS, CATEGORIES } from "@/lib/constants";
import { formatKRW } from "@/lib/pricing";
import { getStats } from "@/lib/stats";

export const metadata = { title: "관리자 — 포트존" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/mypage");

  const [stats, users, reports, recentNotifs, jobs] = await Promise.all([
    getStats(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { subscriptions: true },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.alimtalkJob.findMany({
      orderBy: { scheduledAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-navy-900">관리자 대시보드</h1>
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-navy-900">
              ADMIN
            </span>
          </div>

          {/* Revenue KPI */}
          <section className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-500">
              매출 지표
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Kpi label="MRR" value={formatKRW(stats.mrr)} accent="navy" />
              <Kpi label="ARR (예측)" value={formatKRW(stats.arr)} accent="gold" />
              <Kpi label="활성 구독" value={String(stats.activeSubs)} />
              <Kpi label="대기 구독" value={String(stats.pendingSubs)} />
            </div>
          </section>

          {/* User KPI */}
          <section className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-500">
              회원 / 운영
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Kpi label="총 회원" value={String(stats.totalUsers)} />
              <Kpi label="신규 (7일)" value={`+${stats.newUsers7d}`} accent="mint" />
              <Kpi label="총 보고서" value={String(stats.totalReports)} />
              <Kpi label="해지 누적" value={String(stats.cancelledSubs)} />
            </div>
          </section>

          {/* Notif KPI */}
          <section className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-500">
              알림톡 운영
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Kpi label="발송 (30일)" value={String(stats.notifSent)} accent="mint" />
              <Kpi label="대기" value={String(stats.notifQueued)} />
              <Kpi label="실패" value={String(stats.notifFailed)} accent="red" />
              <Kpi
                label="발송률"
                value={
                  stats.notifSent + stats.notifFailed > 0
                    ? `${Math.round(
                        (stats.notifSent /
                          (stats.notifSent + stats.notifFailed)) *
                          100
                      )}%`
                    : "—"
                }
              />
            </div>
          </section>

          {/* Report upload */}
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              보고서 업로드
            </h2>
            <div className="card">
              <ReportUploadForm />
            </div>
          </section>

          {/* Alimtalk: 즉시 발송 */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              알림톡 즉시 발송
            </h2>
            <div className="card">
              <AlimtalkTriggerForm />
            </div>
          </section>

          {/* Alimtalk: 예약 발송 */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              알림톡 예약 발송
            </h2>
            <div className="card">
              <AlimtalkScheduleForm />
            </div>
          </section>

          {/* Schedule list */}
          {jobs.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-navy-900">
                예약된 발송 잡
              </h2>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-100 text-left text-xs text-navy-500">
                      <th className="py-2 font-medium">상태</th>
                      <th className="py-2 font-medium">예정 시각</th>
                      <th className="py-2 font-medium">대상</th>
                      <th className="py-2 font-medium">제목</th>
                      <th className="py-2 font-medium">발송</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {jobs.map((j) => (
                      <tr key={j.id}>
                        <td className="py-3">
                          <JobStatus status={j.status} />
                        </td>
                        <td className="py-3 text-navy-700">
                          {new Date(j.scheduledAt).toLocaleString("ko-KR")}
                        </td>
                        <td className="py-3 text-navy-700">
                          {j.category} · {j.market}
                        </td>
                        <td className="py-3 text-navy-900 max-w-xs truncate">
                          {j.title}
                        </td>
                        <td className="py-3 text-navy-700">
                          {j.sentCount}/{j.totalCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Members */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">회원 목록</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-left text-xs text-navy-500">
                    <th className="py-2 font-medium">이름</th>
                    <th className="py-2 font-medium">이메일</th>
                    <th className="py-2 font-medium">전화</th>
                    <th className="py-2 font-medium">구독 수</th>
                    <th className="py-2 font-medium">가입일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-medium text-navy-900">
                        {u.name}
                      </td>
                      <td className="py-3 text-navy-700">{u.email}</td>
                      <td className="py-3 text-navy-700">{u.phone}</td>
                      <td className="py-3 text-navy-700">
                        {u.subscriptions.length}
                      </td>
                      <td className="py-3 text-navy-500">
                        {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent reports */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              최근 등록 보고서
            </h2>
            <div className="card">
              {reports.length === 0 ? (
                <p className="text-sm text-navy-500">없음</p>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {reports.map((r) => {
                    const cat = CATEGORIES.find((c) => c.id === r.category);
                    const mkt = ALL_MARKETS.find((m) => m.id === r.market);
                    return (
                      <li
                        key={r.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-navy-900">
                            {r.title}
                          </div>
                          <div className="text-xs text-navy-500">
                            {cat?.name} · {mkt?.name} ·{" "}
                            {new Date(r.publishedAt).toLocaleDateString(
                              "ko-KR"
                            )}{" "}
                            {r.fileUrl && "· PDF"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Recent notifs */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              최근 알림 발송 로그
            </h2>
            <div className="card">
              {recentNotifs.length === 0 ? (
                <p className="text-sm text-navy-500">없음</p>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {recentNotifs.map((n) => (
                    <li key={n.id} className="py-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-navy-900">
                          {n.title}
                        </span>
                        <span
                          className={
                            n.status === "SENT"
                              ? "rounded-full bg-mint-500 px-2 py-0.5 text-[10px] font-bold text-white"
                              : "rounded-full bg-navy-200 px-2 py-0.5 text-[10px] font-bold text-navy-700"
                          }
                        >
                          {n.status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-navy-600 line-clamp-1">
                        {n.message}
                      </div>
                      <div className="mt-0.5 text-[11px] text-navy-400">
                        {n.category} · {n.market} ·{" "}
                        {new Date(n.createdAt).toLocaleString("ko-KR")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "navy" | "gold" | "mint" | "red";
}) {
  const accentClass = {
    navy: "text-navy-900",
    gold: "text-gold-600",
    mint: "text-mint-600",
    red: "text-red-600",
  }[accent ?? "navy"];

  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-navy-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-black md:text-3xl ${accentClass}`}>
        {value}
      </div>
    </div>
  );
}

function JobStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: "bg-navy-200 text-navy-800",
    RUNNING: "bg-gold-500 text-navy-900",
    COMPLETED: "bg-mint-500 text-white",
    FAILED: "bg-red-500 text-white",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        map[status] ?? "bg-navy-100 text-navy-700"
      }`}
    >
      {status}
    </span>
  );
}
