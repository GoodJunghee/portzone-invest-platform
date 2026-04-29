import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const Schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(60),
});

export async function POST(req: Request) {
  const rl = await authLimiter(getClientIp(req));
  if (!rl.success) {
    return NextResponse.json(
      { message: "잠시 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }
    const { token, password } = parsed.data;

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "유효하지 않거나 만료된 링크입니다" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(password) },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // 같은 사용자의 다른 미사용 토큰 모두 무효화
      prisma.passwordResetToken.updateMany({
        where: {
          userId: record.userId,
          usedAt: null,
          NOT: { id: record.id },
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { route: "auth/reset-password" });
    return NextResponse.json({ message: "비밀번호 재설정 실패" }, { status: 500 });
  }
}
