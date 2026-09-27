import { test } from "node:test";
import assert from "node:assert/strict";
import type { CycleEntry } from "../src/types.ts";
import { createCycleModel } from "../src/lib/cycleModel.ts";
import { validateCycleDates } from "../src/lib/cycleValidation.ts";
import { addIsoDays, daysBetween, formatDate, isIsoDate, parseDate } from "../src/utils/date.ts";

function entry(startDate: string, endDate?: string): CycleEntry {
  return { id: startDate, startDate, endDate, createdAt: `${startDate}T12:00:00.000Z` };
}

test("empty history does not invent a date or a delay", () => {
  const model = createCycleModel([], "2026-01-20");
  assert.equal(model.delay.expectedStartIso, undefined);
  assert.equal(model.delay.delayDays, 0);
  assert.equal(model.cycleDay, null);
  assert.equal(model.phaseToday.kind, "none");
});

test("countdown is positive before the predicted date", () => {
  const model = createCycleModel([entry("2026-01-01", "2026-01-06")], "2026-01-20");
  assert.equal(model.delay.expectedStartIso, "2026-01-29");
  assert.equal(model.delay.daysUntil, 9);
  assert.equal(model.delay.delayDays, 0);
  assert.equal(model.delay.usingDefault, true);
  assert.equal(model.cycleDay, 20);
});

test("the due date is not yet a one-day delay", () => {
  const model = createCycleModel([entry("2026-01-01", "2026-01-06")], "2026-01-29");
  assert.equal(model.delay.daysUntil, 0);
  assert.equal(model.delay.delayDays, 0);
  assert.equal(model.phaseToday.estimated, true);
});

test("delay increases with local calendar days, without creating future delays", () => {
  const entries = [entry("2026-01-01", "2026-01-06")];
  const model = createCycleModel(entries, "2026-01-30");
  assert.equal(model.delay.delayDays, 1);
  assert.equal(model.phaseToday.kind, "delay");
  assert.equal(model.getDay("2026-01-29").kind, "delay");
  assert.equal(model.getDay("2026-01-31").kind, "none");
  assert.equal(createCycleModel(entries, "2026-02-02").delay.delayDays, 4);
});

test("a new start resets the countdown even before its end is recorded", () => {
  const model = createCycleModel([
    entry("2026-01-01", "2026-01-06"),
    entry("2026-02-02"),
  ], "2026-02-02");
  assert.equal(model.latestCycle?.startDate, "2026-02-02");
  assert.equal(model.cycleDay, 1);
  assert.equal(model.delay.delayDays, 0);
  assert.equal(model.averages.cycleLength, 32);
  assert.equal(model.delay.expectedStartIso, "2026-03-06");
  assert.equal(model.phaseToday.kind, "period");
  assert.equal(model.history[1].delayDays, 4);
});

test("recorded first and last bleeding days take priority over averages", () => {
  const model = createCycleModel([
    entry("2026-01-01", "2026-01-06"),
    entry("2026-01-29", "2026-01-31"),
  ], "2026-02-05");
  for (let day = 1; day <= 6; day += 1) {
    assert.equal(model.getDay(`2026-01-0${day}`).kind, "period");
    assert.equal(model.getDay(`2026-01-0${day}`).estimated, false);
  }
  assert.equal(model.getDay("2026-01-07").kind, "calm");
  assert.equal(model.getDay("2026-02-01").kind, "calm");
  assert.equal(model.getDay("2025-12-31").kind, "none");
});

test("historical delay is retained after later cycles are added", () => {
  const entries = [
    entry("2026-01-01", "2026-01-06"),
    entry("2026-01-29", "2026-02-03"),
    entry("2026-03-02", "2026-03-07"),
  ];
  const model = createCycleModel(entries, "2026-03-10");
  const later = createCycleModel([...entries, entry("2026-03-30", "2026-04-04")], "2026-04-10");
  assert.equal(model.history.find((item) => item.entry.startDate === "2026-01-29")?.delayDays, 4);
  assert.equal(later.history.find((item) => item.entry.startDate === "2026-01-29")?.delayDays, 4);
  assert.equal(later.getDay("2026-02-27").kind, "delay");
  assert.equal(later.getDay("2026-03-02").kind, "period");
});

test("history counts actual days without bleeding, excluding both boundaries", () => {
  const model = createCycleModel([
    entry("2026-07-01", "2026-07-06"),
    entry("2026-08-01", "2026-08-06"),
  ], "2026-08-10");
  assert.equal(model.history[1].mensesDays, 6);
  assert.equal(model.history[1].daysWithoutPeriod, 25);
  assert.equal(model.history[1].cycleLength, 31);
  assert.equal(model.history[0].daysWithoutPeriod, 4);
});

test("unsorted input is not mutated and does not affect the active cycle", () => {
  const entries = [entry("2026-02-02"), entry("2026-01-01", "2026-01-06")];
  const before = JSON.stringify(entries);
  const model = createCycleModel(entries, "2026-02-03");
  assert.equal(model.latestCycle?.startDate, "2026-02-02");
  assert.equal(JSON.stringify(entries), before);
});

test("ovulation is an estimate, never a confirmed observation", () => {
  const model = createCycleModel([entry("2026-01-01", "2026-01-06")], "2026-01-20");
  assert.equal(model.getDay("2026-01-15").kind, "ovulation");
  assert.equal(model.getDay("2026-01-15").estimated, true);
  assert.equal(model.getDay("2026-01-13").kind, "fertile");
  assert.equal(model.getDay("2026-01-18").kind, "calm");
});

test("local date formatting never converts midnight to the previous UTC date", () => {
  for (const iso of ["2026-07-01", "2026-01-01", "2026-03-29", "2024-02-29"]) {
    assert.equal(formatDate(parseDate(iso)), iso);
  }
  assert.equal(daysBetween("2026-03-28", "2026-03-30"), 2);
  assert.equal(daysBetween("2026-10-24", "2026-10-26"), 2);
  assert.equal(addIsoDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addIsoDays("2026-12-31", 1), "2027-01-01");
});

test("validation rejects invalid, future, reversed, duplicate and overlapping dates", () => {
  const entries = [entry("2026-01-01", "2026-01-06")];
  const today = "2026-02-10";
  assert.equal(isIsoDate("2026-02-30"), false);
  assert.ok(validateCycleDates("", undefined, entries, today));
  assert.ok(validateCycleDates("2026-02-11", undefined, entries, today));
  assert.ok(validateCycleDates("2026-01-01", "2026-01-06", entries, today));
  assert.ok(validateCycleDates("2026-01-05", "2026-01-08", entries, today));
  assert.ok(validateCycleDates("2026-01-15", "2026-01-14", entries, today));
  assert.equal(validateCycleDates("2026-01-01", "2026-01-06", entries, today, "2026-01-01"), null);
  assert.equal(validateCycleDates("2026-02-02", "2026-02-07", entries, today), null);
});

test("a second open period cannot overlap a later record", () => {
  assert.ok(validateCycleDates("2026-02-02", undefined, [entry("2026-01-01")], "2026-02-10"));
  assert.ok(validateCycleDates("2026-01-01", undefined, [entry("2026-02-01", "2026-02-06")], "2026-02-10"));
});