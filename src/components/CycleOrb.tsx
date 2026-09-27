import type { CycleModel } from "../lib/cycleModel";
import { dayWord, formatDays, parseDate, prettyDate } from "../utils/date";
import { CareIcon } from "./CareIcon";

export function CycleOrb({ model }: { model: CycleModel }) {
  const { delay } = model;
  const expected = delay.expectedStartIso ? parseDate(delay.expectedStartIso) : null;
  const month = expected
    ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" })
      .formatToParts(expected).find((part) => part.type === "month")?.value
    : "";
  const delayed = delay.delayDays > 0;
  const contentKey = `${delay.expectedStartIso ?? "welcome"}:${delayed ? delay.delayDays : "forecast"}`;

  return (
    <div className={`cycle-orb ${delayed ? "cycle-orb--delayed" : ""} ${!expected ? "cycle-orb--welcome" : ""}`}>
      <div className="cycle-orb__halo" aria-hidden="true" />
      <div className="cycle-orb__rim" aria-hidden="true" />
      <div className="cycle-orb__face">
        <div key={contentKey} className="cycle-orb__content" role="status" aria-live="polite" aria-atomic="true">
          {!expected ? (
            <>
              <CareIcon name="heart" className="mb-3 h-7 w-7 text-rose-400" />
              <span className="cycle-orb__eyebrow">Твой цикл, твой ритм</span>
              <p className="cycle-orb__welcome font-soft-display">Давай<br />начнём</p>
              <p className="cycle-orb__hint">С одного маленького шага</p>
            </>
          ) : delayed ? (
            <>
              <span className="cycle-orb__eyebrow">Задержка</span>
              <span className={`cycle-orb__number font-soft-display ${delay.delayDays >= 1000 ? "cycle-orb__number--long" : ""}`}>{delay.delayDays}</span>
              <span className="cycle-orb__month font-soft-display">{dayWord(delay.delayDays)}</span>
              <span className="cycle-orb__hint">от ожидаемой даты</span>
              <span className="sr-only">Ожидали начало {prettyDate(delay.expectedStartIso!)}</span>
            </>
          ) : (
            <>
              <span className="cycle-orb__eyebrow">Следующие месячные</span>
              <time dateTime={delay.expectedStartIso} className="cycle-orb__date">
                <span className="cycle-orb__number font-soft-display">{expected.getDate()}</span>
                <span className="cycle-orb__month font-soft-display">{month}</span>
                <span className="cycle-orb__year">{expected.getFullYear()}</span>
              </time>
              <span className="cycle-orb__hint">
                {delay.daysUntil === 0 ? "Ожидаются сегодня" : `Примерно через ${formatDays(delay.daysUntil)}`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}