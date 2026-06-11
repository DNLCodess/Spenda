"use client";

import { useState, useCallback } from "react";
import { Wallet } from "lucide-react";
import { useSettings } from "@/lib/store";
import { verifyPin } from "@/lib/pin";
import PinPad from "@/components/ui/PinPad";

export default function LockScreen() {
  const pinHash = useSettings((s) => s.pinHash);
  const unlock = useSettings((s) => s.unlock);
  const [error, setError] = useState("");

  const handle = useCallback(
    async (pin) => {
      if (await verifyPin(pin, pinHash)) {
        unlock();
      } else {
        setError("Wrong PIN, try again");
      }
    },
    [pinHash, unlock]
  );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-ink shadow-lg">
          <Wallet size={30} />
        </div>
        <span className="mt-3 font-display text-2xl font-bold tracking-tight">Spenda</span>
      </div>
      <PinPad title="Enter your PIN" error={error} onComplete={handle} />
    </div>
  );
}
