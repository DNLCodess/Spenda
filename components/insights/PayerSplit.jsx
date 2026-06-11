"use client";

import Card from "../ui/Card";
import { formatNaira } from "@/lib/format";

export default function PayerSplit({ payer, babeName }) {
  if (payer.total === 0) return null;
  const mePct = Math.round((payer.me / payer.total) * 100);
  const babePct = 100 - mePct;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Who spends more</p>
        <span className="text-xs text-muted">
          {formatNaira(payer.babe)} went to {babeName}
        </span>
      </div>

      <div className="flex h-3 overflow-hidden rounded-full">
        <div style={{ width: `${mePct}%`, backgroundColor: "var(--color-primary)" }} />
        <div style={{ width: `${babePct}%`, backgroundColor: "var(--color-cat-giving)" }} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
          Me · <span className="font-semibold tnum">{formatNaira(payer.me)}</span>
          <span className="text-muted">({mePct}%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-muted">({babePct}%)</span>
          <span className="font-semibold tnum">{formatNaira(payer.babe)}</span> · {babeName}
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-cat-giving)" }} />
        </span>
      </div>
    </Card>
  );
}
