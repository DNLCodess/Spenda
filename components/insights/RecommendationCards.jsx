"use client";

import { motion } from "framer-motion";
import { Lightbulb, TriangleAlert, Sparkles } from "lucide-react";

const TONE = {
  good: { color: "var(--color-income)", icon: Sparkles },
  warn: { color: "var(--color-over)", icon: TriangleAlert },
  info: { color: "var(--color-cat-data)", icon: Lightbulb },
};

export default function RecommendationCards({ recs }) {
  if (!recs.length) return null;
  return (
    <div className="space-y-2.5">
      <p className="px-1 text-sm font-semibold">For you</p>
      {recs.map((r, i) => {
        const tone = TONE[r.tone] || TONE.info;
        const Icon = tone.icon;
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3 rounded-[var(--radius-card)] bg-surface p-3.5 ring-1 ring-border"
          >
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `color-mix(in srgb, ${tone.color} 16%, transparent)`, color: tone.color }}
            >
              <Icon size={16} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-snug">{r.title}</p>
              <p className="mt-0.5 text-sm text-muted leading-snug">{r.body}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
