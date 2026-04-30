import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const QuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  emailVerified: z.enum(["true", "false"]).optional(),
  hasActive: z.enum(["true", "false"]).optional(),
  deleted: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    role: url.searchParams.get("role") ?? undefined,
    emailVerified: url.searchParams.get("emailVerified") ?? undefined,
    hasActive: url.searchParams.get("hasActive") ?? undefined,
    deleted: url.searchParams.get("deleted") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ message: "쿼리 오류" }, { status: 400 });
  }
  const { q, role, emailVerified, hasActive, deleted, page, pageSize } =
    parsed.data;

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (emailVerified) where.emailVerified = emailVerified === "true";
  if (deleted === "true") where.deletedAt = { not: null };
  else where.deletedAt = null;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }
  if (hasActive === "true") {
    where.subscriptions = { some: { status: { in: ["ACTIVE", "TRIAL"] } } };
  } else if (hasActive === "false") {
    where.subscriptions = { none: { status: { in: ["ACTIVE", "TRIAL"] } } };
  }

  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        _count: {
          select: { subscriptions: true, watchlist: true, notifications: true },
        },
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIAL"] } },
          select: { status: true, category: true, billingType: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
