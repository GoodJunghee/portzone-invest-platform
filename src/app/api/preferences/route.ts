import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const Schema = z.object({
  alimtalkEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  preMarketOpen: z.boolean(),
  preMarketClose: z.boolean(),
  urgentSignal: z.boolean(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "로그인 필요" }, { status: 401 });

  const pref = await prisma.notifyPreference.findUnique({
    where: { userId: session.userId },
  });
  return NextResponse.json({
    pref: pref ?? {
      alimtalkEnabled: true,
      emailEnabled: true,
      preMarketOpen: true,
      preMarketClose: true,
      urgentSignal: true,
    },
  });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "로그인 필요" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
  }

  const updated = await prisma.notifyPreference.upsert({
    where: { userId: session.userId },
    update: parsed.data,
    create: { userId: session.userId, ...parsed.data },
  });

  return NextResponse.json({ ok: true, pref: updated });
}
