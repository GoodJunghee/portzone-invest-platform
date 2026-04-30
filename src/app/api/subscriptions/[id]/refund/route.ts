import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateRefund } from "@/lib/refund";
import { apiLimiter } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";
import { sanitizeText } from "@/lib/sanitize";

const Schema = z.object({
  reason: z.string().min(5).max(500),
});

interface Ctx {
  params: { id: string };
}

/**
 * 사용자가 환불 요청을 만든다.
 * 시스템이 환불 가능 금액을 자동 계산해 PENDING 상태로 등록.
 * 관리자가 승인 후 실제 PG 환불 처리는 PG 연동 단계에서 추가.
 */
export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인 필요" }, { status: 401 });
  }
  const rl = await apiLimiter(session.userId);
  if (!rl.success) {
    return NextResponse.json({ message: "잠시 후 다시 시도" }, { status: 429 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "사유를 5자 이상 입력해주세요" }, { status: 400 });
    }
    const reason = sanitizeText(parsed.data.reason);

    const sub = await prisma.subscription.findUnique({
      where: { id: params.id },
    });
    if (!sub || sub.userId !== session.userId) {
      return NextResponse.json({ message: "권한 없음" }, { status: 403 });
    }

    const calc = calculateRefund(sub);
    if (!calc.refundable) {
      return NextResponse.json(
        { message: calc.reason ?? "환불 불가" },
        { status: 400 }
      );
    }

    // 동일 구독에 PENDING 요청이 있으면 차단
    const dup = await prisma.refundRequest.findFirst({
      where: { subscriptionId: sub.id, status: "PENDING" },
    });
    if (dup) {
      return NextResponse.json(
        { message: "이미 검토 중인 환불 요청이 있습니다" },
        { status: 409 }
      );
    }

    const request = await prisma.refundRequest.create({
      data: {
        userId: session.userId,
        subscriptionId: sub.id,
        reason,
        amountKrw: calc.refundAmountKrw,
      },
    });

    return NextResponse.json({
      ok: true,
      requestId: request.id,
      calc,
    });
  } catch (err) {
    captureError(err, { route: "subscriptions/[id]/refund" });
    return NextResponse.json({ message: "환불 요청 처리 실패" }, { status: 500 });
  }
}
