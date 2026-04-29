"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Pref {
  alimtalkEnabled: boolean;
  emailEnabled: boolean;
  preMarketOpen: boolean;
  preMarketClose: boolean;
  urgentSignal: boolean;
}

export function PreferencesForm({ initial }: { initial: Pref }) {
  const router = useRouter();
  const [pref, setPref] = useState<Pref>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function update<K extends keyof Pref>(key: K, value: Pref[K]) {
    setPref((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pref),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("저장 완료");
      router.refresh();
    } else {
      setMsg("저장 실패");
    }
  }

  return (
    <div className="space-y-6">
      <Group title="알림 채널">
        <Toggle
          label="카카오 알림톡"
          desc="가입 시 등록한 휴대폰 번호로 알림 수신"
          checked={pref.alimtalkEnabled}
          onChange={(v) => update("alimtalkEnabled", v)}
        />
        <Toggle
          label="이메일"
          desc="중요 보고서 발행 시 이메일 알림"
          checked={pref.emailEnabled}
          onChange={(v) => update("emailEnabled", v)}
        />
      </Group>

      <Group title="발송 시점">
        <Toggle
          label="장 시작 전 알림"
          desc="장 개장 30분 전 (코스피·코스닥 08:30 / 나스닥 22:00)"
          checked={pref.preMarketOpen}
          onChange={(v) => update("preMarketOpen", v)}
        />
        <Toggle
          label="장 마감 전 알림"
          desc="장 마감 30분 전 (코스피·코스닥 15:00 / 나스닥 04:30)"
          checked={pref.preMarketClose}
          onChange={(v) => update("preMarketClose", v)}
        />
        <Toggle
          label="긴급 시그널 알림"
          desc="주요 변동성 또는 시그널 발생 시 즉시"
          checked={pref.urgentSignal}
          onChange={(v) => update("urgentSignal", v)}
        />
      </Group>

      {msg && (
        <div className="rounded-lg bg-mint-500/10 p-3 text-sm text-mint-600">
          {msg}
        </div>
      )}

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "저장 중..." : "변경사항 저장"}
      </button>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-500">
        {title}
      </h3>
      <div className="mt-3 divide-y divide-navy-100 rounded-xl border border-navy-100">
        {children}
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
      <div>
        <div className="text-sm font-semibold text-navy-900">{label}</div>
        <div className="mt-0.5 text-xs text-navy-500">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
          checked ? "bg-navy-900" : "bg-navy-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
