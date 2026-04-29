# 배포 가이드 (GitHub + Vercel + Vercel Postgres)

이 문서는 처음 한 번만 따라하면 되는 단계별 가이드입니다.

---

## 사전 준비

- GitHub 계정
- Vercel 계정 (https://vercel.com — GitHub으로 가입 가능)

---

## 1단계 · GitHub 리포지토리 만들기 (웹에서)

1. https://github.com/new 접속
2. Repository name: `portzone-invest-platform` (자유)
3. **Private** 권장 (소스 비공개)
4. README, .gitignore, License는 **추가하지 말 것** (이미 로컬에 있음)
5. **Create repository** 클릭
6. 생성된 페이지에서 다음 두 줄을 복사 (HTTPS 또는 SSH):

```
git remote add origin https://github.com/<USERNAME>/portzone-invest-platform.git
git branch -M main
git push -u origin main
```

---

## 2단계 · 로컬에서 첫 푸시

프로젝트 폴더에서:

```bash
cd C:/Users/dlwjd/Desktop/claude/portzone/portzone-invest-platform

# 첫 커밋 (이미 git init은 완료됨)
git add .
git commit -m "Initial commit: PortZone MVP (1차+2차)"

# GitHub에 푸시 (위에서 복사한 명령어로 교체)
git remote add origin https://github.com/<USERNAME>/portzone-invest-platform.git
git branch -M main
git push -u origin main
```

푸시되면 GitHub Actions(`.github/workflows/ci.yml`)가 자동으로 타입체크·빌드를 실행합니다.

---

## 3단계 · Vercel에 프로젝트 연결

1. https://vercel.com/new 접속
2. **Import Git Repository** → 방금 만든 `portzone-invest-platform` 선택
3. Framework: **Next.js** 자동 감지 (그대로 두기)
4. **Environment Variables** 섹션에서 아래 값 입력 (DB 연결 후 업데이트할 예정):
   - `DATABASE_URL`: 비워두기 (4단계에서 자동 추가)
   - `JWT_SECRET`: 긴 랜덤 문자열 (예: `openssl rand -base64 32` 결과)
   - `CRON_SECRET`: 긴 랜덤 문자열
5. **Deploy** 클릭 → 첫 배포는 DB 미연결이라 실패할 수 있음 (정상)

---

## 4단계 · Vercel Postgres 연결

1. Vercel 프로젝트 대시보드 → **Storage** 탭
2. **Create Database** → **Postgres** 선택
3. 이름 입력 (예: `portzone-db`) → 리전 선택 (가까운 것: `Tokyo` or `Singapore`)
4. **Create**
5. 생성된 DB가 자동으로 프로젝트와 연결되며, `DATABASE_URL`, `POSTGRES_*` 환경변수가 자동 추가됨
6. 프로젝트 → **Deployments** → 최신 배포의 **Redeploy** 클릭

---

## 5단계 · DB 스키마 적용 + 시드

DB는 비어있으므로 스키마 적용이 필요합니다.

### 방법 A: Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 프로덕션 환경변수를 로컬 .env.production.local로 가져오기
vercel env pull .env.production.local

# 그 환경변수로 prisma push 실행
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d'"' -f2) npx prisma db push

# 시드 데이터 입력 (선택)
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d'"' -f2) npm run db:seed
```

### 방법 B: 한 번만 임시 라우트로 마이그레이션

번거롭다면 임시 마이그레이션 라우트를 만들어 한 번만 실행하는 방법도 있습니다 (배포 후 삭제 권장).

---

## 6단계 · 배포 확인

1. Vercel 대시보드에서 **최신 배포** 상태가 **Ready** 인지 확인
2. 자동 부여된 도메인 클릭 → 예: `https://portzone-invest-platform.vercel.app`
3. 시드 계정으로 로그인:
   - 관리자: `admin@portzone.kr` / `admin1234`
   - 일반회원: `user@portzone.kr` / `user1234`

---

## 7단계 · Cron 자동 발송 확인

`vercel.json`에 등록된 Cron이 5분마다 `/api/cron/alimtalk`을 호출합니다.
Vercel Hobby 플랜은 Cron 일일 호출 제한이 있으므로 운영 환경에서는 Pro 플랜 필요.

확인:
- Vercel 대시보드 → **Settings** → **Cron Jobs** 에서 실행 로그 확인 가능

---

## 자동 배포 흐름

이제 다음과 같이 자동화됩니다:

```
local 코드 수정
   ↓
git push origin main
   ↓
GitHub Actions: CI (typecheck + lint + build) 통과 확인
   ↓
Vercel: 자동 빌드 + 배포
   ↓
프로덕션 URL 자동 반영
```

PR을 만들면 Vercel이 **Preview URL**을 자동 발급해 머지 전 미리보기 가능.

---

## 환경변수 정리

| 키 | 용도 | 어디서 설정 |
|----|------|------------|
| `DATABASE_URL` | PostgreSQL 연결 | Vercel Postgres 자동 |
| `JWT_SECRET` | 세션 토큰 서명 | Vercel 수동 입력 |
| `CRON_SECRET` | Cron 인증 | Vercel 수동 입력 |
| `SOLAPI_API_KEY/SECRET` | 알림톡 (추후) | 추후 |
| `KAKAO_PFID` | 알림톡 발신프로필 | 추후 |
| `TOSS_*` | 결제 (추후) | 추후 |

---

## ⚠️ 알려진 제약

### 파일 업로드 (PDF)
현재 보고서 PDF는 `public/uploads/`에 저장되는데,
**Vercel 서버리스 환경에선 영구 보존되지 않습니다.**
운영에 들어가기 전 S3 / Cloudflare R2 / Vercel Blob Storage로 이전해야 합니다.

### Cron 호출 빈도
Vercel Hobby 플랜: 일 호출 횟수 제한.
운영 시: Pro 플랜 또는 외부 cron(cron-job.org, GitHub Actions schedule)으로 우회.

---

## 트러블슈팅

**Q. `prisma generate` 에러로 빌드 실패**
→ Vercel 빌드는 `package.json`의 `build` 스크립트(`prisma generate && next build`)를 사용하므로 정상 동작. 만약 실패하면 환경변수에 `DATABASE_URL`이 있는지 확인.

**Q. CI가 빨간불(빌드 실패)**
→ `.github/workflows/ci.yml`에 placeholder `DATABASE_URL`을 사용하므로 빌드는 통과해야 함. 코드 에러일 가능성 높음.

**Q. 로그인이 안 됨 / 쿠키가 저장 안 됨**
→ HTTPS 환경 + `JWT_SECRET` 환경변수 설정 확인.

**Q. 시드 다시 실행하고 싶음**
→ `DATABASE_URL=...` 환경변수 설정한 뒤 `npm run db:seed`.
