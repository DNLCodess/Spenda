"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

// Self-contained 4-digit entry. Calls onComplete(pin) when 4 digits are entered,
// then clears so it can be reused (e.g. "enter" then "confirm").
export default function PinPad({ title, subtitle, error, onComplete, length = 4 }) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (pin.length === length) {
      const value = pin;
      setTimeout(() => setPin(""), 150);
      onComplete(value);
    }
  }, [pin, length, onComplete]);

  // Shake the dots when an error message appears.
  const [shakeKey, setShakeKey] = useState(0);
  useEffect(() => {
    if (error) setShakeKey((k) => k + 1);
  }, [error]);

  function press(k) {
    if (k === "del") return setPin((p) => p.slice(0, -1));
    if (k === "") return;
    setPin((p) => (p.length < length ? p + k : p));
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}

      <motion.div
        key={shakeKey}
        animate={error ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="my-7 flex gap-4"
      >
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className="h-3.5 w-3.5 rounded-full transition-colors"
            style={{
              backgroundColor: i < pin.length ? "var(--color-primary)" : "var(--color-border)",
            }}
          />
        ))}
      </motion.div>

      {error && <p className="mb-4 text-sm font-medium text-over">{error}</p>}

      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {KEYS.map((k, i) => (
          <button
            key={i}
            type="button"
            disabled={k === ""}
            onClick={() => press(k)}
            className="flex h-16 items-center justify-center rounded-2xl text-2xl font-medium tnum transition active:scale-95 disabled:opacity-0 enabled:active:bg-surface-2"
            style={{ color: "var(--color-ink)" }}
          >
            {k === "del" ? <Delete size={24} className="text-muted" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}
