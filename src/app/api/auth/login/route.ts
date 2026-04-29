import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    const parsed = LoginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력 형식 오류" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    const token = signSession({
      userId: user.id,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    });
    setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      role: user.role,
      emailVerified: user.emailVerified,
    });
  } catch (err) {
    captureError(err, { route: "auth/login" });
    return NextResponse.json({ message: "로그인 처리 실패" }, { status: 500 });
  }
}
