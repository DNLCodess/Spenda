import { getCategory } from "./categories";

// Exports the full ledger as a CSV you can open in any spreadsheet.
export function transactionsToCSV(transactions, babeName = "Babe") {
  const header = ["Date", "Type", "Category", "Payer", "Amount (NGN)", "Note"];
  const rows = transactions.map((t) => [
    new Date(t.occurredAt).toISOString(),
    t.type,
    getCategory(t.category).label,
    t.type === "income" ? "" : t.payer === "babe" ? babeName : "Me",
    t.amount,
    (t.note || "").replace(/"/g, '""'),
  ]);
  return [header, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
}

export function downloadCSV(csv, filename = "spenda-export.csv") {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
