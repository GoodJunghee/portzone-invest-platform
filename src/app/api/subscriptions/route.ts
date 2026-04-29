import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculatePrice } from "@/lib/pricing";

const Schema = z.object({
  category: z.enum(["DAYTRADE", "SWING", "LONGTERM", "ALLINONE"]),
  markets: z
    .array(
      z.enum([
        "KOSPI",
        "KOSDAQ",
        "NASDAQ",
        "NYSE",
        "BINANCE",
        "BYBIT",
        "UPBIT",
        "BITHUMB",
      ])
    )
    .min(1)
    .max(8),
  billingType: z.enum(["MONTHLY", "YEARLY"]),
  priceKrw: z.number().int().min(0),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
  }

  const { category, markets, billingType, priceKrw } = parsed.data;

  // 서버측 가격 재검증 (클라이언트 변조 방지)
  const recalc = calculatePrice(category, markets, billingType);
  if (recalc.unavailable) {
    return NextResponse.json({ message: recalc.unavailable }, { status: 400 });
  }
  if (recalc.finalPrice !== priceKrw) {
    return NextResponse.json(
      { message: "가격 검증 실패", expected: recalc.finalPrice },
      { status: 400 }
    );
  }

  const now = new Date();
  const endDate = new Date(now);
  if (billingType === "YEARLY") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // PG 미연동 — 일단 PENDING 상태로 저장
  const sub = await prisma.subscription.create({
    data: {
      userId: session.userId,
      category,
      markets: markets.join(","),
      billingType,
      priceKrw,
      status: "PENDING",
      startDate: now,
      endDate,
    },
  });

  return NextResponse.json({ ok: true, subscriptionId: sub.id });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }
  const items = await prisma.subscription.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}
