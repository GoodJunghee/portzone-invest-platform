import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(60),
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
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ message: "사용자 없음" }, { status: 404 });

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "현재 비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { route: "auth/change-password" });
    return NextResponse.json({ message: "비밀번호 변경 실패" }, { status: 500 });
  }
}
