import Link from "next/link";
import { Sparkles, Clock } from "lucide-react";

interface Sub {
  status: string;
  trialEndsAt?: Date | string | null;
  endDate?: Date | string | null;
}

export function TrialBanner({ trialSub }: { trialSub: Sub | null }) {
  if (!trialSub || trialSub.status !== "TRIAL") return null;

  const ends = trialSub.trialEndsAt ?? trialSub.endDate;
  if (!ends) return null;

  const endsAt = new Date(ends);
  const remainingMs = endsAt.getTime() - Date.now();
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gold-500 bg-gradient-to-r from-gold-500/10 via-gold-500/5 to-transparent p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gold-500 text-navy-900">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-navy-900">7일 무료 체험 중</span>
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
              ALL ACCESS
            </span>
          </div>
          <p className="mt-1 text-sm text-navy-700">
            모든 시장 + 단타 카테고리 미리보기.{" "}
            <span className="font-semibold">
              <Clock className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
              {remainingDays}일 남음
            </span>{" "}
            ({endsAt.toLocaleDateString("ko-KR")} 종료)
          </p>
          <div className="mt-4">
            <Link href="/pricing" className="btn-primary !py-2 !px-4 text-xs">
              정식 요금제로 업그레이드
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
