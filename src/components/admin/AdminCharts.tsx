"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatKRW } from "@/lib/pricing";

const NAVY = "#0A2540";
const GOLD = "#D4AF37";
const MINT = "#00C896";
const RED = "#EF4444";
const PALETTE = ["#0A2540", "#D4AF37", "#00C896", "#486581", "#9FB3C8", "#627D98", "#102A43", "#243B53"];

interface MrrPoint { month: string; mrr: number }
interface SignupPoint { date: string; count: number }
interface NotifPoint { date: string; sent: number; queued: number; failed: number }
interface DistPoint { name: string; count: number }

export function MrrChart({ data }: { data: MrrPoint[] }) {
  return (
    <ChartCard title="MRR 추이 (최근 6개월)">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#627D98" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#627D98"
            tickFormatter={(v) => v >= 10000 ? `${Math.round(v/10000)}만` : String(v)}
          />
          <Tooltip
            formatter={(v: number) => [formatKRW(v), "MRR"]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="mrr"
            stroke={NAVY}
            strokeWidth={2.5}
            dot={{ fill: NAVY, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SignupTrendChart({ data }: { data: SignupPoint[] }) {
  return (
    <ChartCard title="신규 가입 추이 (최근 30일)">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            stroke="#627D98"
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} stroke="#627D98" allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}명`, "신규 가입"]}
          />
          <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function NotificationTrendChart({ data }: { data: NotifPoint[] }) {
  return (
    <ChartCard title="알림 발송 추이 (최근 30일)">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            stroke="#627D98"
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} stroke="#627D98" allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="sent" stroke={MINT} strokeWidth={2} dot={false} name="발송 완료" />
          <Line type="monotone" dataKey="queued" stroke={NAVY} strokeWidth={2} dot={false} name="대기" />
          <Line type="monotone" dataKey="failed" stroke={RED} strokeWidth={2} dot={false} name="실패" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryPieChart({ data }: { data: DistPoint[] }) {
  const filtered = data.filter((d) => d.count > 0);
  const total = filtered.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return <ChartCard title="카테고리 분포"><Empty /></ChartCard>;
  }
  return (
    <ChartCard title="카테고리 분포 (활성 구독)">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(p) => `${p.name} ${Math.round((p.count / total) * 100)}%`}
            labelLine={false}
            fontSize={11}
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}건`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MarketBarChart({ data }: { data: DistPoint[] }) {
  const filtered = data.filter((d) => d.count > 0);
  if (filtered.length === 0) {
    return <ChartCard title="시장별 구독자 수"><Empty /></ChartCard>;
  }
  return (
    <ChartCard title="시장별 구독자 수">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={filtered}
          layout="vertical"
          margin={{ left: 30, right: 30, top: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#627D98" allowDecimals={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#627D98" width={70} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}명`, "구독자"]}
          />
          <Bar dataKey="count" fill={NAVY} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-semibold text-navy-900">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex h-60 items-center justify-center text-xs text-navy-400">
      데이터가 부족합니다
    </div>
  );
}
