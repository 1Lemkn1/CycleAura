import { useEffect, useMemo, useState } from "react";
import type { CycleEntry } from "../types";
import { createCycleModel } from "../lib/cycleModel";
import { formatDate } from "../utils/date";

function useTodayIso() {
  const [todayIso, setTodayIso] = useState(() => formatDate(new Date()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const now = new Date();
      setTodayIso(formatDate(now));
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 250);
    };
    refresh();
    // Mobile browsers suspend timers; also refresh when returning to the app.
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return todayIso;
}

export function useCycleModel(cycles: CycleEntry[]) {
  const todayIso = useTodayIso();
  return useMemo(() => createCycleModel(cycles, todayIso), [cycles, todayIso]);
}