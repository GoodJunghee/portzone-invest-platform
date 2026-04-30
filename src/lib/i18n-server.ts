import { cookies } from "next/headers";
import { DEFAULT_LOCALE, getDictionary, LOCALE_COOKIE, Locale, LOCALES } from "./i18n";

export function getLocaleFromCookie(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  if (c && (LOCALES as string[]).includes(c)) return c as Locale;
  return DEFAULT_LOCALE;
}

export function getServerDictionary() {
  const locale = getLocaleFromCookie();
  return { locale, t: getDictionary(locale) };
}
