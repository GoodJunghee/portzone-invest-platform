import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatKRW } from "@/lib/pricing";
import { RefundActionButtons } from "@/components/admin/RefundActionButtons";

export const metadata = { title: "환불 관리 — 포트존 관리자" };
export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/mypage");

  const requests = await prisma.refundRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: true, subscription: true },
    take: 100,
  });

  return (
    <>
      <Header />
      <main className="bg-navy-50 py-12">
        <div className="container-narrow">
          <Link href="/admin" className="text-sm text-navy-500 hover:text-navy-900">
            ← 관리자 대시보드
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">환불 요청 관리</h1>

          <div className="mt-8 card overflow-x-auto">
            {requests.length === 0 ? (
              <p className="text-sm text-navy-500">접수된 환불 요청이 없습니다.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-left text-xs text-navy-500">
                    <th className="py-2 font-medium">상태</th>
                    <th className="py-2 font-medium">회원</th>
                    <th className="py-2 font-medium">구독</th>
                    <th className="py-2 font-medium">환불액</th>
                    <th className="py-2 font-medium">사유</th>
                    <th className="py-2 font-medium">요청일</th>
                    <th className="py-2 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3">
                        <Status status={r.status} />
                      </td>
                      <td className="py-3 text-navy-800">
                        <div className="font-medium">{r.user.name}</div>
                        <div className="text-[11px] text-navy-500">{r.user.email}</div>
                      </td>
                      <td className="py-3 text-navy-700">
                        <div>{r.subscription.category}</div>
                        <div className="text-[11px] text-navy-500">
                          {r.subscription.billingType} · {formatKRW(r.subscription.priceKrw)}
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-navy-900">
                        {formatKRW(r.amountKrw)}
                      </td>
                      <td className="py-3 max-w-xs text-xs text-navy-700">
                        <div className="line-clamp-3">{r.reason}</div>
                      </td>
                      <td className="py-3 text-xs text-navy-500">
                        {new Date(r.createdAt).toLocaleString("ko-KR")}
                      </td>
                      <td className="py-3">
                        {r.status === "PENDING" ? (
                          <RefundActionButtons id={r.id} />
                        ) : (
                          <span className="text-[11px] text-navy-400">완료</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Status({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-gold-500 text-navy-900",
    APPROVED: "bg-mint-500 text-white",
    REJECTED: "bg-red-500 text-white",
    REFUNDED: "bg-navy-900 text-white",
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
