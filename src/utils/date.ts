const DAY_MS = 86_400_000;

// Calendar dates stay local; only date-time timestamps use toISOString().
export function formatDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseDate(value);
  return Number.isFinite(parsed.getTime()) && formatDate(parsed) === value;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addIsoDays(iso: string, days: number): string {
  return formatDate(addDays(parseDate(iso), days));
}

export function daysBetween(aIso: string, bIso: string): number {
  // UTC day numbers avoid 23/25-hour days at daylight-saving transitions.
  const dayNumber = (iso: string) => {
    const date = parseDate(iso);
    const utc = new Date(0);
    utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    utc.setUTCHours(0, 0, 0, 0);
    return utc.getTime() / DAY_MS;
  };
  return dayNumber(bIso) - dayNumber(aIso);
}

export function prettyDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function shortDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function plural(count: number, one: string, few: string, many: string): string {
  const number = Math.abs(count) % 100;
  if (number >= 11 && number <= 19) return many;
  if (number % 10 === 1) return one;
  if (number % 10 >= 2 && number % 10 <= 4) return few;
  return many;
}

export function dayWord(days: number): string {
  return plural(days, "день", "дня", "дней");
}

export function formatDays(days: number): string {
  return `${days} ${dayWord(days)}`;
}