import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * cron 트리거용 엔드포인트
 *
 * 운영 시 외부 cron(예: cron-job.org / Vercel Cron / GitHub Actions)이
 * 5분 또는 1분 단위로 호출하여 scheduledAt이 지난 SCHEDULED 잡을 실행한다.
 *
 * 보안: ?key=CRON_SECRET 또는 헤더로 보호. (.env에 CRON_SECRET 추가)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const secret = process.env.CRON_SECRET ?? "";

  // Vercel Cron은 Bearer 헤더, 외부 cron-job.org 등은 ?key= 쿼리 사용
  const provided = bearer || key;
  // 운영에선 CRON_SECRET 미설정 시 무조건 차단 (cron 라우트 공개 방지)
  if (process.env.NODE_ENV === "production" && !secret) {
    return NextResponse.json({ message: "cron secret not configured" }, { status: 503 });
  }
  if (secret && provided !== secret) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.alimtalkJob.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });

  const results: Array<{ jobId: string; targets: number }> = [];

  for (const job of due) {
    await prisma.alimtalkJob.update({
      where: { id: job.id },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    // 발송 대상 산정
    const subs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ category: job.category }, { category: "ALLINONE" }],
      },
    });
    const targets = subs.filter((s) =>
      s.markets.split(",").includes(job.market)
    );

    // 큐 등록
    if (targets.length > 0) {
      await prisma.$transaction(
        targets.map((s) =>
          prisma.notificationLog.create({
            data: {
              userId: s.userId,
              channel: "ALIMTALK",
              category: job.category,
              market: job.market,
              title: job.title,
              message: job.message,
              status: "QUEUED",
            },
          })
        )
      );
    }

    // TODO: 실제 Solapi/NHN 알림톡 API 호출
    // 지금은 즉시 SENT 처리 (모의 발송)
    await prisma.notificationLog.updateMany({
      where: {
        userId: { in: targets.map((t) => t.userId) },
        category: job.category,
        market: job.market,
        title: job.title,
        status: "QUEUED",
      },
      data: { status: "SENT", sentAt: new Date() },
    });

    await prisma.alimtalkJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        totalCount: targets.length,
        sentCount: targets.length,
      },
    });

    results.push({ jobId: job.id, targets: targets.length });
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
