import type { CycleModel } from "../lib/cycleModel";
import { formatDays, plural, shortDate } from "../utils/date";

export function CycleGuidance({ model }: { model: CycleModel }) {
  const { delay } = model;
  if (!model.latestCycle) {
    return (
      <p className="welcome-note">
        Прогноз появится после первой отметки.<br />
        Чем больше циклов ты отметишь, тем больше мы узнаем о твоём ритме.
      </p>
    );
  }

  return (
    <div className="cycle-guidance">
      {delay.delayDays > 0 && (
        <aside className="delay-guidance" aria-label="Подсказка при задержке">
          <h2>Без тревоги, с вниманием к себе</h2>
          <p>
            Ожидали начало {shortDate(delay.expectedStartIso!)}. Это расчётная дата, а не диагноз.
            {" "}Если беременность возможна, можно сделать тест по его инструкции.
          </p>
          {delay.delayDays >= 7 && (
            <p className="delay-guidance__followup">
              Если месячные не приходят или самочувствие беспокоит, обратись к врачу.
              Не нужно ждать дольше, если тебе нужна помощь.
            </p>
          )}
        </aside>
      )}

      <details className="forecast-details">
        <summary>Как считается прогноз</summary>
        <div>
          <p>
            {delay.usingDefault
              ? "Пока между отметками нет полного цикла, используем ориентир 28 дней. Он может отличаться от твоего ритма."
              : `Средняя длина твоего цикла: ${formatDays(model.averages.cycleLength)}. Учтено ${delay.sampleCount} ${plural(delay.sampleCount, "интервал", "интервала", "интервалов")} между началами месячных.`}
          </p>
          <p>Задержку считаем со дня после ожидаемого начала. Новая отметка «Начались» запускает следующий цикл.</p>
          <p>Овуляция и фертильные дни приблизительны. «Спокойные дни» не означают отсутствие вероятности беременности. Календарь не подходит для контрацепции и не заменяет консультацию врача.</p>
        </div>
      </details>
    </div>
  );
}