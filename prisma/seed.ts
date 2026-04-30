import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@portzone.kr";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "관리자",
      phone: "01000000000",
      passwordHash: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      referralCode: "ADMIN001",
    },
  });

  const demoEmail = "user@portzone.kr";
  const demo = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "김투자",
      phone: "01012345678",
      passwordHash: await bcrypt.hash("user1234", 10),
      role: "USER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      referralCode: "DEMO0001",
    },
  });

  // 데모 구독 (활성 구독 + 데모 쿠폰)
  await prisma.subscription.deleteMany({ where: { userId: demo.id } });
  await prisma.subscription.create({
    data: {
      userId: demo.id,
      category: "DAYTRADE",
      markets: "KOSPI,KOSDAQ,UPBIT",
      billingType: "MONTHLY",
      priceKrw: 13500,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 데모 쿠폰
  await prisma.coupon.deleteMany({ where: { userId: demo.id } });
  await prisma.coupon.create({
    data: {
      userId: demo.id,
      code: "WELCOME-DEMO",
      type: "FREE_MONTH",
      valueInt: 1,
      description: "데모 환영 쿠폰 — 1개월 무료",
      source: "PROMO",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  // 알림 설정
  await prisma.notifyPreference.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id },
  });

  // 데모 관심 종목
  await prisma.watchlist.deleteMany({ where: { userId: demo.id } });
  await prisma.watchlist.createMany({
    data: [
      { userId: demo.id, market: "KOSPI", symbol: "005930", name: "삼성전자" },
      { userId: demo.id, market: "NASDAQ", symbol: "TSLA", name: "Tesla" },
      { userId: demo.id, market: "UPBIT", symbol: "BTC", name: "비트코인" },
    ],
  });

  // 데모 보고서 (앞 2건은 무료 샘플 + 랜딩 노출)
  await prisma.report.deleteMany({});
  const reports = [
    {
      title: "[코스피 단타] 반도체 섹터 단기 반등 시그널 — 무료 샘플",
      category: "DAYTRADE",
      market: "KOSPI",
      summary:
        "반도체 대형주 중심으로 단기 반등 가능성 포착. 5일 이평선 돌파 후 거래량 동반 상승. 가입 없이 본문 전체를 읽어보실 수 있습니다.",
      content:
        "<h3>분석 요약</h3><p>반도체 섹터 ETF의 외국인 순매수 전환 + RSI 35 → 52 회복. 단기 반등 가능성 높음.</p><h3>추천 종목 (예시)</h3><ul><li><strong>OOO전자</strong>: 매수가 71,500원 / 목표가 74,000원 (+3.5%) / 손절가 70,200원 (-1.8%)</li><li><strong>OOO하이닉스</strong>: 매수가 142,000원 / 목표가 148,500원 (+4.6%) / 손절가 139,500원 (-1.8%)</li></ul><h3>거래 팁</h3><p>장 시작 직후 거래량 폭발 시 진입, 12시 이전 청산 권고. 개장 30분 내 거래량이 평균 대비 1.5배 미만이면 진입 보류.</p>",
      isPublic: true,
      isSample: true,
    },
    {
      title: "[업비트 단타] 알트코인 회전 매매 시그널 — 무료 샘플",
      category: "DAYTRADE",
      market: "UPBIT",
      summary:
        "BTC 도미넌스 하락 구간 진입. 알트코인 단기 회전 매매 기회 발생. 무료로 열람 가능합니다.",
      content:
        "<h3>분석 요약</h3><p>BTC.D 54% 하향 돌파 시 알트 시즌 진입 신호.</p><h3>매매 가이드</h3><ul><li>레이어1 코인 우선 (ETH, SOL)</li><li>RSI 30 미만 종목 분할 매수</li><li>BTC 변동성 확대 시 즉시 청산</li></ul><h3>주의</h3><p>변동성 매우 높음. 손절 라인 -3% 엄수.</p>",
      isPublic: true,
      isSample: true,
    },
    {
      title: "[나스닥 스윙] 빅테크 4분기 실적 시즌 대응 전략",
      category: "SWING",
      market: "NASDAQ",
      summary: "FAANG 실적 발표 일정 및 옵션 시장 IV 변동 분석.",
      content:
        "<h3>일정</h3><ul><li>10/24 — TSLA</li><li>10/30 — META</li><li>10/31 — AAPL</li></ul><h3>전략</h3><p>실적 발표 1주일 전 IV 상승 구간에서 진입.</p>",
    },
    {
      title: "[코스피 장타] 2차전지 밸류체인 1년 전망",
      category: "LONGTERM",
      market: "KOSPI",
      summary: "양극재·음극재·분리막 핵심 종목 장기 매집 가이드.",
      content:
        "<h3>매집 구간</h3><p>현재가 대비 -8~-12% 구간에서 분할 매수 권고.</p>",
    },
    {
      title: "[바이낸스 단타] BTC 변동성 확장 구간 진입",
      category: "DAYTRADE",
      market: "BINANCE",
      summary:
        "오픈인터레스트 급증 + 펀딩비 음수 전환. 단기 변동성 확장 시그널 발생.",
      content:
        "<h3>분석</h3><p>BTC 무기한 선물 OI 24시간 +18%, 펀딩비 -0.012%로 음수 전환. 숏 스퀴즈 가능성 확대.</p><h3>전략</h3><ul><li>10분봉 RSI 30 진입 시 분할 매수</li><li>레버리지 5x 이내 권고</li><li>손절 -2.5% 자동</li></ul>",
    },
    {
      title: "[코스닥 스윙] 바이오 섹터 임상 일정 분석",
      category: "SWING",
      market: "KOSDAQ",
      summary:
        "1분기 임상 발표 예정 종목 5선. 진입 타이밍과 위험 요인 정리.",
      content:
        "<h3>주요 일정</h3><ul><li>1/15 — A사 항암제 임상 2상 톱라인</li><li>1/22 — B사 백신 임상 3상 중간 발표</li><li>2/05 — C사 희귀질환 신약 FDA 자문위원회</li></ul><h3>주의</h3><p>임상 결과 실패 시 갭 하락 -30% 이상 가능. 비중 5% 이내 권고.</p>",
    },
    {
      title: "[NYSE 장타] 배당 귀족주 1년 포트폴리오",
      category: "LONGTERM",
      market: "NYSE",
      summary:
        "25년 이상 배당 증가 기록 종목 중 현재 매력 구간 5선.",
      content:
        "<h3>편입 종목 (예시)</h3><ol><li>JNJ (Johnson & Johnson) — 배당 60년</li><li>PG (Procter & Gamble) — 배당 67년</li><li>KO (Coca-Cola) — 배당 61년</li></ol><h3>리밸런싱 주기</h3><p>분기별 검토. 배당 삭감 발표 시 즉시 제외.</p>",
    },
    {
      title: "[빗썸 스윙] 김치 프리미엄 정상화 구간",
      category: "SWING",
      market: "BITHUMB",
      summary:
        "김프 -2~+1% 박스권 진입. 글로벌 가격 추종 매매 전략.",
      content:
        "<h3>현황</h3><p>최근 30일 김프 평균 +0.3%, 표준편차 1.8%. 정상 박스권 안정 진입.</p><h3>전략</h3><p>김프 -2% 이하 진입, +2% 이상 청산.</p>",
    },
    {
      title: "[바이비트 단타] 알트 무기한 자금 흐름 시그널",
      category: "DAYTRADE",
      market: "BYBIT",
      summary:
        "주요 알트 OI 변동 상위 5개 종목과 진입 가이드.",
      content:
        "<h3>OI 급증 종목</h3><ul><li>ETH 무기한: OI +12%, 펀딩 +0.018%</li><li>SOL 무기한: OI +21%, 펀딩 +0.025%</li></ul><h3>주의</h3><p>펀딩비 0.05% 초과 종목은 진입 보류.</p>",
    },
  ];

  for (const r of reports) {
    await prisma.report.create({ data: r });
  }

  // 데모 블로그 포스트
  await prisma.blogPost.deleteMany({});
  const blogPosts = [
    {
      slug: "kospi-2026-q1-outlook",
      title: "2026년 1분기 코스피 시장 전망",
      excerpt:
        "외국인 순매수 전환 신호와 반도체 섹터 회복 가능성을 분석합니다. 매크로 환경과 기술적 지표 종합.",
      content:
        "<h2>요약</h2><p>2026년 1분기 코스피는 외국인 자금 유입과 반도체 사이클 반등이 결합되면서 박스권 상단 돌파를 시도할 가능성이 큽니다.</p><h2>주요 변수</h2><ul><li>미 연준 금리 정책</li><li>중국 경기 회복 속도</li><li>반도체 메모리 가격 추이</li></ul><h2>섹터별 시각</h2><h3>1. 반도체</h3><p>HBM 수요 강세 지속. 단기 조정 시 분할 매수 전략.</p><h3>2. 2차전지</h3><p>유럽 EV 보조금 정책 변화에 주목. 변동성 높음.</p><h3>3. 바이오</h3><p>미 FDA 승인 일정과 한국 기업 글로벌 임상 진척도 체크.</p>",
      category: "MARKET_ANALYSIS",
      tags: "코스피, 시장전망, 반도체, 2차전지",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorName: "PortZone 리서치",
    },
    {
      slug: "swing-trading-strategy-101",
      title: "스윙 트레이딩 입문 — 3~5일 보유 전략의 정석",
      excerpt:
        "단타도, 장기 투자도 부담스러운 분께. 일주일 단위로 종목을 회전하는 스윙 매매의 핵심 원칙을 정리합니다.",
      content:
        "<h2>스윙이란?</h2><p>3~5일 단위로 종목을 보유하는 매매 스타일. 단타의 피로감과 장기 투자의 답답함 사이.</p><h2>핵심 원칙</h2><ol><li>추세 추종 — 5일선 위 종목만</li><li>진입 시점 — 거래량 동반 돌파</li><li>분할 진입 — 한 번에 풀매수 금지</li><li>손절 라인 — -3% 자동 컷</li><li>익절 라인 — +5~7%</li></ol><h2>주의사항</h2><p>실적 발표 직전 진입은 피하세요. 갭 하락 위험.</p>",
      category: "STRATEGY",
      tags: "스윙, 매매전략, 입문",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
    {
      slug: "binance-bybit-difference",
      title: "바이낸스 vs 바이비트 — 어디서 거래해야 할까?",
      excerpt:
        "두 거래소의 수수료, 레버리지, 유동성, 한국인 사용 환경을 비교합니다. 신규 가입 시 체크 포인트.",
      content:
        "<h2>비교 요약</h2><table><thead><tr><th>항목</th><th>바이낸스</th><th>바이비트</th></tr></thead><tbody><tr><td>현물 수수료</td><td>0.1%</td><td>0.1%</td></tr><tr><td>선물 수수료</td><td>0.04%</td><td>0.055%</td></tr><tr><td>최대 레버리지</td><td>125x</td><td>100x</td></tr><tr><td>한국어 지원</td><td>제한적</td><td>지원</td></tr></tbody></table><h2>추천</h2><p>현물 거래량 위주는 바이낸스, 선물 단타는 바이비트.</p>",
      category: "GUIDE",
      tags: "바이낸스, 바이비트, 비교, 거래소",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
    {
      slug: "fed-rate-decision-impact",
      title: "연준 금리 결정이 한국 증시에 미치는 영향",
      excerpt:
        "파월 의장의 한 마디에 코스피가 움직이는 이유. 연준 결정과 한국 시장의 상관관계를 데이터로 분석.",
      content:
        "<h2>왜 연준이 한국 증시에 영향을 줄까?</h2><p>달러 유동성 → 신흥국 자금 흐름 → 한국 외국인 수급</p><h2>최근 5년 데이터</h2><p>FOMC 발표 후 5일간 코스피 평균 변동성 +1.8%p 증가. 매파적 발언 시 -2.3% 하락 사례 다수.</p><h2>대응 전략</h2><ul><li>FOMC 1주일 전 — 포지션 축소</li><li>발표 당일 — 관망</li><li>발표 후 1~2일 — 추세 확인 후 진입</li></ul>",
      category: "NEWS",
      tags: "연준, FOMC, 금리, 코스피",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
    {
      slug: "rsi-macd-explained",
      title: "RSI와 MACD — 단타 진입을 결정하는 두 가지 지표",
      excerpt:
        "차트 분석에 빠지지 않는 RSI와 MACD. 둘이 어떻게 다르고, 언제 어떻게 함께 써야 하는지 정리합니다.",
      content:
        "<h2>RSI (Relative Strength Index)</h2><p>일정 기간의 가격 상승·하락 비율을 0~100으로 표현. 70 이상 과매수, 30 이하 과매도.</p><h2>MACD (Moving Average Convergence Divergence)</h2><p>단기·장기 이동평균의 차이로 추세 전환을 감지. 골든크로스/데드크로스 시점 포착.</p><h2>함께 쓰는 법</h2><ol><li>RSI 30 이하 + MACD 상향 교차 → 강한 매수 시그널</li><li>RSI 70 이상 + MACD 하향 교차 → 강한 매도 시그널</li></ol><p>한 지표만 보면 속을 수 있습니다. 두 지표가 같은 방향을 가리킬 때만 진입.</p>",
      category: "GUIDE",
      tags: "RSI, MACD, 기술적분석, 단타",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
    {
      slug: "long-term-investing-mindset",
      title: "장타 투자자가 5년 후에도 살아남는 7가지 원칙",
      excerpt:
        "단기 변동성에 흔들리지 않는 장기 투자의 마음가짐. 시장이 무너질 때 버틸 수 있는 원칙들.",
      content:
        "<h2>1. 종목보다 비즈니스</h2><p>주가가 아니라 회사 자체를 봐야 합니다.</p><h2>2. 사이클을 이해</h2><p>모든 산업엔 호황과 침체가 있습니다.</p><h2>3. 분산 + 분할</h2><p>한 번에, 한 종목에 모두 넣지 마세요.</p><h2>4. 현금 보유</h2><p>기회가 왔을 때 행동하려면 실탄이 필요합니다.</p><h2>5. 재무제표 확인</h2><p>최소 분기에 한 번 ROE·부채비율·영업이익률 점검.</p><h2>6. 매도 기준 사전 정의</h2><p>'언제 팔지'를 정하지 않으면 절대 팔 수 없습니다.</p><h2>7. 시장과 거리두기</h2><p>매일 차트 보는 장타 투자자는 결국 단타를 합니다.</p>",
      category: "STRATEGY",
      tags: "장타, 가치투자, 마인드셋",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
    {
      slug: "btc-cycle-2026",
      title: "비트코인 4년 사이클 — 2026년은 어떤 해인가",
      excerpt:
        "반감기 이후 BTC의 역사적 흐름. 2026년 시장이 보여줄 가능성을 데이터로 짚어봅니다.",
      content:
        "<h2>BTC 4년 사이클</h2><p>반감기마다 가격 상승·조정·바닥·재상승의 순환이 반복.</p><h2>2024년 반감기 이후</h2><ul><li>2024 Q2: 반감기 발생</li><li>2024~2025: 상승 사이클</li><li>2025 후반~2026: 조정·바닥 형성 가능성</li></ul><h2>대응 전략</h2><p>분할 매수 비중 확대, 레버리지 축소, 알트 비중 조정.</p>",
      category: "MARKET_ANALYSIS",
      tags: "비트코인, BTC, 사이클, 코인",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
    {
      slug: "stop-loss-rules",
      title: "손절 라인 설정의 정석 — 감정 없이 자르는 법",
      excerpt:
        "잃을 줄 알아야 잃지 않습니다. 손절 라인을 미리 정하고 지키는 7가지 규칙.",
      content:
        "<h2>손절이 어려운 이유</h2><p>'이번엔 다를 것'이라는 희망이 손실을 키웁니다.</p><h2>실전 손절 규칙</h2><ol><li>진입 전에 손절가 결정 (-2~3% 권장)</li><li>지정가 손절 자동 등록</li><li>손절 후 같은 종목 24시간 재진입 금지</li><li>월 손실 한도 -5% 도달 시 한 달간 거래 중단</li><li>크게 잃은 날은 차트도 보지 말 것</li></ol>",
      category: "GUIDE",
      tags: "손절, 리스크관리, 단타",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      authorName: "PortZone 리서치",
    },
  ];

  for (const p of blogPosts) {
    await prisma.blogPost.create({ data: p });
  }

  // 데모 알림 로그
  await prisma.notificationLog.deleteMany({ where: { userId: demo.id } });
  await prisma.notificationLog.createMany({
    data: [
      {
        userId: demo.id,
        channel: "ALIMTALK",
        category: "DAYTRADE",
        market: "KOSPI",
        title: "[포트존] 오늘의 단타 추천 (코스피)",
        message:
          "▶ OOO전자\n매수가 71,500원 / 목표가 74,000원 / 손절가 70,200원\n사유: 외국인 순매수 전환 + RSI 회복",
        status: "SENT",
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        userId: demo.id,
        channel: "ALIMTALK",
        category: "DAYTRADE",
        market: "UPBIT",
        title: "[포트존] 알트 시즌 진입 시그널",
        message: "BTC 도미넌스 54% 하향 돌파. 주요 알트코인 진입 검토.",
        status: "SENT",
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
  });

  // 데모 보고서 템플릿
  await prisma.reportTemplate.deleteMany({});
  await prisma.reportTemplate.create({
    data: {
      name: "단타 KOSPI 일일 시그널",
      category: "DAYTRADE",
      market: "KOSPI",
      titlePattern: "[코스피 단타] {{date}} {{name}} 시그널",
      summary: "{{name}} 단기 시그널 — 매수가 {{buy}}, 목표 {{target}}",
      content:
        "<h3>분석 요약</h3><p>{{name}}의 기술적 지표상 단기 진입 시그널 발생.</p><h3>거래 가이드</h3><ul><li>매수가: {{buy}}</li><li>목표가: {{target}}</li><li>손절가: {{stop}}</li></ul>",
    },
  });

  // 데모 알림톡 템플릿
  await prisma.alimtalkTemplate.deleteMany({});
  await prisma.alimtalkTemplate.createMany({
    data: [
      {
        name: "장 시작 전 단타 추천",
        category: "DAYTRADE",
        market: null,
        title: "[포트존] 오늘의 단타 추천 ({{market}})",
        body: "▶ {{name}} ({{symbol}})\n매수가 {{buy}}\n목표가 {{target}}\n손절가 {{stop}}\n사유: {{reason}}",
        description: "장 개장 30분 전 발송용",
      },
      {
        name: "긴급 시그널",
        category: "DAYTRADE",
        market: null,
        title: "[포트존] 🚨 긴급 시그널 — {{name}}",
        body: "{{name}}({{symbol}}) 긴급 진입 시그널 발생.\n\n현재가 {{price}}\n진입 권장가 {{buy}}\n목표가 {{target}}",
        description: "주요 변동성 발생 시 즉시 발송",
      },
    ],
  });

  console.log("Seed done.");
  console.log(`  Admin: ${adminEmail} / admin1234`);
  console.log(`  User:  ${demoEmail} / user1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
