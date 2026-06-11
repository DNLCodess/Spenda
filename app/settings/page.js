import Header from "@/components/layout/Header";
import SettingsScreen from "@/components/settings/SettingsScreen";

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" showSettings={false} />
      <SettingsScreen />
    </>
  );
}
