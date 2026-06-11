import { create } from "zustand";
import { persist } from "zustand/middleware";

// Device-local settings + session lock state. Transaction data lives in Dexie
// (lib/db.js); this store is just preferences and the lock gate.
export const useSettings = create(
  persist(
    (set) => ({
      babeName: "Babe",
      startingBalance: 0,
      theme: "system", // 'system' | 'light' | 'dark'
      pinHash: null,
      onboarded: false,

      // Session-only — not persisted. App starts locked if a PIN exists.
      unlocked: false,

      setBabeName: (babeName) => set({ babeName: babeName?.trim() || "Babe" }),
      setStartingBalance: (startingBalance) =>
        set({ startingBalance: Math.round(Number(startingBalance) || 0) }),
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      setPin: (pinHash) => set({ pinHash }),
      completeOnboarding: () => set({ onboarded: true }),
      unlock: () => set({ unlocked: true }),
      lock: () => set({ unlocked: false }),
    }),
    {
      name: "spenda-settings",
      partialize: (s) => ({
        babeName: s.babeName,
        startingBalance: s.startingBalance,
        theme: s.theme,
        pinHash: s.pinHash,
        onboarded: s.onboarded,
      }),
    }
  )
);

// Applies the theme class to <html> and mirrors it to the key the pre-paint
// bootstrap script (in layout.js) reads, so there's no flash on next load.
export function applyTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("spenda-theme", theme);
    const dark =
      theme === "dark" ||
      (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    /* ignore */
  }
}
