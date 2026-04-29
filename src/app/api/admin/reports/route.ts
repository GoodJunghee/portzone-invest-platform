import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import { apiLimiter } from "@/lib/rate-limit";
import { captureError } from "@/lib/sentry";

const Schema = z.object({
  title: z.string().min(1).max(120),
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
  summary: z.string().min(1).max(300),
  content: z.string().min(1),
});

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
    const r = await prisma.report.create({
      data: {
        title: sanitizeText(parsed.data.title),
        category: parsed.data.category,
        market: parsed.data.market,
        summary: sanitizeText(parsed.data.summary),
        content: sanitizeHtml(parsed.data.content),
      },
    });
    return NextResponse.json({ ok: true, id: r.id });
  } catch (err) {
    captureError(err, { route: "admin/reports" });
    return NextResponse.json({ message: "처리 실패" }, { status: 500 });
  }
}
