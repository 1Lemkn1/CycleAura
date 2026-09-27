import { useMemo, useState } from "react";
import type { CycleModel, DayKind } from "../lib/cycleModel";
import { describeDay } from "../lib/cycleContent";
import { addDays, formatDate, parseDate, prettyDate } from "../utils/date";
import { CareIcon } from "../components/CareIcon";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const STYLES: Record<DayKind, string> = {
  period: "bg-rose-500 text-white",
  ovulation: "bg-emerald-500 text-white",
  fertile: "bg-emerald-100 text-emerald-900",
  calm: "bg-sky-50 text-sky-800",
  delay: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-400",
  none: "bg-white/70 text-slate-600",
};
const LEGEND = [
  { label: "Менструация", color: "bg-rose-500" },
  { label: "Овуляция (прогноз)", color: "bg-emerald-500" },
  { label: "Фертильные дни", color: "bg-emerald-100 border border-emerald-300" },
  { label: "Спокойные дни", color: "bg-sky-100" },
  { label: "Задержка", color: "bg-rose-100 border border-rose-400" },
];

export function CalendarTab({ model }: { model: CycleModel }) {
  const { todayIso } = model;
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = parseDate(todayIso);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedIso, setSelectedIso] = useState(todayIso);
  const monthLabel = currentMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  const selectedDay = model.getDay(selectedIso);

  const days = useMemo(() => {
    const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const size = Math.ceil((offset + daysInMonth) / 7) * 7;
    return Array.from({ length: size }, (_, index) => {
      const date = addDays(first, index - offset);
      const iso = formatDate(date);
      return { date, iso, info: model.getDay(iso) };
    });
  }, [currentMonth, model]);

  function shiftMonth(step: number) {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + step, 1);
    setCurrentMonth(next);
    setSelectedIso(formatDate(next));
  }

  function returnToToday() {
    const today = parseDate(todayIso);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedIso(todayIso);
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Календарь</h1>
        <button type="button" onClick={returnToToday} className="min-h-11 px-3 text-sm text-rose-600">Сегодня</button>
      </div>
      <header className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц" className="calendar-arrow"><CareIcon name="chevron" className="h-4 w-4 rotate-180" /></button>
        <h2 className="text-base font-semibold capitalize text-slate-800" aria-live="polite">{monthLabel}</h2>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="Следующий месяц" className="calendar-arrow"><CareIcon name="chevron" className="h-4 w-4" /></button>
      </header>

      <div className="mb-3 grid grid-cols-7 gap-1.5 text-center text-xs text-slate-500" aria-hidden="true">
        {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5" aria-label={monthLabel}>
        {days.map(({ date, iso, info }) => {
          const inMonth = date.getMonth() === currentMonth.getMonth();
          const predictedPeriod = info.kind === "period" && info.estimated;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelectedIso(iso)}
              aria-label={`${prettyDate(iso)}. ${describeDay(info)}${iso === todayIso ? ". Сегодня" : ""}`}
              aria-current={iso === todayIso ? "date" : undefined}
              aria-pressed={selectedIso === iso}
              className={`calendar-day ${predictedPeriod ? "border border-dashed border-rose-400 bg-rose-50 text-rose-600" : STYLES[info.kind]} ${!inMonth ? "opacity-40" : ""} ${selectedIso === iso ? "calendar-day--selected" : ""}`}
            >
              {date.getDate()}
              {iso === todayIso && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-h-16 border-b border-rose-100 pb-4" aria-live="polite">
        <p className="text-xs text-slate-500">{prettyDate(selectedIso)}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{describeDay(selectedDay)}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-slate-600" aria-label="Обозначения цветов">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2"><span className={`h-3 w-3 shrink-0 rounded-full ${item.color}`} aria-hidden="true" />{item.label}</div>
        ))}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        {!model.latestCycle ? "Отметь начало месячных на главной, чтобы увидеть свой календарь. " : "Пунктиром отмечены предполагаемые месячные. "}
        Фазы приблизительны. «Спокойные дни» не являются методом контрацепции.
      </p>
    </div>
  );
}