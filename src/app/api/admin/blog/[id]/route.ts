import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import { captureError } from "@/lib/sentry";

const PatchSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  excerpt: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  category: z
    .enum(["MARKET_ANALYSIS", "STRATEGY", "NEWS", "GUIDE"])
    .optional(),
  tags: z.string().trim().max(200).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

interface Ctx {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = PatchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
    }

    const existing = await prisma.blogPost.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ message: "포스트 없음" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title) data.title = sanitizeText(parsed.data.title);
    if (parsed.data.excerpt) data.excerpt = sanitizeText(parsed.data.excerpt);
    if (parsed.data.content) data.content = sanitizeHtml(parsed.data.content);
    if (parsed.data.coverImageUrl !== undefined)
      data.coverImageUrl = parsed.data.coverImageUrl;
    if (parsed.data.category) data.category = parsed.data.category;
    if (parsed.data.tags !== undefined)
      data.tags = parsed.data.tags ? sanitizeText(parsed.data.tags) : null;
    if (parsed.data.status) {
      data.status = parsed.data.status;
      if (parsed.data.status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ ok: true, slug: updated.slug });
  } catch (err) {
    captureError(err, { route: "admin/blog/[id]" });
    return NextResponse.json({ message: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
