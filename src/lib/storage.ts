import { put, del } from "@vercel/blob";

/**
 * 파일 저장소 — Vercel Blob 기반
 *
 * 환경변수: BLOB_READ_WRITE_TOKEN (Vercel Storage → Blob 생성 시 자동 추가)
 *
 * 미설정 시 throw (개발에서는 토큰 없이 업로드 호출 안 되도록).
 */

const ALLOWED_PDF_TYPES = ["application/pdf"];
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

export async function uploadReportPdf(
  file: File,
  reportId: string
): Promise<UploadResult> {
  if (!ALLOWED_PDF_TYPES.includes(file.type)) {
    throw new Error("PDF 파일만 업로드 가능합니다");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF 파일 크기는 10MB 이하만 허용됩니다");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Vercel Blob이 설정되지 않았습니다 (BLOB_READ_WRITE_TOKEN 누락)"
    );
  }

  const ext = file.name.split(".").pop() ?? "pdf";
  const safeName = `reports/${reportId}-${Date.now()}.${ext}`;

  const blob = await put(safeName, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    fileName: file.name,
    size: file.size,
  };
}

export async function deleteBlob(url: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch (e) {
    console.error("[blob delete failed]", e);
  }
}
