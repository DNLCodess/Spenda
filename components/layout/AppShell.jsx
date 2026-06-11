"use client";

import { useEffect, useState } from "react";
import { useSettings, applyTheme } from "@/lib/store";
import { startAutoSync } from "@/lib/sync";
import BottomNav from "./BottomNav";
import Onboarding from "@/components/gates/Onboarding";
import LockScreen from "@/components/gates/LockScreen";

export default function AppShell({ children }) {
  const [mounted, setMounted] = useState(false);
  const onboarded = useSettings((s) => s.onboarded);
  const pinHash = useSettings((s) => s.pinHash);
  const unlocked = useSettings((s) => s.unlocked);
  const theme = useSettings((s) => s.theme);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted) applyTheme(theme);
  }, [mounted, theme]);

  const locked = Boolean(pinHash) && !unlocked;

  useEffect(() => {
    if (mounted && onboarded && !locked) return startAutoSync();
  }, [mounted, onboarded, locked]);

  // Avoid a flash of the wrong gate before the persisted store hydrates.
  if (!mounted) return <div className="min-h-dvh bg-bg" />;
  if (!onboarded) return <Onboarding />;
  if (locked) return <LockScreen />;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-24 pt-5 safe-t">
      {children}
      <BottomNav />
    </div>
  );
}
