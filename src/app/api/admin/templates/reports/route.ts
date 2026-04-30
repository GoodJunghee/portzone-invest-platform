import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeText, sanitizeHtml } from "@/lib/sanitize";

const Schema = z.object({
  name: z.string().min(1).max(80),
  category: z.enum(["DAYTRADE", "SWING", "LONGTERM"]),
  market: z.enum([
    "KOSPI", "KOSDAQ", "NASDAQ", "NYSE",
    "BINANCE", "BYBIT", "UPBIT", "BITHUMB",
  ]),
  titlePattern: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  content: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  const items = await prisma.reportTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
  }
  const t = await prisma.reportTemplate.create({
    data: {
      name: sanitizeText(parsed.data.name),
      category: parsed.data.category,
      market: parsed.data.market,
      titlePattern: sanitizeText(parsed.data.titlePattern),
      summary: sanitizeText(parsed.data.summary),
      content: sanitizeHtml(parsed.data.content),
    },
  });
  return NextResponse.json({ ok: true, id: t.id });
}
