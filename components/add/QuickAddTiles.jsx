"use client";

import { getCategory } from "@/lib/categories";
import { formatNaira } from "@/lib/format";

// Builds your most-used "combos" (category + payer + amount) so a repeat spend
// is a single tap. Food twice a day stops being four taps and becomes one.
function deriveQuickAdds(transactions, babeName) {
  const counts = new Map();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.amount) continue;
    const key = `${t.category}|${t.payer}|${t.amount}`;
    const prev = counts.get(key);
    if (prev) {
      prev.count += 1;
      prev.last = Math.max(prev.last, new Date(t.occurredAt).getTime());
    } else {
      counts.set(key, {
        count: 1,
        last: new Date(t.occurredAt).getTime(),
        category: t.category,
        payer: t.payer,
        amount: t.amount,
      });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || b.last - a.last)
    .slice(0, 4);
}

export default function QuickAddTiles({ transactions, babeName, onPick }) {
  const tiles = deriveQuickAdds(transactions || [], babeName);
  if (tiles.length === 0) return null;

  return (
    <div>
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted">
        Quick add
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {tiles.map((tile, i) => {
          const cat = getCategory(tile.category);
          const Icon = cat.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(tile)}
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-surface px-3 py-2 ring-1 ring-border transition active:scale-95"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 16%, transparent)` }}
              >
                <Icon size={15} style={{ color: cat.color }} strokeWidth={2.2} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold tnum leading-tight">
                  {formatNaira(tile.amount)}
                </span>
                <span className="block text-[11px] text-muted leading-tight">
                  {cat.label} · {tile.payer === "babe" ? babeName : "Me"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
