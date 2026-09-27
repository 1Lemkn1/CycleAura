import { useState } from "react";
import type { AppData, CycleEntry, SetAppData } from "../types";
import type { CycleModel } from "../lib/cycleModel";
import { validateCycleDates } from "../lib/cycleValidation";
import { formatDays, prettyDate, shortDate } from "../utils/date";
import { BottomSheet } from "../components/BottomSheet";
import { DateField } from "../components/DateField";

interface HistoryTabProps {
  data: AppData;
  setData: SetAppData;
  model: CycleModel;
}

export function HistoryTab({ data, setData, model }: HistoryTabProps) {
  const [editing, setEditing] = useState<CycleEntry | null>(null);
  const [deleting, setDeleting] = useState<CycleEntry | null>(null);
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const [stillOngoing, setStillOngoing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  function openEdit(cycle: CycleEntry) {
    setEditing(cycle);
    setStartValue(cycle.startDate);
    setEndValue(cycle.endDate ?? model.todayIso);
    setStillOngoing(!cycle.endDate);
    setError(null);
    setNotice("");
  }

  function saveEdit() {
    if (!editing) return;
    const endDate = stillOngoing ? undefined : endValue;
    const validation = validateCycleDates(startValue, endDate, data.cycles, model.todayIso, editing.id);
    if (validation) {
      setError(validation);
      return;
    }
    setData((previous) => ({
      ...previous,
      cycles: previous.cycles.map((entry) => entry.id === editing.id ? { ...entry, startDate: startValue, endDate } : entry),
    }));
    setEditing(null);
    setNotice("Изменения сохранены. Календарь и прогноз обновлены.");
  }

  function confirmDelete() {
    if (!deleting) return;
    setData((previous) => ({ ...previous, cycles: previous.cycles.filter((entry) => entry.id !== deleting.id) }));
    setDeleting(null);
    setNotice("Запись удалена. Прогноз пересчитан.");
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-6">
      <h1 className="text-xl font-semibold text-slate-800">История циклов</h1>
      <p className="mt-1 mb-5 text-sm text-slate-500">Твои отметки складываются в твою историю.</p>
      {notice && <p role="status" className="mb-4 text-sm text-emerald-700">{notice}</p>}

      {!model.history.length ? (
        <p className="py-8 text-center text-sm leading-relaxed text-slate-500">Здесь появится первая запись, когда ты отметишь начало месячных на главной.</p>
      ) : (
        <div className="space-y-4">
          {model.history.map((summary) => {
            const { entry } = summary;
            return (
              <article key={entry.id} className="history-entry">
                <header className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-800">С {shortDate(entry.startDate)}</h2>
                  <span className="shrink-0 text-xs text-slate-500">{entry.startDate.slice(0, 4)}</span>
                </header>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {entry.endDate ? `По ${prettyDate(entry.endDate)}` : "Окончание пока не отмечено"}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-xs text-rose-600">Месячные</dt><dd className="mt-1 font-semibold text-slate-800">{summary.mensesDays !== null ? formatDays(summary.mensesDays) : "Ещё идут"}</dd></div>
                  <div><dt className="text-xs text-sky-700">Без месячных{summary.estimated && " на сегодня"}</dt><dd className="mt-1 font-semibold text-slate-800">{summary.daysWithoutPeriod !== null ? formatDays(summary.daysWithoutPeriod) : "Пока неизвестно"}</dd></div>
                </dl>

                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  {summary.nextStartIso
                    ? `Следующий цикл начался ${shortDate(summary.nextStartIso)}. Между началами: ${formatDays(summary.cycleLength)}.`
                    : `Ожидаемое начало следующего: ${prettyDate(summary.expectedStartIso)}.`}
                </p>
                {summary.delayDays > 0 && (
                  <p className="mt-2 border-l-2 border-rose-300 pl-2.5 text-xs leading-relaxed text-rose-700">
                    {summary.nextStartIso ? "Задержка перед следующим циклом" : "Текущая задержка"}: <strong>{formatDays(summary.delayDays)}</strong>.
                    {" "}От прогноза на {shortDate(summary.expectedStartIso)}{summary.sampleCount === 0 ? " (первоначальный ориентир 28 дней)" : ""}.
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2 border-t border-rose-50 pt-2">
                  <button type="button" onClick={() => openEdit(entry)} aria-label={`Редактировать запись с ${shortDate(entry.startDate)}`} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50">Редактировать</button>
                  <button type="button" onClick={() => { setDeleting(entry); setNotice(""); }} aria-label={`Удалить запись с ${shortDate(entry.startDate)}`} className="min-h-11 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-50">Удалить</button>
                </div>
              </article>
            );
          })}
          <p className="pt-1 text-xs leading-relaxed text-slate-500">«Без месячных» означает дни между кровотечениями, включая возможные фертильные дни. Это не оценка вероятности беременности.</p>
        </div>
      )}

      <BottomSheet open={Boolean(editing)} onClose={() => setEditing(null)} title="Изменить запись" subtitle="После сохранения все расчёты обновятся.">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveEdit(); }}>
          <DateField label="Первый день месячных" value={startValue} onChange={(value) => { setStartValue(value); setError(null); }} max={model.todayIso} required />
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={stillOngoing} onChange={(event) => { setStillOngoing(event.target.checked); setError(null); }} className="h-4 w-4 accent-rose-500" />
            Месячные ещё идут
          </label>
          {!stillOngoing && <DateField label="Последний день месячных" value={endValue} onChange={(value) => { setEndValue(value); setError(null); }} min={startValue} max={model.todayIso} required />}
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button type="submit" className="primary-action w-full">Сохранить изменения</button>
        </form>
      </BottomSheet>

      <BottomSheet open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Удалить запись?" subtitle={deleting ? `Начало ${prettyDate(deleting.startDate)}` : undefined}>
        <p className="mb-5 text-center text-sm text-slate-500">Запись исчезнет из истории и расчётов. Отменить удаление нельзя.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setDeleting(null)} className="secondary-action flex-1">Оставить</button>
          <button type="button" onClick={confirmDelete} className="primary-action flex-1">Удалить</button>
        </div>
      </BottomSheet>
    </div>
  );
}