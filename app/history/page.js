import Header from "@/components/layout/Header";
import HistoryScreen from "@/components/history/HistoryScreen";

export default function HistoryPage() {
  return (
    <>
      <Header title="History" subtitle="Everything in and out" />
      <HistoryScreen />
    </>
  );
}
