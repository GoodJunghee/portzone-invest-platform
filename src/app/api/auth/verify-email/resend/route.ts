import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { generateToken } from "@/lib/tokens";
import { emailLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인 필요" }, { status: 401 });
  }
  const rl = await emailLimiter(getClientIp(req) + ":" + session.userId);
  if (!rl.success) {
    return NextResponse.json(
      { message: "재발송 한도 초과 — 1시간 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ message: "사용자 없음" }, { status: 404 });
    if (user.emailVerified) {
      return NextResponse.json({ message: "이미 인증된 계정입니다" }, { status: 400 });
    }

    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        email: user.email,
        expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      },
    });
    await sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { route: "auth/verify-email/resend" });
    return NextResponse.json({ message: "재발송 실패" }, { status: 500 });
  }
}
