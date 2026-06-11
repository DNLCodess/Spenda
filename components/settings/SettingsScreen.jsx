"use client";

import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Lock, Download, KeyRound, Share, Plus, ChevronRight } from "lucide-react";
import { useSettings } from "@/lib/store";
import { activeTransactions } from "@/lib/db";
import { hashPin } from "@/lib/pin";
import { transactionsToCSV, downloadCSV } from "@/lib/export";
import Segmented from "../ui/Segmented";
import Sheet from "../ui/Sheet";
import PinPad from "../ui/PinPad";
import SyncSection from "./SyncSection";

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function SettingsScreen() {
  const s = useSettings();
  const transactions = useLiveQuery(() => activeTransactions(), [], []);

  const [pinStep, setPinStep] = useState(null); // null | 'new' | 'confirm'
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showInstall, setShowInstall] = useState(false);

  const onNewPin = useCallback((pin) => {
    setNewPin(pin);
    setPinError("");
    setPinStep("confirm");
  }, []);

  const onConfirmPin = useCallback(
    async (pin) => {
      if (pin !== newPin) {
        setPinError("PINs didn't match");
        setPinStep("new");
        setNewPin("");
        return;
      }
      s.setPin(await hashPin(pin));
      setPinStep(null);
      setNewPin("");
    },
    [newPin, s]
  );

  function exportCsv() {
    downloadCSV(transactionsToCSV(transactions, s.babeName), "spenda-export.csv");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 pb-4">
      <Section title="Profile">
        <div className="rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-border">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
            Babe's name
          </label>
          <input
            defaultValue={s.babeName}
            onBlur={(e) => s.setBabeName(e.target.value)}
            className="w-full rounded-xl bg-surface-2 px-3 py-2.5 text-sm outline-none"
          />
          <label className="mb-1 mt-4 block text-xs font-medium uppercase tracking-wide text-muted">
            Starting balance (₦)
          </label>
          <input
            inputMode="numeric"
            defaultValue={s.startingBalance || ""}
            onBlur={(e) => s.setStartingBalance(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="w-full rounded-xl bg-surface-2 px-3 py-2.5 text-sm tnum outline-none"
          />
        </div>
      </Section>

      <Section title="Appearance">
        <Segmented
          id="theme"
          value={s.theme}
          onChange={s.setTheme}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Section>

      <Section title="Sync">
        <SyncSection />
      </Section>

      <Section title="Security & data">
        <Row icon={KeyRound} label="Change PIN" onClick={() => setPinStep("new")} />
        <Row icon={Download} label="Export as CSV" onClick={exportCsv} />
        <Row icon={Lock} label="Lock now" onClick={s.lock} />
      </Section>

      <Section title="Install">
        <button
          onClick={() => setShowInstall((v) => !v)}
          className="flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-left ring-1 ring-border"
        >
          <Share size={18} className="text-muted" />
          <span className="flex-1 text-sm font-medium">Add to Home Screen</span>
          <ChevronRight size={18} className={`text-muted transition ${showInstall ? "rotate-90" : ""}`} />
        </button>
        {showInstall && (
          <div className="rounded-[var(--radius-card)] bg-surface p-4 text-sm text-muted ring-1 ring-border">
            <p className="mb-2 font-medium text-ink">iPad / iPhone (Safari)</p>
            <p className="mb-3 flex items-center gap-1">
              Tap <Share size={14} className="inline" /> Share → <Plus size={14} className="inline" /> Add to Home Screen.
            </p>
            <p className="mb-2 font-medium text-ink">Samsung (Chrome)</p>
            <p>Tap the ⋮ menu → Add to Home screen → Install.</p>
          </div>
        )}
      </Section>

      <p className="pt-2 text-center text-xs text-muted">Spenda · your money, your way</p>

      <Sheet open={Boolean(pinStep)} onClose={() => { setPinStep(null); setNewPin(""); setPinError(""); }}>
        {pinStep === "new" && (
          <PinPad title="New PIN" subtitle="Choose a new 4-digit PIN" error={pinError} onComplete={onNewPin} />
        )}
        {pinStep === "confirm" && (
          <PinPad title="Confirm new PIN" onComplete={onConfirmPin} />
        )}
      </Sheet>
    </div>
  );
}

function Row({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-left ring-1 ring-border transition active:bg-surface-2"
    >
      <Icon size={18} className="text-muted" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight size={18} className="text-muted" />
    </button>
  );
}
