import { useEffect, useState } from "react";
import type { AppData, SetAppData } from "../types";
import type { CycleModel } from "../lib/cycleModel";
import { validateCycleDates } from "../lib/cycleValidation";
import { prettyDate } from "../utils/date";
import { BottomSheet } from "../components/BottomSheet";
import { DateField } from "../components/DateField";
import { CareIcon } from "../components/CareIcon";
import { CycleOverview } from "../components/CycleOverview";
import { CycleGuidance } from "../components/CycleGuidance";

interface TodayTabProps {
  data: AppData;
  setData: SetAppData;
  model: CycleModel;
}

export function TodayTab({ data, setData, model }: TodayTabProps) {
  const { todayIso, ongoingCycle: ongoing } = model;
  const [sheet, setSheet] = useState<"start" | "end" | null>(null);
  const [startDate, setStartDate] = useState(todayIso);
  const [endDate, setEndDate] = useState(todayIso);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const greetingName = (typeof data.profile.name === "string" ? data.profile.name.trim() : "") || "Солнышко";

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  function openSheet(kind: "start" | "end") {
    setError(null);
    setNotice("");
    setStartDate(todayIso);
    setEndDate(todayIso);
    setSheet(kind);
  }

  function confirmStart() {
    const validation = validateCycleDates(startDate, undefined, data.cycles, todayIso);
    if (validation) {
      setError(validation);
      return;
    }
    const entry = {
      id: globalThis.crypto?.randomUUID?.() ?? `cycle-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startDate,
      createdAt: new Date().toISOString(),
    };
    setData((previous) => ({ ...previous, cycles: [...previous.cycles, entry] }));
    setSheet(null);
    setNotice("Начало сохранено. Прогноз обновлён.");
  }

  function confirmEnd() {
    if (!ongoing) {
      setError("Сначала отметь начало месячных.");
      return;
    }
    const validation = validateCycleDates(ongoing.startDate, endDate, data.cycles, todayIso, ongoing.id);
    if (validation) {
      setError(validation);
      return;
    }
    setData((previous) => ({
      ...previous,
      cycles: previous.cycles.map((entry) => entry.id === ongoing.id ? { ...entry, endDate } : entry),
    }));
    setSheet(null);
    setNotice("Окончание сохранено. Спасибо за заботу о себе.");
  }

  return (
    <div className="today-page">
      <header className="today-header">
        <h1 className="font-soft-display">Привет, {greetingName}</h1>
        <p className="today-date">Сегодня, <time dateTime={todayIso}>{prettyDate(todayIso)}</time></p>
        <p className="today-subtitle">Маленькая пауза, чтобы прислушаться к себе.</p>
      </header>

      <CycleOverview model={model} />

      <div className="today-actions-wrap">
        <div className="today-actions" aria-label="Отметить месячные">
          <button
            type="button"
            onClick={() => openSheet("start")}
            disabled={Boolean(ongoing)}
            title={ongoing ? "Сначала отметь окончание предыдущих месячных" : "Отметить первый день месячных"}
            className="primary-action"
          >
            <CareIcon name="plus" className="h-5 w-5" />
            Начались
          </button>
          <button
            type="button"
            onClick={() => openSheet("end")}
            disabled={!ongoing}
            title={ongoing ? "Отметить последний день месячных" : "Станет доступно после отметки начала"}
            className="secondary-action"
          >
            <CareIcon name="check" className="h-5 w-5" />
            Закончились
          </button>
        </div>
        <div className="action-feedback" role="status" aria-live="polite">
          {notice || (ongoing ? "Когда месячные закончатся, отметь последний день." : !model.latestCycle ? "Начни с кнопки «Начались». Можно выбрать прошлую дату." : "Твои отметки помогают уточнять прогноз.")}
        </div>
      </div>

      <CycleGuidance model={model} />

      <BottomSheet open={sheet === "start"} onClose={() => setSheet(null)} title="Отметим начало" subtitle="Выбери первый день месячных. Не обязательно сегодня.">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); confirmStart(); }}>
          <DateField label="Первый день месячных" value={startDate} onChange={(value) => { setStartDate(value); setError(null); }} max={todayIso} required />
          {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
          <button type="submit" className="primary-action w-full">Сохранить начало</button>
        </form>
      </BottomSheet>

      <BottomSheet open={sheet === "end"} onClose={() => setSheet(null)} title="Отметим окончание" subtitle="Выбери последний день месячных.">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); confirmEnd(); }}>
          <DateField label="Последний день месячных" value={endDate} onChange={(value) => { setEndDate(value); setError(null); }} min={ongoing?.startDate} max={todayIso} disabled={!ongoing} required />
          {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
          <button type="submit" disabled={!ongoing} className="primary-action w-full">Сохранить окончание</button>
        </form>
      </BottomSheet>
    </div>
  );
}