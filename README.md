# 포트존 (PortZone)

주식·코인 종목 추천 플랫폼

## 개요
- **시장**: 코스피 / 코스닥 / 나스닥 / 뉴욕증시 / 바이낸스 / 바이비트 / 업비트 / 빗썸 (8개)
- **카테고리**: 단타(1일) · 스윙(3~5일) · 장타(1달~1년) · 올인원
- **알림**: 카카오 알림톡 (정식 오픈 시 Solapi/NHN Toast 등 연동)
- **결제**: PG 연동 추후 적용

## 기술 스택
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS — 신뢰감 있는 핀테크 톤 (네이비 + 골드)
- Prisma + **PostgreSQL** (개발/운영 동일)
- bcryptjs + JWT 쿠키 인증
- 배포: GitHub Actions (CI) + Vercel (CD) + Vercel Postgres

## 배포

처음 배포 시 [`DEPLOYMENT.md`](DEPLOYMENT.md) 참조.

자동 배포 흐름:
```
git push origin main → GitHub Actions(CI) → Vercel 자동 배포
```

## 설치 및 실행 (로컬 개발)

로컬에서 PostgreSQL이 필요합니다. 다음 중 택1:
- **Docker**: `docker run --name pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16`
  → `DATABASE_URL="postgresql://postgres:dev@localhost:5432/postgres"`
- **Vercel Postgres**: `vercel env pull .env.development.local` 로 운영 DB 사용 (주의: 데이터 공유)
- **Supabase / Neon**: 무료 PostgreSQL 인스턴스 생성 후 연결 문자열 사용

```bash
cd portzone-invest-platform
npm install
cp .env.example .env
# .env 의 DATABASE_URL 채우기

npm run db:push
npm run db:seed

npm run dev
```

http://localhost:3000

### 시드 계정
| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@portzone.kr | admin1234 |
| 일반회원 | user@portzone.kr | user1234 |

## 주요 페이지
| 경로 | 설명 |
|------|------|
| `/` | 랜딩페이지 |
| `/pricing` | 요금제 선택 (실시간 가격 계산) |
| `/signup` `/login` | 가입/로그인 |
| `/mypage` | 구독·알림내역·관심종목·보고서 |
| `/mypage/preferences` | 알림 수신 설정 |
| `/checkout/success` | 구독 신청 완료 |
| `/reports` `/reports/[id]` | 보고서 목록·상세 |
| `/admin` | 관리자 대시보드 (KPI · 보고서 업로드 · 알림톡) |

## API

### 인증
- `POST /api/auth/signup` `POST /api/auth/login` `POST /api/auth/logout`

### 구독
- `POST /api/subscriptions` — 구독 신청 (서버에서 가격 재검증)
- `GET /api/subscriptions` — 내 구독 목록
- `DELETE /api/subscriptions/[id]` — 해지

### 관심 종목
- `GET /api/watchlist` `POST /api/watchlist` `DELETE /api/watchlist/[id]`

### 알림 설정
- `GET /api/preferences` `PUT /api/preferences`

### 관리자
- `POST /api/admin/reports/upload` — 보고서 + PDF 업로드
- `POST /api/admin/alimtalk/dispatch` — 즉시 발송
- `POST /api/admin/alimtalk/schedule` — 예약 발송 등록
- `GET /api/admin/alimtalk/schedule` — 예약 목록

### Cron
- `GET /api/cron/alimtalk?key={CRON_SECRET}` — 예약된 잡 실행
  - 외부 cron(Vercel Cron, cron-job.org, GitHub Actions)이 1~5분 단위로 호출

## 가격 정책

### 시장 1개당 단가
| 카테고리 | 단가 |
|----------|------|
| 단타 | 월 5,000원 |
| 스윙 | 월 2,000원 |
| 장타 | 연 10,000원 (연간 전용) |
| 올인원 | 단타+스윙+장타 합계 × 0.65 (35% 할인) |

### 다중선택 할인
| 시장 개수 | 할인율 |
|-----------|--------|
| 1~2개 | 0% |
| 3~4개 | 10% |
| 5~7개 | 15% |
| 8개 (전체) | 20% |

### 연간 결제
- 월 요금 × **10** (2개월 무료)

가격 계산 로직: [`src/lib/pricing.ts`](src/lib/pricing.ts) — 서버측 재검증 포함

## 1차 MVP 완료 ✅
- [x] 랜딩페이지 (Hero / 시장 / 카테고리 / 기능 / FAQ)
- [x] 실시간 가격 계산 요금제 페이지
- [x] 회원가입 / 로그인 / 마이페이지
- [x] 보고서 목록·상세
- [x] 관리자 대시보드 (회원·보고서·알림톡)
- [x] 알림톡 즉시 발송 트리거 (DB 큐)

## 2차 MVP 완료 ✅
- [x] **가격 견적 라인 표시 개선** — 단가표·다중할인·연간할인 명확하게 분리
- [x] **구독 신청 플로우** — Pricing → API (서버측 재검증) → 완료 페이지 → 마이페이지
- [x] **구독 해지** — 마이페이지에서 직접 해지 가능
- [x] **관심 종목 (Watchlist)** — 사용자가 종목 등록/삭제
- [x] **보고서 PDF 업로드** — 관리자가 PDF 파일 첨부 (로컬 `public/uploads`, 10MB)
- [x] **알림톡 예약 발송** — 시각 지정 후 cron 실행
- [x] **Cron 엔드포인트** — `/api/cron/alimtalk` (CRON_SECRET 보호)
- [x] **알림 수신 설정** — 채널(알림톡/이메일) 및 시점(장시작/마감/긴급) ON/OFF
- [x] **관리자 KPI** — MRR, ARR, 신규가입, 활성구독, 발송률
- [x] **알림 발송 잡 추적** — SCHEDULED → RUNNING → COMPLETED

## 다음 단계 (3차 MVP)
- [ ] PG 연동 (토스페이먼츠 / 포트원 정기결제)
- [ ] 카카오 알림톡 실 연동 (Solapi)
- [ ] 알림톡 템플릿 사전 승인 (카카오 비즈메시지 심사)
- [ ] 관심 종목 → 자동 시그널 발송 매칭
- [ ] 보고서 검색 / 카테고리 필터 / 페이지네이션
- [ ] 모바일 최적화 + PWA
- [ ] 통계 차트 (Recharts) — MRR 추이, DAU
- [ ] PostgreSQL 마이그레이션
- [ ] S3/Cloudflare R2 업로드 (현재는 로컬)

## 운영 cron 예시 (Vercel Cron)
`vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/alimtalk?key=YOUR_SECRET", "schedule": "*/5 * * * *" }
  ]
}
```

## ⚠️ 고지사항
본 서비스에서 제공하는 종목 추천 및 보고서는 투자 판단의 참고용 정보이며,
최종 투자 결정과 그에 따른 손익은 사용자 본인의 책임입니다.
