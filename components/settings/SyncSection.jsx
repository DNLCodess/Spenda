"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, LogOut } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { syncNow } from "@/lib/sync";

export default function SyncSection() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin"); // signin | signup
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) syncNow();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <Wrap>
        <div className="flex items-center gap-2 text-muted">
          <CloudOff size={18} />
          <p className="text-sm">
            Sync is off. Add your Supabase keys to <code className="text-xs">.env.local</code> to sync
            between your iPad and phone. See README.
          </p>
        </div>
      </Wrap>
    );
  }

  async function authenticate() {
    setBusy(true);
    setStatus("");
    const fn = mode === "signin" ? "signInWithPassword" : "signUp";
    const { error } = await supabase.auth[fn]({ email: email.trim(), password });
    setBusy(false);
    if (error) setStatus(error.message);
    else if (mode === "signup") setStatus("Account created — check your email to confirm, then sign in.");
  }

  async function manualSync() {
    setBusy(true);
    setStatus("Syncing…");
    const r = await syncNow();
    setBusy(false);
    setStatus(r.ok ? `Synced · ${r.pushed} up, ${r.pulled} down` : `Sync failed: ${r.reason}`);
  }

  if (user) {
    return (
      <Wrap>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud size={18} style={{ color: "var(--color-income)" }} />
            <div>
              <p className="text-sm font-medium">Syncing</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1 text-sm text-muted"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
        <button
          onClick={manualSync}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-2 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={15} className={busy ? "animate-spin" : ""} /> Sync now
        </button>
        {status && <p className="mt-2 text-xs text-muted">{status}</p>}
      </Wrap>
    );
  }

  return (
    <Wrap>
      <p className="mb-3 text-sm font-medium">Sign in to sync across devices</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-2 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mb-3 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm outline-none"
      />
      <button
        onClick={authenticate}
        disabled={busy || !email || !password}
        className="h-12 w-full rounded-2xl bg-primary font-semibold text-primary-ink disabled:opacity-50"
      >
        {mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className="mt-3 w-full text-sm text-muted"
      >
        {mode === "signin" ? "No account? Create one" : "Have an account? Sign in"}
      </button>
      {status && <p className="mt-2 text-center text-xs text-muted">{status}</p>}
    </Wrap>
  );
}

function Wrap({ children }) {
  return <div className="rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-border">{children}</div>;
}
