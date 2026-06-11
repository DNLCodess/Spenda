"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Search, ReceiptText } from "lucide-react";
import { activeTransactions } from "@/lib/db";
import { getCategory } from "@/lib/categories";
import { useSettings } from "@/lib/store";
import { formatSigned } from "@/lib/format";
import { dayKey, dayLabel, timeLabel } from "@/lib/dates";
import Segmented from "../ui/Segmented";
import EditSheet from "./EditSheet";

export default function HistoryScreen() {
  const babeName = useSettings((s) => s.babeName);
  const transactions = useLiveQuery(() => activeTransactions(), [], null);

  const [type, setType] = useState("all"); // all | expense | income
  const [payer, setPayer] = useState("all"); // all | me | babe
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);

  const groups = useMemo(() => {
    if (!transactions) return [];
    const q = query.trim().toLowerCase();
    const filtered = transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (payer !== "all" && t.type === "expense" && t.payer !== payer) return false;
      if (payer !== "all" && t.type === "income") return false;
      if (q) {
        const cat = getCategory(t.category).label.toLowerCase();
        if (!t.note?.toLowerCase().includes(q) && !cat.includes(q)) return false;
      }
      return true;
    });

    const byDay = new Map();
    for (const t of filtered) {
      const key = dayKey(t.occurredAt);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(t);
    }
    return [...byDay.entries()]
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([key, items]) => ({
        key,
        label: dayLabel(key),
        net: items.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0),
        items,
      }));
  }, [transactions, type, payer, query]);

  if (!transactions) return null;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Filters */}
      <div className="mb-3 space-y-3">
        <Segmented
          id="hist-type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All" },
            { value: "expense", label: "Out" },
            { value: "income", label: "In" },
          ]}
        />

        {type !== "income" && (
          <div className="flex gap-2">
            {[
              { v: "all", l: "Everyone" },
              { v: "me", l: "Me" },
              { v: "babe", l: babeName },
            ].map((p) => (
              <button
                key={p.v}
                onClick={() => setPayer(p.v)}
                className="rounded-full px-3 py-1.5 text-sm font-medium transition"
                style={{
                  color: payer === p.v ? "var(--color-primary-ink)" : "var(--color-muted)",
                  backgroundColor: payer === p.v ? "var(--color-primary)" : "var(--color-surface)",
                  boxShadow: payer === p.v ? "none" : "inset 0 0 0 1px var(--color-border)",
                }}
              >
                {p.l}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-full bg-surface px-3 ring-1 ring-border">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes or category…"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* List */}
      {groups.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center text-muted">
          <ReceiptText size={40} strokeWidth={1.5} />
          <p className="mt-3 text-sm">Nothing here yet. Add a few entries and they'll show up.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{g.label}</span>
                <span className="text-xs tnum text-muted">
                  {g.net >= 0 ? "+" : "−"}₦{Math.abs(g.net).toLocaleString("en-NG")}
                </span>
              </div>
              <div className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-border">
                {g.items.map((t, i) => {
                  const cat = getCategory(t.category);
                  const Icon = cat.icon;
                  const isIncome = t.type === "income";
                  return (
                    <button
                      key={t.id}
                      onClick={() => setEditing(t)}
                      className={`flex w-full items-center gap-3 bg-surface px-3.5 py-3 text-left transition active:bg-surface-2 ${
                        i > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 16%, transparent)`, color: cat.color }}
                      >
                        <Icon size={17} strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {cat.label}
                          {t.note ? <span className="font-normal text-muted"> · {t.note}</span> : ""}
                        </span>
                        <span className="block text-xs text-muted">
                          {timeLabel(t.occurredAt)}
                          {!isIncome && ` · ${t.payer === "babe" ? babeName : "Me"}`}
                        </span>
                      </span>
                      <span
                        className="shrink-0 text-sm font-semibold tnum"
                        style={{ color: isIncome ? "var(--color-income)" : "var(--color-ink)" }}
                      >
                        {formatSigned(t.amount, t.type)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <EditSheet txn={editing} open={Boolean(editing)} onClose={() => setEditing(null)} />
    </div>
  );
}
