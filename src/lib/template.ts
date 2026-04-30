/**
 * 템플릿 변수 치환
 *
 * 형식: {{key}} → variables[key]
 * 예: "▶ {{name}} 매수가 {{buy}}" + { name: "삼성전자", buy: "71,500원" }
 *      = "▶ 삼성전자 매수가 71,500원"
 *
 * 미정의 변수는 빈 문자열로 치환.
 */
const VAR_RE = /\{\{\s*([\w가-힣]+)\s*\}\}/g;

export function applyTemplate(
  source: string,
  variables: Record<string, string | number | null | undefined>
): string {
  return source.replace(VAR_RE, (_, key) => {
    const v = variables[key];
    if (v === undefined || v === null) return "";
    return String(v);
  });
}

/**
 * 템플릿에서 사용된 변수 키 목록 추출
 */
export function extractVariables(source: string): string[] {
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_RE.source, "g");
  while ((m = re.exec(source))) {
    set.add(m[1]);
  }
  return Array.from(set);
}
