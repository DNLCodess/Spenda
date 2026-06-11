import { subMonths } from "date-fns";
import { inMonth, monthProgress } from "./dates";
import { EXPENSE_CATEGORIES, getCategory } from "./categories";

const sumBy = (rows, type) =>
  rows.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

function expenseByCategory(rows) {
  const totals = {};
  for (const t of rows) {
    if (t.type !== "expense") continue;
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  const grand = Object.values(totals).reduce((s, n) => s + n, 0) || 1;
  return EXPENSE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    color: c.color,
    amount: totals[c.id] || 0,
    pct: ((totals[c.id] || 0) / grand) * 100,
  }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// Everything the Insights screen needs, computed from the raw (non-deleted)
// transaction list. Deterministic, runs entirely offline.
export function computeInsights(transactions, opts = {}) {
  const { startingBalance = 0, now = new Date() } = opts;

  // All-time balance: starting balance + every naira in − every naira out.
  const balance =
    startingBalance + sumBy(transactions, "income") - sumBy(transactions, "expense");

  const thisMonth = transactions.filter((t) => inMonth(t.occurredAt, now));
  const prev = subMonths(now, 1);
  const lastMonth = transactions.filter((t) => inMonth(t.occurredAt, prev));

  const income = sumBy(thisMonth, "income");
  const expense = sumBy(thisMonth, "expense");
  const net = income - expense;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;

  const byCategory = expenseByCategory(thisMonth);

  const me = thisMonth
    .filter((t) => t.type === "expense" && t.payer === "me")
    .reduce((s, t) => s + t.amount, 0);
  const babe = thisMonth
    .filter((t) => t.type === "expense" && t.payer === "babe")
    .reduce((s, t) => s + t.amount, 0);

  const expenseCount = thisMonth.filter((t) => t.type === "expense").length;
  const { dayOfMonth, fraction } = monthProgress(now);
  const avgPerDay = dayOfMonth > 0 ? expense / dayOfMonth : 0;
  const projectedExpense = fraction > 0 ? expense / fraction : expense;

  const lastExpense = sumBy(lastMonth, "expense");
  const lastIncome = sumBy(lastMonth, "income");
  const lastByCategory = expenseByCategory(lastMonth);
  const lastSavingsRate =
    lastIncome > 0 ? ((lastIncome - lastExpense) / lastIncome) * 100 : 0;

  return {
    balance,
    income,
    expense,
    net,
    savingsRate,
    byCategory,
    payer: { me, babe, total: me + babe },
    expenseCount,
    avgPerDay,
    projectedExpense,
    lastExpense,
    lastIncome,
    lastByCategory,
    lastSavingsRate,
    miscCount: thisMonth.filter((t) => t.type === "expense" && t.category === "misc").length,
  };
}

// Plain-language, rule-based advice. Each card: { id, tone, title, body }.
// tone drives the accent color: 'good' | 'warn' | 'info'.
export function buildRecommendations(ins, { babeName = "Babe" } = {}) {
  const out = [];
  const naira = (n) => "₦" + Math.round(Math.abs(n)).toLocaleString("en-NG");

  if (ins.expense === 0 && ins.income === 0) {
    out.push({
      id: "empty",
      tone: "info",
      title: "Nothing logged yet this month",
      body: "Add a few expenses and any income — your insights and tips show up here once there's something to learn from.",
    });
    return out;
  }

  // 1. Top category
  const top = ins.byCategory[0];
  if (top) {
    out.push({
      id: "top",
      tone: "info",
      title: `${top.label} leads your spending`,
      body: `${naira(top.amount)} so far — ${Math.round(top.pct)}% of everything you've spent this month.`,
    });
  }

  // 2. Month-over-month jump on the top category
  if (top) {
    const lastTop = ins.lastByCategory.find((c) => c.id === top.id);
    if (lastTop && lastTop.amount > 0) {
      const delta = ((top.amount - lastTop.amount) / lastTop.amount) * 100;
      if (delta > 15) {
        out.push({
          id: "rise",
          tone: "warn",
          title: `${top.label} is up ${Math.round(delta)}% vs last month`,
          body: `You spent ${naira(lastTop.amount)} on ${top.label} last month, ${naira(top.amount)} so far this month.`,
        });
      }
    }
  }

  // 3. Who spends more + money that went to Babe
  if (ins.payer.total > 0) {
    const mePct = Math.round((ins.payer.me / ins.payer.total) * 100);
    const leaderMe = ins.payer.me >= ins.payer.babe;
    out.push({
      id: "payer",
      tone: "info",
      title: leaderMe
        ? `You're spending more — ${mePct}% to ${babeName}'s ${100 - mePct}%`
        : `${babeName} is spending more — ${100 - mePct}% to your ${mePct}%`,
      body: `${naira(ins.payer.babe)} has left your hand to ${babeName} this month; ${naira(ins.payer.me)} was your own spending.`,
    });
  }

  // 4. Treat frequency (Misc)
  const misc = ins.byCategory.find((c) => c.id === "misc");
  if (misc && ins.miscCount >= 4) {
    const perWeekSave = misc.amount - misc.amount / Math.max(ins.miscCount, 1);
    out.push({
      id: "treats",
      tone: "warn",
      title: `${ins.miscCount} treats this month`,
      body: `Small buys add up to ${naira(misc.amount)}. Trimming a few could save roughly ${naira(perWeekSave * 0.5)} a month.`,
    });
  }

  // 5. Daily pace → projected month-end
  if (ins.expense > 0) {
    out.push({
      id: "pace",
      tone: "info",
      title: `On pace for about ${naira(ins.projectedExpense)} this month`,
      body: `You're averaging ${naira(ins.avgPerDay)} a day. Keep this rate and you'll end the month near ${naira(ins.projectedExpense)}.`,
    });
  }

  // 6. Savings rate health
  if (ins.income > 0) {
    if (ins.net < 0) {
      out.push({
        id: "savings-neg",
        tone: "warn",
        title: "You're spending faster than money is coming in",
        body: `${naira(ins.expense)} out vs ${naira(ins.income)} in this month — that's ${naira(-ins.net)} over. Worth easing off the top category.`,
      });
    } else {
      out.push({
        id: "savings",
        tone: "good",
        title: `You're keeping ${Math.round(ins.savingsRate)}% of what comes in`,
        body: `${naira(ins.net)} kept from ${naira(ins.income)} of income this month.${
          ins.lastIncome > 0
            ? ` Last month it was ${Math.round(ins.lastSavingsRate)}%.`
            : ""
        }`,
      });
    }
  }

  return out;
}

// What-if simulator math: `cuts` is { categoryId: percentToCut (0..100) }.
export function applyWhatIf(ins, cuts) {
  let saved = 0;
  for (const c of ins.byCategory) {
    const pct = (cuts[c.id] || 0) / 100;
    saved += c.amount * pct;
  }
  const newExpense = Math.max(0, ins.expense - saved);
  const newNet = ins.income - newExpense;
  const newSavingsRate = ins.income > 0 ? (newNet / ins.income) * 100 : 0;
  return {
    saved,
    newExpense,
    newSavingsRate,
    annual: saved * 12,
  };
}

export { getCategory };
