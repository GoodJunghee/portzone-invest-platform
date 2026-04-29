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

  const { category, market, title, message } = parsed.data;

  // 발송 대상: 해당 카테고리(또는 ALLINONE) 구독 + 해당 시장 포함
  const subs = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ category }, { category: "ALLINONE" }],
    },
    include: { user: true },
  });

  const targets = subs.filter((s) =>
    s.markets.split(",").includes(market)
  );

  // 알림 큐 등록 (실제 카카오 알림톡 연동은 추후 — Solapi/NHN Toast 등)
  const logs = await prisma.$transaction(
    targets.map((s) =>
      prisma.notificationLog.create({
        data: {
          userId: s.userId,
          channel: "ALIMTALK",
          category,
          market,
          title,
          message,
          status: "QUEUED",
        },
      })
    )
  );

  // TODO: 외부 알림톡 API 호출 (Solapi 예시)
  // const solapi = new SolapiMessageService(...)
  // await solapi.send({ to: phone, kakaoOptions: { templateId, variables } })

  return NextResponse.json({ ok: true, count: logs.length });
}
