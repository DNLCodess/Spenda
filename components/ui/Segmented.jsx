"use client";

import { motion } from "framer-motion";

// A tactile segmented control with an animated active pill.
// options: [{ value, label, icon?: Component }]
export default function Segmented({ options, value, onChange, size = "md", id }) {
  const groupId = id || "seg";
  const pad = size === "lg" ? "py-3 text-base" : "py-2 text-sm";
  return (
    <div className="flex gap-1 rounded-2xl bg-surface-2 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 font-medium transition-colors ${pad} ${
              active ? "text-ink" : "text-muted"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${groupId}-pill`}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-xl bg-surface shadow-sm ring-1 ring-border"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon size={16} strokeWidth={2.2} />}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
