import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { captureError } from "@/lib/sentry";

const Schema = z.object({ token: z.string().min(10) });

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "유효하지 않은 토큰" }, { status: 400 });
    }
    const { token } = parsed.data;

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record) {
      return NextResponse.json({ message: "유효하지 않은 토큰" }, { status: 400 });
    }
    if (record.usedAt) {
      return NextResponse.json({ message: "이미 사용된 토큰" }, { status: 400 });
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ message: "만료된 토큰" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureError(err, { route: "auth/verify-email" });
    return NextResponse.json({ message: "인증 처리 실패" }, { status: 500 });
  }
}
