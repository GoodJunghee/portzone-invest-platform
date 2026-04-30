import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface Ctx {
  params: { id: string };
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  await prisma.reportTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
