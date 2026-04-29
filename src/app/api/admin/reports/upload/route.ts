import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "reports");
const ALLOWED_EXT = [".pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "");
  const market = String(formData.get("market") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const content = String(formData.get("content") ?? "");

  if (!title || !category || !market || !summary || !content) {
    return NextResponse.json({ message: "필수 항목 누락" }, { status: 400 });
  }

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  if (file && file.size > 0) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { message: "PDF 파일만 업로드 가능합니다" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: "파일 크기는 10MB 이하" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, safeName), buf);

    fileUrl = `/uploads/reports/${safeName}`;
    fileName = file.name;
    fileSize = file.size;
  }

  const r = await prisma.report.create({
    data: {
      title,
      category,
      market,
      summary,
      content,
      fileUrl,
      fileName,
      fileSize,
    },
  });

  return NextResponse.json({ ok: true, id: r.id });
}
