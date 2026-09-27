import { useEffect, useState } from "react";
import type { AppData } from "./types";

const STORAGE_KEY = "lunacare-data-v1";

const DEFAULT_DATA: AppData = {
  profile: { name: "" },
  cycles: [],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_DATA;
    const profile = parsed.profile && typeof parsed.profile === "object" ? parsed.profile : { name: "" };
    const cycles = Array.isArray(parsed.cycles) ? parsed.cycles : [];
    return { profile, cycles } as AppData;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  return { data, setData } as const;
}
