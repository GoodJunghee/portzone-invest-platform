import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateToken } from "@/lib/tokens";
import { emailLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const Schema = z.object({ email: z.string().email() });
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

export async function POST(req: Request) {
  const rl = await emailLimiter(getClientIp(req));
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
      return NextResponse.json({ message: "이메일 형식이 올바르지 않습니다" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    // 보안상 가입 여부와 무관하게 동일한 응답을 반환
    if (user && !user.deletedAt) {
      const token = generateToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      await sendPasswordResetEmail(user.email, user.name, token);
    }

    return NextResponse.json({
      ok: true,
      message: "이메일 발송 요청이 처리되었습니다",
    });
  } catch (err) {
    captureError(err, { route: "auth/forgot-password" });
    return NextResponse.json({ message: "처리 실패" }, { status: 500 });
  }
}
