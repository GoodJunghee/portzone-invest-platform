/**
 * 가벼운 i18n
 *
 * - 쿠키 `pz_lang`에 ko/en 저장
 * - 서버 컴포넌트는 cookies()로 읽기, 클라이언트는 LangProvider context
 * - 번역 키 누락 시 한국어 폴백
 */

export type Locale = "ko" | "en";

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALES: Locale[] = ["ko", "en"];
export const LOCALE_COOKIE = "pz_lang";

export type Dictionary = typeof DICT_KO;

const DICT_KO = {
  common: {
    login: "로그인",
    signup: "무료 가입",
    logout: "로그아웃",
    mypage: "마이페이지",
    pricing: "요금제",
    reports: "보고서",
    faq: "FAQ",
    about: "서비스 소개",
    learnMore: "자세히 보기",
    home: "홈",
  },
  hero: {
    badge: "국내·해외 주식 + 글로벌 코인 통합 추천",
    title1: "흩어진 시장,",
    title2: "한 번의 알림톡",
    title3: "으로.",
    subtitle:
      "코스피·코스닥·나스닥·뉴욕증시·바이낸스·바이비트·업비트·빗썸까지. 단타·스윙·장타 추천 종목을 카카오 알림톡으로 받아보세요.",
    ctaPricing: "요금제 보러가기",
    ctaSignup: "무료 가입",
    statMarkets: "지원 시장",
    statCategories: "구독 카테고리",
    statChannel: "알림 채널",
    statStage: "MVP 단계",
    statMarketsValue: "8개",
    statCategoriesValue: "4종",
    statChannelValue: "카카오 알림톡",
    statStageValue: "베타 운영",
  },
  marketSection: {
    eyebrow: "지원 시장",
    title: "국내외 주요 시장을 한 곳에서",
    desc: "원하는 시장만 골라서 구독하세요. 다중 선택 시 자동으로 할인이 적용됩니다.",
    stockTitle: "주식",
    cryptoTitle: "코인",
  },
  categorySection: {
    eyebrow: "구독 카테고리",
    title: "투자 스타일에 맞춰 선택",
    desc: "단타·스윙·장타, 또는 한 번에 다 받는 올인원.",
    cta: "내 요금 계산하기",
  },
  features: {
    eyebrow: "핵심 기능",
    title: "포트존이 다른 이유",
    desc: "복잡한 차트 분석, 흩어진 정보, 늦은 타이밍 — 모두 해결합니다.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "자주 묻는 질문",
    desc: "더 궁금한 점은 고객센터로 문의해주세요.",
  },
  finalCta: {
    title: "지금 바로 시작하세요.",
    subtitle:
      "가입은 무료입니다. 원하는 시장과 카테고리만 선택하고 알림톡을 받아보세요.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "내가 받을 시장만 골라서.",
    subtitle:
      "시장을 다중 선택하면 자동으로 할인이 적용됩니다. 올인원은 단타+스윙+장타 통합 35% 할인.",
    footnote:
      "* 표시 가격은 부가세 포함. 결제는 정식 오픈 시 PG 연동 후 활성화됩니다.",
  },
  footer: {
    services: "서비스",
    company: "회사 / 정책",
    notice: "고지사항",
    terms: "이용약관",
    privacy: "개인정보처리방침",
    disclaimer: "투자 유의사항",
    noticeBody:
      "본 서비스에서 제공하는 종목 추천 및 보고서는 투자 판단의 참고용 정보이며, 최종 투자 결정은 사용자 본인의 책임입니다.",
  },
};

const DICT_EN: Dictionary = {
  common: {
    login: "Log in",
    signup: "Sign up free",
    logout: "Log out",
    mypage: "My page",
    pricing: "Pricing",
    reports: "Reports",
    faq: "FAQ",
    about: "About",
    learnMore: "Learn more",
    home: "Home",
  },
  hero: {
    badge: "Korean + Global stocks & crypto in one place",
    title1: "Markets scattered,",
    title2: "now in one alert.",
    title3: "",
    subtitle:
      "From KOSPI, KOSDAQ, NASDAQ, NYSE to Binance, Bybit, Upbit, Bithumb. Day trade, swing, and long-term picks delivered via KakaoTalk.",
    ctaPricing: "See pricing",
    ctaSignup: "Sign up free",
    statMarkets: "Markets",
    statCategories: "Categories",
    statChannel: "Alert channel",
    statStage: "Stage",
    statMarketsValue: "8",
    statCategoriesValue: "4",
    statChannelValue: "Kakao Alimtalk",
    statStageValue: "Beta",
  },
  marketSection: {
    eyebrow: "Markets",
    title: "All major markets, one place",
    desc: "Subscribe to the markets you want. Multi-market discounts auto-applied.",
    stockTitle: "Stocks",
    cryptoTitle: "Crypto",
  },
  categorySection: {
    eyebrow: "Categories",
    title: "Pick a style that fits you",
    desc: "Day trade, swing, long-term — or All-in-One.",
    cta: "Calculate my price",
  },
  features: {
    eyebrow: "Features",
    title: "Why PortZone",
    desc: "Complex charts, scattered info, late timing — all solved.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked",
    desc: "Contact support if you have more questions.",
  },
  finalCta: {
    title: "Start in seconds.",
    subtitle:
      "Sign up is free. Pick your markets and categories, then get alerts.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pay only for what you watch.",
    subtitle:
      "Multi-market discounts auto-applied. All-in-One bundle saves 35% by combining day, swing, and long-term.",
    footnote:
      "* Tax included. Payments will activate after PG integration in official launch.",
  },
  footer: {
    services: "Services",
    company: "Company / Policies",
    notice: "Disclaimer",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    disclaimer: "Investment Notice",
    noticeBody:
      "All recommendations and reports are for informational purposes only. Final investment decisions are your responsibility.",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  ko: DICT_KO,
  en: DICT_EN,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICT_KO;
}
