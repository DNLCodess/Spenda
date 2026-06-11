"use client";

import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "del"];

// Custom numeric keypad — controlled by the parent. Emits a digit string,
// "000", or "del". Big, evenly-spaced keys that feel the same on iPad and phone.
export default function Keypad({ onKey }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => {
        const isDel = k === "del";
        return (
          <button
            key={k}
            type="button"
            onClick={() => onKey(k)}
            className="flex h-14 items-center justify-center rounded-2xl bg-surface text-2xl font-medium tnum ring-1 ring-border transition active:scale-95 active:bg-surface-2 select-none"
            aria-label={isDel ? "Delete" : k}
          >
            {isDel ? <Delete size={22} strokeWidth={2} className="text-muted" /> : k}
          </button>
        );
      })}
    </div>
  );
}
