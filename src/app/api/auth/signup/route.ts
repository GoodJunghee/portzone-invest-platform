import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { generateReferralCode, generateToken } from "@/lib/tokens";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";
import { sanitizeText } from "@/lib/sanitize";
import { grantTrialIfEligible } from "@/lib/trial";
import { issueReferralRewards } from "@/lib/referral";

const SignupSchema = z.object({
  name: z.string().min(1).max(40),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  password: z.string().min(8).max(60),
  referralCode: z.string().trim().max(20).optional(),
});

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

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

    let referredById: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
      });
      if (referrer && !referrer.deletedAt) {
        referredById = referrer.id;
      }
    }

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

    // 7일 무료 체험 자동 부여
    await grantTrialIfEligible(user.id);

    // 추천인 보상 (양쪽에 1개월 무료 쿠폰)
    if (referredById) {
      try {
        await issueReferralRewards(referredById, user.id);
      } catch (e) {
        // 추천 보상 실패해도 가입은 성공시킴
        captureError(e, { route: "auth/signup/referral", userId: user.id });
      }
    }

    // 이메일 인증 토큰 + 발송
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
      trialGranted: true,
      referralApplied: !!referredById,
    });
  } catch (err) {
    captureError(err, { route: "auth/signup" });
    return NextResponse.json({ message: "가입 처리 실패" }, { status: 500 });
  }
}
