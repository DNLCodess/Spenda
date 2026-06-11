"use client";

import { useCallback, useState } from "react";
import { Wallet, ArrowRight, Heart, Wallet2 } from "lucide-react";
import { useSettings } from "@/lib/store";
import { hashPin } from "@/lib/pin";
import { formatNaira } from "@/lib/format";
import PinPad from "@/components/ui/PinPad";

export default function Onboarding() {
  const { setPin, setBabeName, setStartingBalance, completeOnboarding, unlock } = useSettings();

  const [step, setStep] = useState("pin"); // pin | confirm | babe | balance
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [babe, setBabe] = useState("");
  const [balanceDigits, setBalanceDigits] = useState("");

  const onPin = useCallback((pin) => {
    setError("");
    setFirstPin(pin);
    setStep("confirm");
  }, []);

  const onConfirm = useCallback(
    (pin) => {
      if (pin !== firstPin) {
        setError("PINs didn't match — set it again");
        setFirstPin("");
        setStep("pin");
        return;
      }
      setStep("babe");
    },
    [firstPin]
  );

  async function finish() {
    const hash = await hashPin(firstPin);
    setPin(hash);
    setBabeName(babe || "Babe");
    setStartingBalance(parseInt(balanceDigits || "0", 10));
    completeOnboarding();
    unlock();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      {step === "pin" && (
        <>
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-ink shadow-lg">
              <Wallet size={30} />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Welcome to Spenda</h1>
            <p className="mt-2 text-sm text-muted">
              Your money in and out, tracked the way you actually spend. First, set a PIN to keep it private on this device.
            </p>
          </div>
          <PinPad title="Choose a 4-digit PIN" error={error} onComplete={onPin} />
        </>
      )}

      {step === "confirm" && (
        <PinPad title="Confirm your PIN" subtitle="Enter it once more" onComplete={onConfirm} />
      )}

      {step === "babe" && (
        <div className="flex flex-col">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-cat-giving ring-1 ring-border">
              <Heart size={26} style={{ color: "var(--color-cat-giving)" }} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">What's your babe's name?</h2>
            <p className="mt-2 text-sm text-muted">
              Used to tag spending and show who spends more. You can change it later.
            </p>
          </div>
          <input
            autoFocus
            value={babe}
            onChange={(e) => setBabe(e.target.value)}
            placeholder="e.g. Ada"
            className="rounded-2xl bg-surface px-4 py-3.5 text-center text-lg ring-1 ring-border outline-none focus:ring-primary"
          />
          <button
            onClick={() => setStep("balance")}
            className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-primary-ink active:scale-[0.98]"
          >
            Continue <ArrowRight size={20} />
          </button>
        </div>
      )}

      {step === "balance" && (
        <div className="flex flex-col">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface ring-1 ring-border">
              <Wallet2 size={26} style={{ color: "var(--color-primary)" }} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Starting balance?</h2>
            <p className="mt-2 text-sm text-muted">
              Money you have right now, so your balance is accurate. Optional — skip if you'd rather start from zero.
            </p>
          </div>
          <div className="mb-3 text-center font-display text-4xl font-semibold tnum">
            {formatNaira(parseInt(balanceDigits || "0", 10))}
          </div>
          <input
            inputMode="numeric"
            value={balanceDigits}
            onChange={(e) => setBalanceDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="0"
            className="rounded-2xl bg-surface px-4 py-3.5 text-center text-lg tnum ring-1 ring-border outline-none focus:ring-primary"
          />
          <button
            onClick={finish}
            className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-primary-ink active:scale-[0.98]"
          >
            Start using Spenda <ArrowRight size={20} />
          </button>
          <button onClick={finish} className="mt-3 text-sm font-medium text-muted">
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
