"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Check, NotebookPen, Clock, X } from "lucide-react";
import { activeTransactions, addTransaction } from "@/lib/db";
import { categoriesFor } from "@/lib/categories";
import { useSettings } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { dayLabel, timeLabel } from "@/lib/dates";
import Segmented from "@/components/ui/Segmented";
import Keypad from "./Keypad";
import QuickAddTiles from "./QuickAddTiles";

function toLocalInputValue(date) {
  const d = new Date(date);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function AddScreen() {
  const babeName = useSettings((s) => s.babeName);
  const transactions = useLiveQuery(() => activeTransactions(), [], []);

  const [type, setType] = useState("expense");
  const [digits, setDigits] = useState("");
  const [category, setCategory] = useState("food");
  const [payer, setPayer] = useState("me");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [when, setWhen] = useState(() => new Date());
  const [editingWhen, setEditingWhen] = useState(false);
  const [flash, setFlash] = useState(false);

  const amount = parseInt(digits || "0", 10);
  const cats = categoriesFor(type);

  function handleType(next) {
    setType(next);
    setCategory(next === "income" ? "work" : "food");
  }

  function handleKey(k) {
    if (k === "del") return setDigits((d) => d.slice(0, -1));
    if (k === "000") return setDigits((d) => (d === "" ? "" : d + "000").slice(0, 10));
    setDigits((d) => (d === "" && k === "0" ? "" : (d + k).slice(0, 10)));
  }

  async function commit(payload) {
    await addTransaction(payload);
    if (navigator.vibrate) navigator.vibrate(8);
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  }

  async function handleAdd() {
    if (amount <= 0) return;
    await commit({
      type,
      amount,
      category,
      payer,
      note,
      occurredAt: when.toISOString(),
    });
    // Reset the amount + note but keep type/category/payer for rapid multi-entry.
    setDigits("");
    setNote("");
    setShowNote(false);
    setWhen(new Date());
  }

  async function handleQuickPick(tile) {
    await commit({
      type: "expense",
      amount: tile.amount,
      category: tile.category,
      payer: tile.payer,
      note: "",
      occurredAt: new Date().toISOString(),
    });
  }

  const accent = type === "income" ? "var(--color-income)" : "var(--color-ink)";
  const canAdd = amount > 0;

  const dateText = useMemo(
    () => `${dayLabel(when.toISOString())}, ${timeLabel(when.toISOString())}`,
    [when]
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      {/* Out / In */}
      <Segmented
        id="type"
        size="lg"
        value={type}
        onChange={handleType}
        options={[
          { value: "expense", label: "Out" },
          { value: "income", label: "In" },
        ]}
      />

      {/* Amount */}
      <div className="relative flex flex-col items-center py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {type === "income" ? "Money in" : "Money out"}
        </span>
        <div
          className="font-display text-5xl font-semibold tnum tracking-tight"
          style={{ color: digits ? accent : "var(--color-muted)" }}
        >
          {formatNaira(amount)}
        </div>

        {/* Success check */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1 right-2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-ink shadow-lg"
            >
              <Check size={15} strokeWidth={3} /> Added
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category / source chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {cats.map((c) => {
          const Icon = c.icon;
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ring-1 transition active:scale-95"
              style={{
                color: active ? c.color : "var(--color-muted)",
                borderColor: "transparent",
                backgroundColor: active
                  ? `color-mix(in srgb, ${c.color} 14%, transparent)`
                  : "var(--color-surface)",
                boxShadow: active ? `inset 0 0 0 1.5px ${c.color}` : "inset 0 0 0 1px var(--color-border)",
              }}
            >
              <Icon size={17} strokeWidth={2.2} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Payer (expenses only) */}
      {type === "expense" && (
        <Segmented
          id="payer"
          value={payer}
          onChange={setPayer}
          options={[
            { value: "me", label: "Me" },
            { value: "babe", label: babeName },
          ]}
        />
      )}

      {/* Note + date row */}
      <div className="flex items-center gap-2">
        {!showNote ? (
          <button
            type="button"
            onClick={() => setShowNote(true)}
            className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-border"
          >
            <NotebookPen size={14} /> Add note
          </button>
        ) : (
          <div className="flex flex-1 items-center gap-1 rounded-full bg-surface px-3 ring-1 ring-border">
            <input
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note…"
              className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
            />
            <button type="button" onClick={() => { setShowNote(false); setNote(""); }}>
              <X size={14} className="text-muted" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setEditingWhen((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-border"
        >
          <Clock size={14} /> {dateText}
        </button>
      </div>

      {editingWhen && (
        <input
          type="datetime-local"
          value={toLocalInputValue(when)}
          max={toLocalInputValue(new Date())}
          onChange={(e) => setWhen(new Date(e.target.value))}
          className="rounded-xl bg-surface px-3 py-2 text-sm ring-1 ring-border outline-none"
        />
      )}

      {/* Quick add */}
      <QuickAddTiles transactions={transactions} babeName={babeName} onPick={handleQuickPick} />

      {/* Keypad */}
      <Keypad onKey={handleKey} />

      {/* Add */}
      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
        className="h-14 rounded-2xl text-lg font-semibold transition active:scale-[0.98] disabled:opacity-40"
        style={{
          backgroundColor: type === "income" ? "var(--color-income)" : "var(--color-primary)",
          color: "var(--color-primary-ink)",
        }}
      >
        Add {type === "income" ? "income" : "expense"}
      </button>
    </div>
  );
}
