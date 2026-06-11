"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, PieChart, ReceiptText } from "lucide-react";

const TABS = [
  { href: "/", label: "Add", icon: Plus },
  { href: "/insights", label: "Insights", icon: PieChart },
  { href: "/history", label: "History", icon: ReceiptText },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/85 backdrop-blur-lg safe-b">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
              style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
