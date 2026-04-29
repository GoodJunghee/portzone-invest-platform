export const MARKETS = {
  STOCK: [
    { id: "KOSPI", name: "코스피", group: "STOCK", region: "KR" },
    { id: "KOSDAQ", name: "코스닥", group: "STOCK", region: "KR" },
    { id: "NASDAQ", name: "나스닥", group: "STOCK", region: "US" },
    { id: "NYSE", name: "뉴욕증시", group: "STOCK", region: "US" },
  ],
  CRYPTO: [
    { id: "BINANCE", name: "바이낸스", group: "CRYPTO", region: "GLOBAL" },
    { id: "BYBIT", name: "바이비트", group: "CRYPTO", region: "GLOBAL" },
    { id: "UPBIT", name: "업비트", group: "CRYPTO", region: "KR" },
    { id: "BITHUMB", name: "빗썸", group: "CRYPTO", region: "KR" },
  ],
} as const;

export const ALL_MARKETS = [...MARKETS.STOCK, ...MARKETS.CRYPTO];

export type MarketId = typeof ALL_MARKETS[number]["id"];

export const CATEGORIES = [
  {
    id: "DAYTRADE",
    name: "단타",
    desc: "1일 단위 매매 · 빠른 시그널",
    holdPeriod: "1일",
    accent: "navy",
  },
  {
    id: "SWING",
    name: "스윙",
    desc: "3~5일 보유 · 균형 전략",
    holdPeriod: "3~5일",
    accent: "mint",
  },
  {
    id: "LONGTERM",
    name: "장타",
    desc: "1달~1년 보유 · 가치 투자",
    holdPeriod: "1달~1년",
    accent: "gold",
  },
  {
    id: "ALLINONE",
    name: "올인원",
    desc: "단타+스윙+장타 통합",
    holdPeriod: "전체",
    accent: "navy",
  },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];
