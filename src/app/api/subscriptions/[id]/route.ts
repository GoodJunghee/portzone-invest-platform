import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface Ctx {
  params: { id: string };
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인 필요" }, { status: 401 });
  }
  const sub = await prisma.subscription.findUnique({ where: { id: params.id } });
  if (!sub || sub.userId !== session.userId) {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  await prisma.subscription.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
