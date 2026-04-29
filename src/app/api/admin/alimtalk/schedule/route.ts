import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const Schema = z.object({
  category: z.enum(["DAYTRADE", "SWING", "LONGTERM"]),
  market: z.enum([
    "KOSPI",
    "KOSDAQ",
    "NASDAQ",
    "NYSE",
    "BINANCE",
    "BYBIT",
    "UPBIT",
    "BITHUMB",
  ]),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(2000),
  scheduledAt: z.string().datetime(),
});

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
  const { category, market, title, message, scheduledAt } = parsed.data;

  const job = await prisma.alimtalkJob.create({
    data: {
      category,
      market,
      title,
      message,
      scheduledAt: new Date(scheduledAt),
      status: "SCHEDULED",
    },
  });

  return NextResponse.json({ ok: true, jobId: job.id });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ items: [] }, { status: 403 });
  }
  const items = await prisma.alimtalkJob.findMany({
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ items });
}
