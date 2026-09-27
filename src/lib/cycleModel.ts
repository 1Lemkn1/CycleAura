import type { CycleEntry } from "../types.ts";
import { addIsoDays, daysBetween, isIsoDate } from "../utils/date.ts";

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_MENSES_LENGTH = 5;
export const DEFAULT_LUTEAL_LENGTH = 14;

export type DayKind = "none" | "period" | "ovulation" | "fertile" | "calm" | "delay";

export type DayInfo = {
  kind: DayKind;
  estimated: boolean;
  cycleId?: string;
  delayDays?: number;
};

export type CycleForecast = {
  entry: CycleEntry;
  next?: CycleEntry;
  cycleLength: number;
  mensesLength: number;
  predictedMensesLength: number;
  ovulationOffset: number | null;
  expectedStartIso: string;
  sampleCount: number;
  delayDays: number;
};

export type CycleHistoryItem = {
  entry: CycleEntry;
  mensesDays: number | null;
  daysWithoutPeriod: number | null;
  cycleLength: number;
  estimated: boolean;
  expectedStartIso: string;
  nextStartIso?: string;
  delayDays: number;
  sampleCount: number;
};

function isValidEntry(entry: CycleEntry): boolean {
  return Boolean(
    entry && typeof entry.id === "string" && isIsoDate(entry.startDate) &&
    (!entry.endDate || (isIsoDate(entry.endDate) && entry.endDate >= entry.startDate)),
  );
}

function phaseAt(offset: number, ovulationOffset: number | null): DayKind {
  if (ovulationOffset !== null) {
    if (offset === ovulationOffset) return "ovulation";
    if (Math.abs(offset - ovulationOffset) <= 2) return "fertile";
  }
  return "calm";
}

export function createCycleModel(entries: CycleEntry[], todayIso: string) {
  const cycles = entries
    .filter((entry) => isValidEntry(entry) && entry.startDate <= todayIso)
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  let spanSum = 0;
  let spanCount = 0;
  let mensesSum = 0;
  let mensesCount = 0;

  const forecasts: CycleForecast[] = cycles.map((entry, index) => {
    const previous = cycles[index - 1];
    if (previous) {
      const span = daysBetween(previous.startDate, entry.startDate);
      if (span > 0) {
        spanSum += span;
        spanCount += 1;
      }
    }
    if (entry.endDate && entry.endDate <= todayIso) {
      mensesSum += daysBetween(entry.startDate, entry.endDate) + 1;
      mensesCount += 1;
    }

    // Only intervals known at this start enter the baseline. Later records must
    // not erase a historical delay by moving the forecast to the actual start.
    const cycleLength = spanCount ? Math.round(spanSum / spanCount) : DEFAULT_CYCLE_LENGTH;
    const predictedMensesLength = mensesCount
      ? Math.round(mensesSum / mensesCount)
      : DEFAULT_MENSES_LENGTH;
    const mensesLength = entry.endDate
      ? daysBetween(entry.startDate, entry.endDate) + 1
      : predictedMensesLength;
    const expectedStartIso = addIsoDays(entry.startDate, cycleLength);
    const next = cycles[index + 1];
    const offset = cycleLength - DEFAULT_LUTEAL_LENGTH;

    return {
      entry,
      next,
      cycleLength,
      mensesLength,
      predictedMensesLength,
      ovulationOffset: offset >= mensesLength && offset < cycleLength ? offset : null,
      expectedStartIso,
      sampleCount: spanCount,
      delayDays: Math.max(0, daysBetween(expectedStartIso, next?.startDate ?? todayIso)),
    };
  });

  const current = forecasts[forecasts.length - 1];
  const latestCycle = current?.entry;
  const ongoingCycle = [...cycles].reverse().find((entry) => !entry.endDate);
  const lastCompletedCycle = [...cycles].reverse().find((entry) => entry.endDate && entry.endDate <= todayIso);
  const daysUntil = current ? daysBetween(todayIso, current.expectedStartIso) : 0;
  const delay = {
    expectedStartIso: current?.expectedStartIso,
    daysUntil,
    delayDays: Math.max(0, -daysUntil),
    usingDefault: !current?.sampleCount,
    sampleCount: current?.sampleCount ?? 0,
  };

  function getDay(iso: string): DayInfo {
    if (!isIsoDate(iso) || !forecasts.length || iso < forecasts[0].entry.startDate) {
      return { kind: "none", estimated: false };
    }

    // Reuse the precomputed history instead of sorting and averaging per cell.
    let low = 0;
    let high = forecasts.length - 1;
    let index = 0;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (forecasts[middle].entry.startDate <= iso) {
        index = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    const forecast = forecasts[index];
    const { entry, next, expectedStartIso } = forecast;
    const base = { cycleId: entry.id };

    // Recorded dates always win over averages and predictions.
    if (iso === entry.startDate || (entry.endDate && iso <= entry.endDate)) {
      return { ...base, kind: "period", estimated: false };
    }

    if (forecast.delayDays > 0 && iso >= expectedStartIso) {
      if (next || iso <= todayIso) {
        return { ...base, kind: "delay", estimated: true, delayDays: daysBetween(expectedStartIso, iso) };
      }
      // A future day is not a recorded delay. Wait for a new actual start.
      return { ...base, kind: "none", estimated: true };
    }

    if (!entry.endDate && !next && iso <= todayIso && iso < expectedStartIso) {
      return { ...base, kind: "period", estimated: false };
    }

    const offset = daysBetween(entry.startDate, iso);
    if (!next && offset >= forecast.cycleLength) {
      const projectedDay = offset % forecast.cycleLength;
      return {
        ...base,
        kind: projectedDay < forecast.predictedMensesLength
          ? "period"
          : phaseAt(projectedDay, forecast.ovulationOffset),
        estimated: true,
      };
    }
    if (!entry.endDate && offset < forecast.mensesLength) {
      return { ...base, kind: "period", estimated: true };
    }
    return { ...base, kind: phaseAt(offset, forecast.ovulationOffset), estimated: true };
  }

  const history: CycleHistoryItem[] = forecasts.map((forecast) => {
    const { entry, next } = forecast;
    return {
      entry,
      mensesDays: entry.endDate ? daysBetween(entry.startDate, entry.endDate) + 1 : null,
      daysWithoutPeriod: entry.endDate
        ? Math.max(0, daysBetween(entry.endDate, next?.startDate ?? todayIso) - (next ? 1 : 0))
        : null,
      cycleLength: next
        ? daysBetween(entry.startDate, next.startDate)
        : Math.max(forecast.cycleLength, daysBetween(entry.startDate, todayIso) + 1),
      estimated: !next,
      expectedStartIso: forecast.expectedStartIso,
      nextStartIso: next?.startDate,
      delayDays: forecast.delayDays,
      sampleCount: forecast.sampleCount,
    };
  }).reverse();

  return {
    todayIso,
    cycles,
    current,
    latestCycle,
    ongoingCycle,
    lastCompletedCycle,
    cycleDay: latestCycle ? daysBetween(latestCycle.startDate, todayIso) + 1 : null,
    averages: {
      cycleLength: current?.cycleLength ?? DEFAULT_CYCLE_LENGTH,
      mensesLength: current?.predictedMensesLength ?? DEFAULT_MENSES_LENGTH,
      sampleCount: spanCount,
    },
    delay,
    history,
    getDay,
    phaseToday: getDay(todayIso),
  };
}

export type CycleModel = ReturnType<typeof createCycleModel>;