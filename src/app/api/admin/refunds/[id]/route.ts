import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { captureError } from "@/lib/sentry";

const Schema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().max(500).optional(),
});

interface Ctx {
  params: { id: string };
}

/**
 * 관리자: 환불 요청 승인/거절
 * - APPROVE: refund request 상태 APPROVED + subscription 상태 REFUNDED + refundedAt 기록
 *   (실제 PG 환불은 PG 연동 단계에서 추가)
 * - REJECT: refund request 상태 REJECTED
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }
    const { action, note } = parsed.data;
    const cleanNote = note ? sanitizeText(note) : null;

    const request = await prisma.refundRequest.findUnique({
      where: { id: params.id },
    });
    if (!request) return NextResponse.json({ message: "요청 없음" }, { status: 404 });
    if (request.status !== "PENDING") {
      return NextResponse.json({ message: "이미 처리된 요청" }, { status: 400 });
    }

    if (action === "APPROVE") {
      const now = new Date();
      await prisma.$transaction([
        prisma.refundRequest.update({
          where: { id: request.id },
          data: {
            status: "APPROVED",
            reviewedAt: now,
            reviewedBy: session.userId,
            reviewNote: cleanNote,
            refundedAt: now,
          },
        }),
        prisma.subscription.update({
          where: { id: request.subscriptionId },
          data: {
            status: "REFUNDED",
            refundedAt: now,
            refundAmountKrw: request.amountKrw,
            cancelledAt: now,
          },
        }),
      ]);
      // TODO: 실제 PG 환불 호출 (PG 연동 시 추가)
    } else {
      await prisma.refundRequest.update({
        where: { id: request.id },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: session.userId,
          reviewNote: cleanNote,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { route: "admin/refunds/[id]" });
    return NextResponse.json({ message: "처리 실패" }, { status: 500 });
  }
}
