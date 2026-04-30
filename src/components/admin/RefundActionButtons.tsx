"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefundActionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "APPROVE" | "REJECT") {
    const note =
      action === "REJECT"
        ? prompt("거절 사유를 입력해주세요 (선택)", "") ?? ""
        : "";
    if (action === "APPROVE" && !confirm("이 환불 요청을 승인하시겠습니까?")) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/refunds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note || undefined }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json();
      alert(d.message ?? "처리 실패");
    }
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => act("APPROVE")}
        disabled={busy}
        className="rounded-md bg-mint-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-mint-600 disabled:opacity-50"
      >
        승인
      </button>
      <button
        onClick={() => act("REJECT")}
        disabled={busy}
        className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-600 disabled:opacity-50"
      >
        거절
      </button>
    </div>
  );
}
