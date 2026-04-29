import { Resend } from "resend";
import { captureError } from "./sentry";

/**
 * 이메일 발송 (Resend 사용)
 *
 * 환경변수:
 * - RESEND_API_KEY (https://resend.com)
 * - EMAIL_FROM (예: "PortZone <noreply@portzone.kr>" — 도메인 인증 후 사용)
 *
 * 키 미설정 시 콘솔에 출력만 (개발 모드).
 */

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "PortZone <onboarding@resend.dev>";
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log("[email/dev]", opts.to, opts.subject);
    console.log(opts.html);
    return { ok: true, dev: true };
  }
  try {
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      captureError(error, { to: opts.to, subject: opts.subject });
      return { ok: false, error };
    }
    return { ok: true };
  } catch (e) {
    captureError(e, { to: opts.to, subject: opts.subject });
    return { ok: false, error: e };
  }
}

function appUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}${path}`;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = appUrl(`/verify-email?token=${token}`);
  return sendEmail({
    to,
    subject: "[포트존] 이메일 인증을 완료해주세요",
    html: emailLayout(`
      <h2 style="color:#0A2540;margin:0 0 16px">${escape(name)}님, 환영합니다.</h2>
      <p>아래 버튼을 눌러 이메일 인증을 완료해주세요. 인증 링크는 24시간 동안 유효합니다.</p>
      <p style="margin:32px 0">
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#0A2540;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">이메일 인증하기</a>
      </p>
      <p style="font-size:12px;color:#627D98">버튼이 동작하지 않으면 다음 링크를 직접 열어주세요:<br>${link}</p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = appUrl(`/reset-password?token=${token}`);
  return sendEmail({
    to,
    subject: "[포트존] 비밀번호 재설정 안내",
    html: emailLayout(`
      <h2 style="color:#0A2540;margin:0 0 16px">${escape(name)}님,</h2>
      <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 눌러 새 비밀번호를 설정해주세요. 링크는 1시간 동안 유효합니다.</p>
      <p style="margin:32px 0">
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#0A2540;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">비밀번호 재설정</a>
      </p>
      <p style="font-size:12px;color:#627D98">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
    `),
  });
}

function emailLayout(body: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F0F4F8;font-family:'Pretendard',-apple-system,sans-serif;color:#102A43">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F8;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(10,37,64,.06)">
        <tr><td>
          <div style="font-size:20px;font-weight:800;color:#0A2540;margin-bottom:32px">포트존<span style="color:#D4AF37">.</span></div>
          ${body}
          <hr style="border:none;border-top:1px solid #D9E2EC;margin:32px 0">
          <p style="font-size:11px;color:#9FB3C8;margin:0">© 2026 PortZone. 본 서비스 정보는 투자 참고용이며 최종 책임은 사용자 본인에게 있습니다.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

function escape(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;",
  })[c]!);
}
