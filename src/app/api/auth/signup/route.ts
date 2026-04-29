import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { generateReferralCode, generateToken } from "@/lib/tokens";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";
import { sanitizeText } from "@/lib/sanitize";

const SignupSchema = z.object({
  name: z.string().min(1).max(40),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  password: z.string().min(8).max(60),
  referralCode: z.string().trim().max(20).optional(),
});

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function POST(req: Request) {
  // brute-force 방지
  const rl = await authLimiter(getClientIp(req));
  if (!rl.success) {
    return NextResponse.json(
      { message: "잠시 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = SignupSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "입력값이 올바르지 않습니다" },
        { status: 400 }
      );
    }
    const { name, email, phone, password, referralCode } = parsed.data;
    const cleanName = sanitizeText(name);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { message: "이미 가입된 이메일입니다" },
        { status: 409 }
      );
    }

    // 추천인 처리
    let referredById: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
      });
      if (referrer) referredById = referrer.id;
    }

    // 추천 코드 생성 (충돌 시 재시도)
    let myReferralCode = generateReferralCode();
    for (let i = 0; i < 5; i++) {
      const dup = await prisma.user.findUnique({
        where: { referralCode: myReferralCode },
      });
      if (!dup) break;
      myReferralCode = generateReferralCode();
    }

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email,
        phone,
        passwordHash: await hashPassword(password),
        referralCode: myReferralCode,
        referredById,
      },
    });

    // 이메일 인증 토큰 생성 + 발송
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

    // 세션 발급 (인증 전이라도 로그인 상태로 둠 — 인증 안 하면 일부 기능 제한)
    const sessionToken = signSession({
      userId: user.id,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    });
    setSessionCookie(sessionToken);

    return NextResponse.json({
      ok: true,
      role: user.role,
      requiresEmailVerification: true,
    });
  } catch (err) {
    captureError(err, { route: "auth/signup" });
    return NextResponse.json({ message: "가입 처리 실패" }, { status: 500 });
  }
}
