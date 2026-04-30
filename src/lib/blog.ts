export const BLOG_CATEGORIES = [
  { id: "MARKET_ANALYSIS", name: "시장 분석", emoji: "📊" },
  { id: "STRATEGY", name: "투자 전략", emoji: "🎯" },
  { id: "NEWS", name: "시장 뉴스", emoji: "📰" },
  { id: "GUIDE", name: "투자 가이드", emoji: "📚" },
] as const;

export type BlogCategoryId = typeof BLOG_CATEGORIES[number]["id"];

export function blogCategoryName(id: string): string {
  return BLOG_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function blogCategoryEmoji(id: string): string {
  return BLOG_CATEGORIES.find((c) => c.id === id)?.emoji ?? "📝";
}

/**
 * 슬러그 생성: 한글/영문 + 숫자 + 하이픈만 허용. 공백을 하이픈으로.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
