import type { Dispatch, SetStateAction } from "react";

export type Profile = {
  name: string;
  height?: string;
  weight?: string;
  age?: string;
};

export type CycleEntry = {
  id: string;
  startDate: string; // ISO date YYYY-MM-DD
  endDate?: string;  // ISO date
  createdAt: string; // ISO date-time
};

export type AppData = {
  profile: Profile;
  cycles: CycleEntry[];
};

export type SetAppData = Dispatch<SetStateAction<AppData>>;

export type TabId = "today" | "calendar" | "history" | "profile" | "settings";

export type PwaDeferredPrompt = any;
