import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://portzone-invest-platform.vercel.app";

  const now = new Date();

  // 정적 페이지
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/reports`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 공개 보고서
  let publicReports: MetadataRoute.Sitemap = [];
  try {
    const items = await prisma.report.findMany({
      where: { isPublic: true },
      select: { id: true, publishedAt: true, createdAt: true },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });
    publicReports = items.map((r) => ({
      url: `${baseUrl}/reports/${r.id}`,
      lastModified: r.publishedAt ?? r.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // DB 미연결 시 빈 배열
  }

  // 게시된 블로그 포스트
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });
    blogEntries = posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // DB 미연결 시 빈 배열
  }

  return [...staticEntries, ...publicReports, ...blogEntries];
}
