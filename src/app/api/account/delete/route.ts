import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  clearSessionCookie,
  getSession,
  verifyPassword,
} from "@/lib/auth";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const Schema = z.object({
  password: z.string().min(1),
  confirm: z.literal("DELETE"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "로그인 필요" }, { status: 401 });

  const rl = await authLimiter(getClientIp(req) + ":" + session.userId);
  if (!rl.success) {
    return NextResponse.json({ message: "잠시 후 다시 시도해주세요" }, { status: 429 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "확인 문구와 비밀번호를 정확히 입력해주세요" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ message: "사용자 없음" }, { status: 404 });

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    // 소프트 삭제: deletedAt 설정 + 활성 구독 해지
    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          deletedAt: now,
          email: `deleted-${user.id}@deleted.local`, // unique 충돌 방지
          phone: "00000000000",
        },
      }),
      prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: { in: ["ACTIVE", "TRIAL", "PENDING"] },
        },
        data: { status: "CANCELLED", cancelledAt: now },
      }),
    ]);

    clearSessionCookie();

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { route: "account/delete" });
    return NextResponse.json({ message: "탈퇴 처리 실패" }, { status: 500 });
  }
}
