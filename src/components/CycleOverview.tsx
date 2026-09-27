import type { CycleModel } from "../lib/cycleModel";
import { getPhaseContent } from "../lib/cycleContent";
import { daysBetween, formatDays, shortDate } from "../utils/date";
import { CareIcon } from "./CareIcon";
import { CycleOrb } from "./CycleOrb";

export function CycleOverview({ model }: { model: CycleModel }) {
  const previous = model.lastCompletedCycle;
  const phase = getPhaseContent(model);

  return (
    <section className="cycle-overview" aria-label="Твой цикл и прогноз">
      <div className="cycle-overview__center">
        <CycleOrb model={model} />
        {model.cycleDay !== null && (
          <p className="cycle-day-caption">Сегодня <span>{model.cycleDay}-й день</span> твоего цикла</p>
        )}
      </div>

      <div className="cycle-cloud cycle-cloud--past">
        <CareIcon name="calendar" className="cycle-cloud__icon" />
        <p className="cycle-cloud__eyebrow">{previous ? "Последние месячные" : "Первый маленький шаг"}</p>
        {previous?.endDate ? (
          <>
            <h2 className="cycle-cloud__title">С {shortDate(previous.startDate)}</h2>
            <p className="cycle-cloud__text">по {shortDate(previous.endDate)}</p>
            <p className="cycle-cloud__detail">Длились {formatDays(daysBetween(previous.startDate, previous.endDate) + 1)}</p>
          </>
        ) : model.latestCycle ? (
          <>
            <h2 className="cycle-cloud__title">Начало уже отмечено</h2>
            <p className="cycle-cloud__text">С {shortDate(model.latestCycle.startDate)}. Когда месячные закончатся, отметь последний день.</p>
          </>
        ) : (
          <>
            <h2 className="cycle-cloud__title">Начни с одной даты</h2>
            <p className="cycle-cloud__text">Нажми «Начались» и выбери первый день месячных.</p>
          </>
        )}
      </div>

      <div className={`cycle-cloud cycle-cloud--care cycle-cloud--${phase.tone}`}>
        <CareIcon name={model.latestCycle ? "leaf" : "lock"} className="cycle-cloud__icon" />
        <p className="cycle-cloud__eyebrow">{model.latestCycle ? "С заботой о тебе" : "Личное остаётся личным"}</p>
        <h2 className="cycle-cloud__title">{model.latestCycle ? phase.title : "Только для тебя"}</h2>
        <p className="cycle-cloud__text">
          {model.latestCycle ? phase.text : "Твои отметки хранятся в этом браузере. Без аккаунта и отправки на сервер."}
        </p>
      </div>
    </section>
  );
}