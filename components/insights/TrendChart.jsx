"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import Card from "../ui/Card";
import { formatCompact, formatNaira } from "@/lib/format";

export default function TrendChart({ ins }) {
  const data = [
    { name: "Last month", In: ins.lastIncome, Out: ins.lastExpense },
    { name: "This month", In: ins.income, Out: ins.expense },
  ];
  const hasData = ins.income || ins.expense || ins.lastIncome || ins.lastExpense;
  if (!hasData) return null;

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">In vs out</p>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-income)" }} /> In
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-over)" }} /> Out
          </span>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} barCategoryGap="28%" margin={{ top: 16, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            />
            <Bar dataKey="In" radius={[6, 6, 0, 0]} fill="var(--color-income)" label={renderLabel} />
            <Bar dataKey="Out" radius={[6, 6, 0, 0]} fill="var(--color-over)" label={renderLabel} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function renderLabel({ x, y, width, value }) {
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      textAnchor="middle"
      fontSize={10}
      fill="var(--color-muted)"
    >
      {formatCompact(value)}
    </text>
  );
}
