import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

const SignupSchema = z.object({
  name: z.string().min(1).max(40),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  password: z.string().min(8).max(60),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = SignupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값이 올바르지 않습니다." },
      { status: 400 }
    );
  }
  const { name, email, phone, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { message: "이미 가입된 이메일입니다." },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
    },
  });

  const token = signSession({ userId: user.id, email: user.email, role: user.role as "USER" | "ADMIN" });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, role: user.role });
}
