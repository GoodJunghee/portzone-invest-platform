import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCALE_COOKIE, LOCALES } from "@/lib/i18n";

const Schema = z.object({
  locale: z.enum(LOCALES as [string, ...string[]]),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "잘못된 언어 코드" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, parsed.data.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
