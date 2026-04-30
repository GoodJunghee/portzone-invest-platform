import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const QuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(["DAYTRADE", "SWING", "LONGTERM"]).optional(),
  market: z.enum([
    "KOSPI", "KOSDAQ", "NASDAQ", "NYSE",
    "BINANCE", "BYBIT", "UPBIT", "BITHUMB",
  ]).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    market: url.searchParams.get("market") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ message: "쿼리 파라미터 오류" }, { status: 400 });
  }
  const { q, category, market, page, pageSize } = parsed.data;

  const where: Prisma.ReportWhereInput = {};
  if (category) where.category = category;
  if (market) where.market = market;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        category: true,
        market: true,
        summary: true,
        fileUrl: true,
        publishedAt: true,
      },
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  });
}
