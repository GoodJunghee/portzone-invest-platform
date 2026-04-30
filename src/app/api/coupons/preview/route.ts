import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { previewCoupon } from "@/lib/coupon";
import { apiLimiter } from "@/lib/rate-limit";

const Schema = z.object({
  code: z.string().min(1).max(40),
  basePriceKrw: z.number().int().min(0),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인 필요" }, { status: 401 });
  }
  const rl = await apiLimiter(session.userId);
  if (!rl.success) {
    return NextResponse.json({ message: "잠시 후 다시 시도" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값 오류" }, { status: 400 });
  }

  const result = await previewCoupon(
    session.userId,
    parsed.data.code,
    parsed.data.basePriceKrw
  );
  if (!result.success) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, ...result });
}
