# 포트존 (PortZone)

주식·코인 종목 추천 플랫폼

## 개요
- **시장**: 코스피 / 코스닥 / 나스닥 / 뉴욕증시 / 바이낸스 / 바이비트 / 업비트 / 빗썸
- **카테고리**: 단타(1일) · 스윙(3~5일) · 장타(1달~1년) · 올인원
- **알림**: 카카오 알림톡 (Solapi 연동 예정)
- **결제**: 정기결제 (토스페이먼츠 연동 예정)
- **배포**: GitHub + Vercel + Vercel Postgres / Neon

## 기술 스택
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS — 신뢰감 있는 핀테크 톤
- Prisma + PostgreSQL
- bcryptjs + JWT 쿠키 인증
- Vercel Blob (보고서 PDF 저장)
- Resend (트랜잭셔널 이메일)
- Upstash Redis (rate limit, 옵션)
- Sentry (에러 모니터링, 옵션)
- DOMPurify (XSS 방지)

## 설치 및 실행

```bash
cd portzone-invest-platform
npm install
cp .env.example .env

# DB 초기화 + 시드
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
| `/pricing` | 요금제 (실시간 가격 계산) |
| `/signup` `/login` | 가입 / 로그인 |
| `/forgot-password` `/reset-password` | 비밀번호 찾기 / 재설정 |
| `/verify-email` | 이메일 인증 |
| `/mypage` | 구독 / 알림 / 관심종목 / 보고서 |
| `/mypage/account` | 계정 설정 (비밀번호 변경, 회원 탈퇴) |
| `/mypage/preferences` | 알림 수신 설정 |
| `/reports` `/reports/[id]` | 보고서 목록·상세 |
| `/admin` | 관리자 대시보드 |
| `/legal/terms` `/legal/privacy` `/legal/disclaimer` | 약관 / 개인정보 / 투자 유의사항 |

## API

### 인증
- `POST /api/auth/signup` — 가입 + 이메일 인증 토큰 발송
- `POST /api/auth/login` — 로그인 (rate limit, 탈퇴 회원 차단)
- `POST /api/auth/logout`
- `POST /api/auth/verify-email` — 토큰으로 이메일 인증
- `POST /api/auth/verify-email/resend` — 인증 메일 재발송 (1시간당 3회)
- `POST /api/auth/forgot-password` — 비밀번호 재설정 메일
- `POST /api/auth/reset-password` — 비밀번호 재설정
- `POST /api/auth/change-password` — 로그인 후 비밀번호 변경

### 계정
- `POST /api/account/delete` — 회원 탈퇴 (soft delete)

### 구독
- `GET POST /api/subscriptions`
- `DELETE /api/subscriptions/[id]`

### 관심 종목
- `GET POST /api/watchlist`
- `DELETE /api/watchlist/[id]`

### 알림 설정
- `GET PUT /api/preferences`

### 관리자
- `POST /api/admin/reports` — 본문만 업로드 (sanitize 적용)
- `POST /api/admin/reports/upload` — PDF 포함 업로드 (Vercel Blob)
- `POST /api/admin/alimtalk/dispatch` — 즉시 발송
- `POST /api/admin/alimtalk/schedule` — 예약 발송
- `GET /api/admin/alimtalk/schedule` — 예약 목록

### Cron
- `GET /api/cron/alimtalk` — Vercel Cron이 호출 (Bearer / ?key=)

## 가격 정책

### 시장 1개당 단가
| 카테고리 | 단가 |
|----------|------|
| 단타 | 월 5,000원 |
| 스윙 | 월 2,000원 |
| 장타 | 연 10,000원 (연간 전용) |
| 올인원 | 단타+스윙+장타 합계 × 0.65 |

### 다중선택 할인
| 시장 개수 | 할인율 |
|-----------|--------|
| 1~2개 | 0% |
| 3~4개 | 10% |
| 5~7개 | 15% |
| 8개 (전체) | 20% |

### 연간 결제
- 월 요금 × 10 (2개월 무료)

## 보안

| 항목 | 적용 위치 |
|------|----------|
| Security Headers (HSTS, X-Frame-Options 등) | `next.config.mjs` |
| Rate Limit (auth/email/api) | `src/lib/rate-limit.ts` |
| HTML Sanitization (DOMPurify) | `src/lib/sanitize.ts` |
| 비밀번호 해시 (bcrypt) | `src/lib/auth.ts` |
| JWT 세션 (HttpOnly + Secure) | `src/lib/auth.ts` |
| 탈퇴 회원 차단 | `getSession()` |
| 에러 모니터링 | `src/lib/sentry.ts` |

## Batch 5 완료 ✅
- [x] **블로그/뉴스 시스템** — `BlogPost` 모델, `/blog`, `/blog/[slug]`
  - 카테고리: 시장 분석 / 투자 전략 / 뉴스 / 가이드
  - 검색·카테고리 필터·페이지네이션
  - 슬러그 기반 URL + 자동 생성 + 충돌 방지
  - 관리자 작성/수정/삭제 (`/admin/blog`)
  - DRAFT / PUBLISHED / ARCHIVED 상태 토글
  - 조회수 자동 증가
  - 태그 시스템 (CSV)
- [x] **무료 샘플 보고서** — `Report.isPublic`, `Report.isSample`
  - 비로그인 사용자도 isPublic 보고서 본문 열람 가능
  - 랜딩 페이지에 isSample 보고서 자동 노출 (최대 3개)
  - 관리자 업로드 폼에 토글 추가
- [x] **SEO 최적화**
  - `sitemap.xml` 자동 생성 (정적 + 보고서 + 블로그 포스트 동적 포함)
  - `robots.txt` (admin/api/mypage 차단)
  - 블로그 상세 페이지 OpenGraph + Twitter Card 메타
  - JSON-LD Article schema (구조화된 데이터)
  - 보고서 상세 페이지 canonical + OpenGraph
  - 블로그 → 가입 CTA (전환 유도)

## Batch 4 완료 ✅
- [x] **PWA** — manifest.json, SVG 아이콘, apple-touch-icon, theme-color 메타
- [x] **다크모드** — Tailwind class 전략 + globals.css 토큰 오버라이드 + ThemeProvider/Toggle
  - light / dark / system 3-mode 토글
  - localStorage 영속, FOUC 방지 inline script
  - `prefers-color-scheme` 시스템 감지
- [x] **모바일 햄버거 메뉴** (Drawer + Backdrop, ESC 닫기, body scroll lock)
- [x] **i18n lite** — 쿠키 기반 ko/en 토글 (`/api/lang`)
- [x] **다국어 적용** — 랜딩 / 가격 / 헤더 / 푸터
- [x] **반응형 보강** — 마이페이지 헤더 액션 wrap, 컨테이너 패딩 모바일 최적화

## Batch 3 완료 ✅
- [x] 관리자 통계 차트 (Recharts) — MRR 추이 / 신규가입 / 알림 추이 / 카테고리·시장 분포
- [x] 통계 lib 확장 — getMrrTrend, getSignupTrend, getNotificationTrend, getCategoryDistribution, getMarketDistribution
- [x] 보고서 검색·필터·페이지네이션 (`/api/reports?q=&category=&market=&page=`)
- [x] 마이페이지 알림 무한 스크롤 (IntersectionObserver + cursor)
- [x] 관리자 회원 검색·필터 (`/admin/members`) — 이름/이메일/전화 검색 + 권한/인증/구독/탈퇴 필터
- [x] 보고서 템플릿 (저장 → 업로드 폼에서 1클릭 적용)
- [x] 알림톡 템플릿 라이브러리 (변수 `{{symbol}}` 등 치환 + 라이브 미리보기)
- [x] 관리자 통합 메뉴 (대시보드 / 회원관리 / 환불관리 / 템플릿)

## Batch 2 완료 ✅
- [x] 무료 체험 7일 — 가입 시 자동 부여 (`grantTrialIfEligible`)
- [x] 환불 일할 계산 — 7일 이내 100%, 이후 잔여일 환불
- [x] 환불 요청 API + 관리자 승인/거절 페이지
- [x] 리퍼럴 보상 — 가입 시 양쪽에 1개월 무료 쿠폰 (90일 유효)
- [x] 추천 코드 자동 적용 (URL `?ref=CODE`)
- [x] 쿠폰 시스템 — FREE_MONTH / PERCENT / FIXED_AMOUNT
- [x] 쿠폰 미리보기 + 결제 시 적용
- [x] 관심 종목 자동 매칭 — `symbol` 입력 시 watchlist 매치자에게 HIGH priority
- [x] `watchlistOnly` 옵션 — 관심종목만 받는 모드
- [x] Cron: trial 만료, 쿠폰 만료 (`/api/cron/expire`)
- [x] 마이페이지 통합 — TrialBanner / CouponList / ReferralStats / RefundButton

## Batch 1 완료 ✅
- [x] 이메일 인증 (가입 시 토큰 발송, 인증 페이지, 재발송)
- [x] 비밀번호 찾기·재설정 (포트 토큰 1시간 TTL)
- [x] 비밀번호 변경 (로그인 상태)
- [x] 회원 탈퇴 (soft delete, 비밀번호 + DELETE 확인)
- [x] 보고서 PDF → Vercel Blob 저장
- [x] 보안 헤더 + Rate Limit + Sanitization
- [x] Sentry 에러 추적
- [x] 약관 / 개인정보 / 투자 유의사항 페이지
- [x] 추천 코드 발급 + 가입 시 입력
- [x] 가입 폼 약관 링크 + 알림톡 동의

## 다음 (Batch 2 — 비즈니스 로직)
- [ ] 무료 체험 7일 (Trial)
- [ ] 환불·일할 계산
- [ ] 리퍼럴 코드 보상 시스템
- [ ] 관심 종목 자동 매칭

## 운영 주의사항

### Vercel Blob (PDF)
- Vercel Storage → Blob 생성 시 `BLOB_READ_WRITE_TOKEN` 자동 등록
- 미설정 시 PDF 업로드 라우트가 명시적 에러 반환

### Resend (이메일)
- 키 미설정 시 콘솔에 출력만 (개발 모드 동작)
- 운영 시 도메인 인증 후 `EMAIL_FROM` 을 본인 도메인으로 변경

### Upstash Redis (rate limit)
- 미설정 시 in-memory fallback (단일 인스턴스에선 동작, Vercel 다중 함수 인스턴스에선 분산 안 됨)
- 운영 시 Upstash 가입해서 환경변수 등록 권장

### Sentry
- 미설정 시 `console.error` fallback
- 운영 시 https://sentry.io 가입 → Next.js 프로젝트 생성 → DSN 등록

## ⚠️ 고지사항
본 서비스에서 제공하는 종목 추천 및 보고서는 투자 판단의 참고용 정보이며,
최종 투자 결정과 그에 따른 손익은 사용자 본인의 책임입니다.
