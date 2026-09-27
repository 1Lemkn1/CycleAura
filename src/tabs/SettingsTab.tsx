import { useState } from "react";
import type { AppData } from "../types";
import { usePwaInstall } from "../hooks/usePwaInstall";

interface SettingsTabProps {
  data: AppData;
  setData?: (data: AppData) => void;
}

export function SettingsTab({ data, setData }: SettingsTabProps) {
  const { canInstall, install } = usePwaInstall();
  const [confirming, setConfirming] = useState(false);

  function clearAll() {
    if (!setData) return;
    setData({ profile: { ...data.profile }, cycles: [] });
    setConfirming(false);
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-6 pt-4">
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Настройки</h1>

      <section className="space-y-3 text-sm">
        <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Установка приложения</h2>
          <p className="mt-1 text-xs text-slate-500">
            Добавьте CycleAura на главный экран, чтобы открывать без браузера.
          </p>
          {canInstall ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              Установить на главный экран
            </button>
          ) : (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
              Меню браузера → «Установить приложение» / «Добавить на главный экран».
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Данные</h2>
          <p className="mt-1 text-xs text-slate-500">
            Сохранено локально: {data.cycles.length} цикл(ов). Данные не отправляются на сервер.
          </p>
          {confirming ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-rose-600">Удалить всю историю циклов?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-1 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white"
                >
                  Удалить
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600"
            >
              Удалить все записи
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-white/85 p-4 text-xs text-slate-500 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">О приложении</h2>
          <p className="mt-1">
            CycleAura — трекер цикла и заботы о себе. Все расчёты строятся на ваших отметках и
            усреднённой длине цикла.
          </p>
        </div>
      </section>
    </div>
  );
}
