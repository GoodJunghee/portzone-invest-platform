import DOMPurify from "isomorphic-dompurify";

/**
 * XSS 방지를 위한 HTML sanitization.
 * 보고서 본문(관리자가 입력하는 HTML)에 적용.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "em", "u", "s", "code", "pre",
      "ul", "ol", "li",
      "a", "img",
      "blockquote",
      "table", "thead", "tbody", "tr", "td", "th",
      "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
  });
}

/**
 * 일반 문자열 입력을 정제 (앞뒤 공백 제거, ASCII 제어 문자 제거).
 */
export function sanitizeText(input: string): string {
  // ASCII control characters (0x00-0x1F, 0x7F) 제거
  let result = "";
  for (const ch of input) {
    const code = ch.charCodeAt(0);
    if (code >= 0x20 && code !== 0x7f) {
      result += ch;
    }
  }
  return result.trim();
}
