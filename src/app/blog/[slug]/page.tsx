import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/db";
import { blogCategoryEmoji, blogCategoryName } from "@/lib/blog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });
  if (!post || post.status !== "PUBLISHED") {
    return { title: "포스트를 찾을 수 없습니다 — 포트존" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://portzone-invest-platform.vercel.app";
  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} — 포트존 블로그`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });
  if (!post || post.status !== "PUBLISHED") return notFound();

  // 조회수 증가 (await 없이 fire-and-forget)
  prisma.blogPost
    .update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://portzone-invest-platform.vercel.app";

  // JSON-LD (Article schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
    publisher: {
      "@type": "Organization",
      name: "PortZone",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icons/icon-512.svg`,
      },
    },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <Header />
      <main className="bg-white py-12">
        <article className="container-narrow max-w-3xl">
          <Link
            href="/blog"
            className="text-sm text-navy-500 hover:text-navy-900"
          >
            ← 블로그 전체
          </Link>

          <div className="mt-6 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-navy-100 px-2.5 py-0.5 font-medium text-navy-800">
              {blogCategoryEmoji(post.category)} {blogCategoryName(post.category)}
            </span>
            {post.publishedAt && (
              <span className="text-navy-500">
                {new Date(post.publishedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            <span className="text-navy-400">·</span>
            <span className="text-navy-500">{post.viewCount.toLocaleString()}회 조회</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base text-navy-600 md:text-lg">
            {post.excerpt}
          </p>
          <div className="mt-4 text-xs text-navy-500">
            by {post.authorName}
          </div>

          {post.coverImageUrl && (
            <div
              className="my-8 h-72 rounded-2xl bg-cover bg-center md:h-96"
              style={{ backgroundImage: `url(${post.coverImageUrl})` }}
              role="img"
              aria-label={post.title}
            />
          )}

          <div className="my-8 border-t border-navy-100" />

          <div
            className="prose prose-navy max-w-none text-navy-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-navy-100 pt-6">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-navy-200 bg-navy-50 p-6 text-center">
            <h2 className="text-base font-bold text-navy-900">
              실시간 종목 추천을 받고 싶다면?
            </h2>
            <p className="mt-2 text-sm text-navy-600">
              7일 무료 체험으로 모든 시장의 단타 시그널을 받아보세요.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/signup" className="btn-primary !py-2 !px-4 text-xs">
                무료 가입
              </Link>
              <Link href="/pricing" className="btn-secondary !py-2 !px-4 text-xs">
                요금제 보기
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />

      {/* SEO: JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
