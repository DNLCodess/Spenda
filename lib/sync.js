import { db } from "./db";
import { supabase, isSupabaseConfigured } from "./supabase";

// Maps between the local Dexie shape (camelCase) and the Supabase row
// (snake_case columns). See supabase/schema.sql for the table definition.
function toRemote(t, userId) {
  return {
    id: t.id,
    user_id: userId,
    type: t.type,
    amount: t.amount,
    category: t.category,
    payer: t.payer,
    note: t.note,
    occurred_at: t.occurredAt,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    deleted_at: t.deletedAt,
  };
}

function toLocal(r) {
  return {
    id: r.id,
    type: r.type,
    amount: r.amount,
    category: r.category,
    payer: r.payer,
    note: r.note || "",
    occurredAt: r.occurred_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
    synced: 1,
  };
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

// Push every locally-changed row, then pull anything newer from the cloud.
// Last-write-wins on updatedAt — fine for a single user across two devices.
export async function syncNow() {
  if (!isSupabaseConfigured || !navigator.onLine) return { ok: false, reason: "offline" };
  const userId = await getUserId();
  if (!userId) return { ok: false, reason: "signed-out" };

  // 1) Push local changes
  const dirty = await db.transactions.where("synced").equals(0).toArray();
  if (dirty.length) {
    const { error } = await supabase
      .from("transactions")
      .upsert(dirty.map((t) => toRemote(t, userId)), { onConflict: "id" });
    if (!error) {
      await db.transaction("rw", db.transactions, async () => {
        for (const t of dirty) await db.transactions.update(t.id, { synced: 1 });
      });
    }
  }

  // 2) Pull remote changes
  const { data: remote, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId);
  if (error) return { ok: false, reason: error.message };

  await db.transaction("rw", db.transactions, async () => {
    for (const r of remote) {
      const local = await db.transactions.get(r.id);
      if (!local || new Date(r.updated_at) >= new Date(local.updatedAt)) {
        await db.transactions.put(toLocal(r));
      }
    }
  });

  return { ok: true, pushed: dirty.length, pulled: remote.length };
}

// Wire up automatic sync: on load, on reconnect, and whenever the tab regains focus.
export function startAutoSync() {
  if (!isSupabaseConfigured) return () => {};
  const run = () => syncNow().catch(() => {});
  run();
  window.addEventListener("online", run);
  window.addEventListener("focus", run);
  const interval = setInterval(run, 60_000);
  return () => {
    window.removeEventListener("online", run);
    window.removeEventListener("focus", run);
    clearInterval(interval);
  };
}
