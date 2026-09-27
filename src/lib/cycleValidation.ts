import type { CycleEntry } from "../types.ts";
import { isIsoDate } from "../utils/date.ts";

export function validateCycleDates(
  startDate: string,
  endDate: string | undefined,
  cycles: CycleEntry[],
  todayIso: string,
  editingId?: string,
): string | null {
  if (!isIsoDate(startDate)) return "Выбери корректную дату начала.";
  if (endDate !== undefined && !isIsoDate(endDate)) return "Выбери корректную дату окончания.";
  if (startDate > todayIso || (endDate && endDate > todayIso)) return "Нельзя отметить дату в будущем.";
  if (endDate && endDate < startDate) return "Последний день не может быть раньше первого.";

  const others = cycles.filter((entry) => entry.id !== editingId);
  if (others.some((entry) => entry.startDate === startDate)) return "Начало месячных в этот день уже отмечено.";
  if (!endDate && others.some((entry) => !entry.endDate)) {
    return "Сначала отметь окончание предыдущих месячных. Даты можно исправить в истории.";
  }

  const intervalEnd = endDate ?? todayIso;
  const overlap = others.some((entry) => {
    const otherEnd = entry.endDate ?? todayIso;
    return startDate <= otherEnd && intervalEnd >= entry.startDate;
  });
  if (overlap) return "Эти даты пересекаются с другой записью. Проверь историю месячных.";
  return null;
}