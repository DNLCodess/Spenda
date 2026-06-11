"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { activeTransactions } from "@/lib/db";
import { useSettings } from "@/lib/store";
import { computeInsights, buildRecommendations } from "@/lib/insights";
import { monthLabel } from "@/lib/dates";
import { formatNaira } from "@/lib/format";
import Card from "../ui/Card";
import CashFlowCard from "./CashFlowCard";
import CategoryDonut from "./CategoryDonut";
import PayerSplit from "./PayerSplit";
import TrendChart from "./TrendChart";
import RecommendationCards from "./RecommendationCards";
import WhatIfSimulator from "./WhatIfSimulator";

function Stat({ label, value }) {
  return (
    <Card className="text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-bold tnum">{value}</p>
    </Card>
  );
}

export default function InsightsScreen() {
  const startingBalance = useSettings((s) => s.startingBalance);
  const babeName = useSettings((s) => s.babeName);
  const transactions = useLiveQuery(() => activeTransactions(), [], null);

  const ins = useMemo(
    () => (transactions ? computeInsights(transactions, { startingBalance }) : null),
    [transactions, startingBalance]
  );
  const recs = useMemo(() => (ins ? buildRecommendations(ins, { babeName }) : []), [ins, babeName]);

  if (!ins) return null;
  const monthName = monthLabel();
  const expenseTotal = ins.byCategory.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      <div className="space-y-4 md:col-span-2">
        <CashFlowCard ins={ins} monthName={monthName} />
      </div>

      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        <Stat label="Avg / day" value={formatNaira(ins.avgPerDay)} />
        <Stat label="On pace for" value={formatNaira(ins.projectedExpense)} />
        <Stat label="Entries" value={ins.expenseCount} />
      </div>

      <CategoryDonut byCategory={ins.byCategory} total={expenseTotal} />
      <PayerSplit payer={ins.payer} babeName={babeName} />
      <TrendChart ins={ins} />
      <WhatIfSimulator ins={ins} />

      <div className="md:col-span-2">
        <RecommendationCards recs={recs} />
      </div>
    </div>
  );
}
