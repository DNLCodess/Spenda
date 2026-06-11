import Dexie from "dexie";

// Local-first store. This is the immediate source of truth on each device, so
// the app is fully usable offline; the sync layer mirrors it to Supabase.
export const db = new Dexie("spenda");

db.version(1).stores({
  // `synced` = 0 means there are local changes waiting to push to the cloud.
  transactions: "id, type, category, payer, occurredAt, updatedAt, deletedAt, synced",
});

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function addTransaction({ type, amount, category, payer = null, note = "", occurredAt }) {
  const now = new Date().toISOString();
  const row = {
    id: uuid(),
    type,
    amount: Math.round(Number(amount) || 0),
    category,
    payer: type === "income" ? null : payer,
    note: note?.trim() || "",
    occurredAt: occurredAt || now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    synced: 0,
  };
  await db.transactions.add(row);
  return row;
}

export async function updateTransaction(id, patch) {
  await db.transactions.update(id, {
    ...patch,
    updatedAt: new Date().toISOString(),
    synced: 0,
  });
}

export async function softDeleteTransaction(id) {
  const now = new Date().toISOString();
  await db.transactions.update(id, { deletedAt: now, updatedAt: now, synced: 0 });
}

// Live array of non-deleted transactions, newest first. Used with useLiveQuery.
export async function activeTransactions() {
  const rows = await db.transactions.filter((t) => !t.deletedAt).toArray();
  return rows.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
}
