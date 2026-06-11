"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import Card from "../ui/Card";
import { getCategory } from "@/lib/categories";
import { formatNaira } from "@/lib/format";
import { applyWhatIf } from "@/lib/insights";

export default function WhatIfSimulator({ ins }) {
  const [cuts, setCuts] = useState({});
  if (!ins.byCategory.length) return null;

  const result = applyWhatIf(ins, cuts);
  const touched = result.saved > 0;

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <Wand2 size={16} style={{ color: "var(--color-primary)" }} />
        <p className="text-sm font-semibold">What if I spent less?</p>
      </div>
      <p className="mb-4 text-xs text-muted">Drag to trim a category and see what you'd keep.</p>

      <div className="space-y-4">
        {ins.byCategory.map((c) => {
          const pct = cuts[c.id] || 0;
          const cat = getCategory(c.id);
          const Icon = cat.icon;
          return (
            <div key={c.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Icon size={14} style={{ color: c.color }} />
                  {c.label}
                </span>
                <span className="tnum text-muted">
                  {pct > 0 ? `−${pct}% · save ${formatNaira((c.amount * pct) / 100)}` : formatNaira(c.amount)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={pct}
                onChange={(e) => setCuts((p) => ({ ...p, [c.id]: Number(e.target.value) }))}
                className="w-full accent-[var(--color-primary)]"
                style={{ accentColor: c.color }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-3 text-center">
        <Stat label="New monthly" value={formatNaira(result.newExpense)} />
        <Stat
          label="You'd save"
          value={formatNaira(result.saved)}
          highlight={touched}
        />
        <Stat label="Per year" value={formatNaira(result.annual)} highlight={touched} />
      </div>
      {ins.income > 0 && touched && (
        <p className="mt-3 text-center text-xs text-muted">
          Savings rate would rise to{" "}
          <span className="font-semibold" style={{ color: "var(--color-income)" }}>
            {Math.round(result.newSavingsRate)}%
          </span>
        </p>
      )}
    </Card>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p
        className="font-display text-sm font-bold tnum"
        style={highlight ? { color: "var(--color-income)" } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
