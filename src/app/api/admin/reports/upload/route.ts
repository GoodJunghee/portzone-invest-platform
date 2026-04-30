import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { uploadReportPdf } from "@/lib/storage";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import { captureError } from "@/lib/sentry";
import { apiLimiter, getClientIp } from "@/lib/rate-limit";

const ALLOWED_CATEGORIES = ["DAYTRADE", "SWING", "LONGTERM"] as const;
const ALLOWED_MARKETS = [
  "KOSPI", "KOSDAQ", "NASDAQ", "NYSE",
  "BINANCE", "BYBIT", "UPBIT", "BITHUMB",
] as const;

export async function POST(req: Request) {
  // 관리자 권한 + rate limit
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }
  const rl = await apiLimiter(session.userId);
  if (!rl.success) {
    return NextResponse.json({ message: "요청이 너무 많습니다" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = sanitizeText(String(formData.get("title") ?? ""));
    const category = String(formData.get("category") ?? "");
    const market = String(formData.get("market") ?? "");
    const summary = sanitizeText(String(formData.get("summary") ?? ""));
    const content = sanitizeHtml(String(formData.get("content") ?? ""));
    const isPublic = formData.get("isPublic") === "true";
    const isSample = formData.get("isSample") === "true";

    if (!title || !summary || !content) {
      return NextResponse.json({ message: "필수 항목 누락" }, { status: 400 });
    }
    if (!ALLOWED_CATEGORIES.includes(category as never)) {
      return NextResponse.json({ message: "유효하지 않은 카테고리" }, { status: 400 });
    }
    if (!ALLOWED_MARKETS.includes(market as never)) {
      return NextResponse.json({ message: "유효하지 않은 시장" }, { status: 400 });
    }

    // 보고서 먼저 생성 (id 확보)
    const report = await prisma.report.create({
      data: { title, category, market, summary, content, isPublic, isSample },
    });

    // PDF 첨부 시 Blob 업로드 후 보고서에 URL 갱신
    if (file && file.size > 0) {
      try {
        const uploaded = await uploadReportPdf(file, report.id);
        await prisma.report.update({
          where: { id: report.id },
          data: {
            fileUrl: uploaded.url,
            fileName: uploaded.fileName,
            fileSize: uploaded.size,
          },
        });
      } catch (uploadErr) {
        captureError(uploadErr, { reportId: report.id });
        return NextResponse.json(
          {
            message:
              uploadErr instanceof Error
                ? uploadErr.message
                : "PDF 업로드 실패",
            reportId: report.id,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, id: report.id });
  } catch (err) {
    captureError(err, { route: "admin/reports/upload", ip: getClientIp(req) });
    return NextResponse.json({ message: "업로드 처리 실패" }, { status: 500 });
  }
}
