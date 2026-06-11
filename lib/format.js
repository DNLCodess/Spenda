// Naira is whole-number money here (no kobo) — fast to enter, easy to read.

export function formatNaira(amount) {
  const n = Math.round(Number(amount) || 0);
  return "₦" + Math.abs(n).toLocaleString("en-NG");
}

// For ledgers: +₦2,000 (income) / −₦2,000 (expense)
export function formatSigned(amount, type) {
  const base = formatNaira(amount);
  return (type === "income" ? "+" : "−") + base;
}

// Compact for charts/axes: ₦12k, ₦1.2m
export function formatCompact(amount) {
  const n = Math.abs(Math.round(Number(amount) || 0));
  if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0) + "m";
  if (n >= 1_000) return "₦" + (n / 1_000).toFixed(n % 1_000 ? 1 : 0) + "k";
  return "₦" + n;
}

export function formatPercent(value, digits = 0) {
  return (Number(value) || 0).toFixed(digits) + "%";
}
