import Header from "@/components/layout/Header";
import InsightsScreen from "@/components/insights/InsightsScreen";

export default function InsightsPage() {
  return (
    <>
      <Header title="Insights" subtitle="How you're faring this month" />
      <InsightsScreen />
    </>
  );
}
