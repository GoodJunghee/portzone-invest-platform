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

  // 데모 보고서
  await prisma.report.deleteMany({});
  const reports = [
    {
      title: "[코스피 단타] 반도체 섹터 단기 반등 시그널",
      category: "DAYTRADE",
      market: "KOSPI",
      summary:
        "반도체 대형주 중심으로 단기 반등 가능성 포착. 5일 이평선 돌파 후 거래량 동반 상승.",
      content:
        "<h3>분석 요약</h3><p>반도체 섹터 ETF의 외국인 순매수 전환 + RSI 35 → 52 회복.</p><h3>추천 종목</h3><ul><li>OOO전자: 매수가 71,500원 / 목표가 74,000원 / 손절가 70,200원</li></ul>",
    },
    {
      title: "[업비트 단타] 알트코인 회전 매매 시그널",
      category: "DAYTRADE",
      market: "UPBIT",
      summary:
        "BTC 도미넌스 하락 구간 진입. 알트코인 단기 회전 매매 기회 발생.",
      content:
        "<h3>분석 요약</h3><p>BTC.D 54% 하향 돌파 시 알트 시즌 진입 신호.</p><h3>주의</h3><p>변동성 높음, 손절 라인 엄수.</p>",
    },
    {
      title: "[나스닥 스윙] 빅테크 4분기 실적 시즌 대응 전략",
      category: "SWING",
      market: "NASDAQ",
      summary: "FAANG 실적 발표 일정 및 옵션 시장 IV 변동 분석.",
      content:
        "<h3>일정</h3><ul><li>10/24 — TSLA</li><li>10/30 — META</li><li>10/31 — AAPL</li></ul>",
    },
    {
      title: "[코스피 장타] 2차전지 밸류체인 1년 전망",
      category: "LONGTERM",
      market: "KOSPI",
      summary: "양극재·음극재·분리막 핵심 종목 장기 매집 가이드.",
      content:
        "<h3>매집 구간</h3><p>현재가 대비 -8~-12% 구간에서 분할 매수 권고.</p>",
    },
  ];

  for (const r of reports) {
    await prisma.report.create({ data: r });
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
