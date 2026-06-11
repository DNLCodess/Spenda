"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Card from "../ui/Card";
import { getCategory } from "@/lib/categories";
import { formatNaira } from "@/lib/format";

export default function CategoryDonut({ byCategory, total }) {
  if (!byCategory.length) return null;
  const data = byCategory.map((c) => ({ name: c.label, value: c.amount, color: c.color }));

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold">Where it goes</p>
      <div className="flex items-center gap-4">
        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={44}
                outerRadius={62}
                paddingAngle={2}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wide text-muted">Spent</span>
            <span className="font-display text-sm font-bold tnum">{formatNaira(total)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {byCategory.map((c) => {
            const Icon = getCategory(c.id).icon;
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Icon size={14} style={{ color: c.color }} />
                    {c.label}
                  </span>
                  <span className="font-medium tnum">{formatNaira(c.amount)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(c.pct, 3)}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
