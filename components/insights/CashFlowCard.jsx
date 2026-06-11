"use client";

import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
import Card from "../ui/Card";
import AnimatedNumber from "../ui/AnimatedNumber";
import { formatNaira } from "@/lib/format";

function Flow({ icon: Icon, label, amount, color }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      >
        <Icon size={17} strokeWidth={2.4} />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-wide text-muted leading-tight">{label}</span>
        <span className="block font-semibold tnum leading-tight">{formatNaira(amount)}</span>
      </span>
    </div>
  );
}

export default function CashFlowCard({ ins, monthName }) {
  const savingsPositive = ins.net >= 0;
  return (
    <Card className="bg-gradient-to-br from-surface to-surface-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Balance</p>
          <AnimatedNumber
            value={ins.balance}
            format={formatNaira}
            className="font-display text-4xl font-bold tnum"
          />
        </div>
        {ins.income > 0 && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              color: savingsPositive ? "var(--color-income)" : "var(--color-over)",
              backgroundColor: `color-mix(in srgb, ${
                savingsPositive ? "var(--color-income)" : "var(--color-over)"
              } 14%, transparent)`,
            }}
          >
            <PiggyBank size={15} />
            {Math.round(ins.savingsRate)}% saved
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Flow icon={ArrowDownLeft} label={`In · ${monthName}`} amount={ins.income} color="var(--color-income)" />
        <div className="h-8 w-px bg-border" />
        <Flow icon={ArrowUpRight} label={`Out · ${monthName}`} amount={ins.expense} color="var(--color-over)" />
      </div>
    </Card>
  );
}
