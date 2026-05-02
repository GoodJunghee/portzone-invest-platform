import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import { slugify } from "@/lib/blog";
import { captureError } from "@/lib/sentry";

const Schema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().trim().max(80).optional(),
  excerpt: z.string().min(1).max(300),
  content: z.string().min(1),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  category: z.enum(["MARKET_ANALYSIS", "STRATEGY", "NEWS", "GUIDE"]),
  tags: z.string().trim().max(200).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  const items = await prisma.blogPost.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }

    const rawSlug = parsed.data.slug
      ? slugify(parsed.data.slug)
      : slugify(parsed.data.title);
    // 한글이 모두 제거되어 빈 문자열이 되는 경우(예: 특수문자만 있는 제목) fallback
    const baseSlug = rawSlug || `post-${Date.now()}`;
    let slug = baseSlug;

    // 슬러그 중복 시 뒤에 카운터 붙이기
    for (let i = 1; i < 30; i++) {
      const dup = await prisma.blogPost.findUnique({ where: { slug } });
      if (!dup) break;
      slug = `${baseSlug}-${i + 1}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: sanitizeText(parsed.data.title),
        excerpt: sanitizeText(parsed.data.excerpt),
        content: sanitizeHtml(parsed.data.content),
        coverImageUrl: parsed.data.coverImageUrl ?? null,
        category: parsed.data.category,
        tags: parsed.data.tags ? sanitizeText(parsed.data.tags) : null,
        status: parsed.data.status,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true, id: post.id, slug: post.slug });
  } catch (err) {
    captureError(err, { route: "admin/blog" });
    return NextResponse.json({ message: "포스트 생성 실패" }, { status: 500 });
  }
}
