"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function LoanBreakdownChart({ principal, interest }) {
  const mounted = useMounted();
  const data = [
    { name: "Principal", value: Math.max(0, principal) },
    { name: "Interest", value: Math.max(0, interest) }
  ];
  const colors = ["#7cffc4", "#2764ff"];

  if (!mounted) return <ChartSkeleton />;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `RM ${Math.round(value).toLocaleString("en-MY")}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BankComparisonChart({ rows }) {
  const mounted = useMounted();
  const data = rows.map((row) => ({
    bank: row.name.replace(" Bank", ""),
    repayment: Math.round(row.totalRepayment),
    interest: Math.round(row.totalInterest)
  }));

  if (!mounted) return <ChartSkeleton />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="bank" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
          <Tooltip formatter={(value) => `RM ${Math.round(value).toLocaleString("en-MY")}`} />
          <Bar dataKey="interest" name="Total interest" fill="#7cffc4" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-sm text-slate-500">
      Loading chart...
    </div>
  );
}
