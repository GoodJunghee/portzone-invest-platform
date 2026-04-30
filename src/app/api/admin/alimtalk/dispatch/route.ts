import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { captureError } from "@/lib/sentry";
import { apiLimiter } from "@/lib/rate-limit";

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
  symbol: z.string().trim().max(20).optional(),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(2000),
});

/**
 * 즉시 발송 (관리자)
 *
 * 발송 대상 산정 로직:
 * 1. 활성 구독자 (해당 카테고리 또는 ALLINONE)
 * 2. 해당 시장 포함
 * 3. NotifyPreference.alimtalkEnabled === true
 * 4. NotifyPreference.watchlistOnly === true 인 사용자는 watchlist에 (market, symbol) 매치되는 경우만
 * 5. symbol이 watchlist에 매치되면 priority=HIGH
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  const rl = await apiLimiter(session.userId);
  if (!rl.success) {
    return NextResponse.json({ message: "요청이 너무 많습니다" }, { status: 429 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }
    const { category, market, symbol, title, message } = parsed.data;
    const cleanTitle = sanitizeText(title);
    const cleanMessage = sanitizeText(message);

    const subs = await prisma.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "TRIAL"] },
        OR: [{ category }, { category: "ALLINONE" }],
      },
      include: {
        user: {
          include: {
            notifyPref: true,
            watchlist: { where: { market } },
          },
        },
      },
    });

    const targets = subs.filter((s) =>
      s.markets.split(",").includes(market) &&
      (s.user.notifyPref?.alimtalkEnabled ?? true) &&
      !s.user.deletedAt
    );

    const logs = [];
    for (const s of targets) {
      const watchlistMatched =
        symbol && s.user.watchlist.some((w) => w.symbol === symbol);

      // watchlistOnly 옵션 사용자는 매치 안 되면 발송 제외
      if (s.user.notifyPref?.watchlistOnly && !watchlistMatched) continue;

      logs.push({
        userId: s.userId,
        channel: "ALIMTALK",
        category,
        market,
        title: cleanTitle,
        message: cleanMessage,
        status: "QUEUED" as const,
        priority: watchlistMatched ? "HIGH" : "NORMAL",
        matchedSymbol: watchlistMatched ? symbol : null,
      });
    }

    if (logs.length > 0) {
      await prisma.notificationLog.createMany({ data: logs });
    }

    // TODO: 실제 Solapi/NHN 알림톡 API 호출 — 추후 추가
    // 지금은 큐 등록만

    return NextResponse.json({
      ok: true,
      count: logs.length,
      highPriority: logs.filter((l) => l.priority === "HIGH").length,
    });
  } catch (err) {
    captureError(err, { route: "admin/alimtalk/dispatch" });
    return NextResponse.json({ message: "발송 처리 실패" }, { status: 500 });
  }
}
