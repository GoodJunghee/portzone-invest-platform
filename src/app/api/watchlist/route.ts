import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const Schema = z.object({
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
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(80),
  memo: z.string().max(200).optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] }, { status: 401 });
  const items = await prisma.watchlist.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "로그인 필요" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
  }
  const { market, symbol, name, memo } = parsed.data;

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_market_symbol: { userId: session.userId, market, symbol },
    },
  });
  if (existing) {
    return NextResponse.json({ message: "이미 관심 종목에 등록됨" }, { status: 409 });
  }

  const item = await prisma.watchlist.create({
    data: { userId: session.userId, market, symbol, name, memo: memo ?? null },
  });
  return NextResponse.json({ ok: true, item });
}
