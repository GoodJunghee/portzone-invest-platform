import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "개인정보처리방침 — 포트존" };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-white py-16">
        <article className="container-narrow max-w-3xl prose prose-navy">
          <h1 className="text-3xl font-bold text-navy-900">개인정보처리방침</h1>
          <p className="text-sm text-navy-500">시행일: 2026-01-01</p>

          <h2>1. 수집하는 개인정보 항목</h2>
          <ul>
            <li>필수: 이메일, 이름, 휴대폰 번호, 비밀번호(암호화 저장)</li>
            <li>자동수집: 접속 IP, 브라우저 정보, 쿠키</li>
            <li>결제 시: 결제수단 정보 (PG사 위탁 처리)</li>
          </ul>

          <h2>2. 개인정보 수집 및 이용목적</h2>
          <ul>
            <li>회원 식별 및 본인 확인</li>
            <li>알림톡·이메일 발송</li>
            <li>구독 관리 및 결제</li>
            <li>서비스 개선 및 통계</li>
            <li>법적 의무 이행</li>
          </ul>

          <h2>3. 개인정보 보유 및 이용기간</h2>
          <ul>
            <li>회원 탈퇴 시 즉시 파기 (관계 법령에 따라 일정 기간 보관 필요한 경우 제외)</li>
            <li>전자상거래법: 계약·청약 철회 기록 5년, 결제 기록 5년</li>
            <li>통신비밀보호법: 로그 기록 3개월</li>
          </ul>

          <h2>4. 개인정보 제3자 제공</h2>
          <p>
            원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만 다음의
            경우 예외로 합니다:
          </p>
          <ul>
            <li>회원이 사전 동의한 경우</li>
            <li>법령에 의거한 수사기관의 요청이 있는 경우</li>
          </ul>

          <h2>5. 개인정보 처리 위탁</h2>
          <ul>
            <li>알림톡 발송: Solapi (또는 NHN Toast 등)</li>
            <li>이메일 발송: Resend</li>
            <li>결제 처리: 토스페이먼츠 (또는 포트원)</li>
            <li>호스팅: Vercel Inc.</li>
            <li>데이터베이스: Neon Postgres</li>
            <li>에러 모니터링: Sentry</li>
          </ul>

          <h2>6. 회원의 권리</h2>
          <p>
            회원은 언제든지 다음 권리를 행사할 수 있습니다:
          </p>
          <ul>
            <li>개인정보 열람·정정·삭제 요구</li>
            <li>처리정지 요구</li>
            <li>회원 탈퇴 (마이페이지 → 계정 설정)</li>
          </ul>

          <h2>7. 안전성 확보 조치</h2>
          <ul>
            <li>비밀번호: bcrypt 해시 저장, 평문 저장 안 함</li>
            <li>전송 구간: HTTPS 암호화</li>
            <li>접근 제어: 관리자 권한 분리</li>
          </ul>

          <h2>8. 쿠키의 운영</h2>
          <p>
            서비스 이용을 위한 세션 유지 목적으로 HttpOnly 쿠키를 사용합니다. 브라우저
            설정으로 쿠키를 거부할 수 있으나 이 경우 일부 서비스 이용에 제한이 있을 수
            있습니다.
          </p>

          <h2>9. 개인정보보호 책임자</h2>
          <p>
            문의: privacy@portzone.kr (운영 시작 후 활성화)
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
