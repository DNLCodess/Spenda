"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export default function Header({ title, subtitle, showSettings = true }) {
  return (
    <header className="mb-4 flex items-start justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {showSettings && (
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-border"
        >
          <Settings size={19} />
        </Link>
      )}
    </header>
  );
}
