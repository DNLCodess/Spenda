"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Sheet from "../ui/Sheet";
import Segmented from "../ui/Segmented";
import { categoriesFor } from "@/lib/categories";
import { useSettings } from "@/lib/store";
import { updateTransaction, softDeleteTransaction } from "@/lib/db";

function toLocalInputValue(date) {
  const d = new Date(date);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function EditSheet({ txn, open, onClose }) {
  const babeName = useSettings((s) => s.babeName);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [payer, setPayer] = useState("me");
  const [note, setNote] = useState("");
  const [when, setWhen] = useState(new Date());

  useEffect(() => {
    if (!txn) return;
    setAmount(String(txn.amount));
    setCategory(txn.category);
    setPayer(txn.payer || "me");
    setNote(txn.note || "");
    setWhen(new Date(txn.occurredAt));
  }, [txn]);

  if (!txn) return null;
  const cats = categoriesFor(txn.type);

  async function save() {
    await updateTransaction(txn.id, {
      amount: parseInt(amount || "0", 10),
      category,
      payer: txn.type === "income" ? null : payer,
      note,
      occurredAt: when.toISOString(),
    });
    onClose();
  }

  async function remove() {
    await softDeleteTransaction(txn.id);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="mb-4 font-display text-lg font-bold">
        Edit {txn.type === "income" ? "income" : "expense"}
      </h3>

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Amount (₦)</label>
      <input
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 10))}
        className="mb-4 w-full rounded-2xl bg-surface-2 px-4 py-3 text-lg font-semibold tnum outline-none"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => {
          const Icon = c.icon;
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition"
              style={{
                color: active ? c.color : "var(--color-muted)",
                boxShadow: active ? `inset 0 0 0 1.5px ${c.color}` : "inset 0 0 0 1px var(--color-border)",
                backgroundColor: active ? `color-mix(in srgb, ${c.color} 12%, transparent)` : "transparent",
              }}
            >
              <Icon size={15} /> {c.label}
            </button>
          );
        })}
      </div>

      {txn.type === "expense" && (
        <div className="mb-4">
          <Segmented
            id="edit-payer"
            value={payer}
            onChange={setPayer}
            options={[
              { value: "me", label: "Me" },
              { value: "babe", label: babeName },
            ]}
          />
        </div>
      )}

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note…"
        className="mb-3 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm outline-none placeholder:text-muted"
      />

      <input
        type="datetime-local"
        value={toLocalInputValue(when)}
        max={toLocalInputValue(new Date())}
        onChange={(e) => setWhen(new Date(e.target.value))}
        className="mb-5 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm outline-none"
      />

      <div className="flex gap-3">
        <button
          onClick={remove}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-over ring-1 ring-border"
          aria-label="Delete"
        >
          <Trash2 size={18} />
        </button>
        <button
          onClick={save}
          className="h-12 flex-1 rounded-2xl bg-primary font-semibold text-primary-ink active:scale-[0.98]"
        >
          Save changes
        </button>
      </div>
    </Sheet>
  );
}
