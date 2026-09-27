import type { CycleModel, DayInfo, DayKind } from "./cycleModel";
import { formatDays } from "../utils/date";

export const DAY_LABELS: Record<DayKind, string> = {
  none: "Нет данных",
  period: "Менструация",
  ovulation: "Овуляция (прогноз)",
  fertile: "Фертильные дни (прогноз)",
  calm: "Спокойные дни",
  delay: "Задержка относительно прогноза",
};

export function describeDay(day: DayInfo): string {
  if (day.kind === "none" && day.estimated) return "Прогноз уточнится после новой отметки";
  if (day.kind === "period" && day.estimated) return "Предполагаемая менструация";
  if (day.kind === "delay") {
    return day.delayDays ? `Задержка: ${formatDays(day.delayDays)}` : "Ожидаемая дата начала уже прошла";
  }
  return DAY_LABELS[day.kind];
}

export function getPhaseContent(model: CycleModel) {
  if (!model.latestCycle) {
    return {
      title: "Здесь можно быть собой",
      text: "Без оценок и спешки. Постепенно ты узнаешь свой ритм лучше.",
      tone: "rose",
    };
  }
  if (model.delay.delayDays > 0) {
    return {
      title: "У каждого цикла свой ритм",
      text: "Небольшие сдвиги бывают. Проверь, все ли даты отмечены, и прислушайся к себе.",
      tone: "rose",
    };
  }
  if (model.delay.daysUntil === 0 && !model.ongoingCycle) {
    return {
      title: "Сегодня ожидаем начало",
      text: "Это ориентир, а не точный срок. Отметь начало, когда месячные действительно придут.",
      tone: "rose",
    };
  }
  if (model.phaseToday.kind === "period") {
    return {
      title: "Время бережного отношения",
      text: "Тепло, отдых и комфортный тебе темп. Сегодня можно не торопиться.",
      tone: "rose",
    };
  }
  if (model.phaseToday.kind === "fertile" || model.phaseToday.kind === "ovulation") {
    return {
      title: "Возможны фертильные дни",
      text: "По расчёту овуляция может быть близко. Календарь не может подтвердить её наступление.",
      tone: "sage",
    };
  }
  return {
    title: "Сейчас спокойная фаза",
    text: "Для прогулки, любимых планов или отдыха. Выбирай то, что подходит тебе сегодня.",
    tone: "sky",
  };
}