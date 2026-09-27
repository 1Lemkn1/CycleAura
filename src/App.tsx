import { useState } from "react";
import { useAppData } from "./store";
import type { TabId } from "./types";
import { Layout } from "./components/Layout";
import { TodayTab } from "./tabs/TodayTab";
import { CalendarTab } from "./tabs/CalendarTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { useCycleModel } from "./hooks/useCycleModel";

export default function App() {
  const { data, setData } = useAppData();
  const [tab, setTab] = useState<TabId>("today");
  const model = useCycleModel(data.cycles);

  return (
    <div className="app-root">
      <Layout activeTab={tab} onTabChange={setTab}>
        {tab === "today" && <TodayTab data={data} setData={setData} model={model} />}
        {tab === "calendar" && <CalendarTab model={model} />}
        {tab === "history" && <HistoryTab data={data} setData={setData} model={model} />}
        {tab === "profile" && <ProfileTab data={data} setData={setData} />}
        {tab === "settings" && <SettingsTab data={data} setData={setData} />}
      </Layout>
    </div>
  );
}
