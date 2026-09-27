import type { AppData } from "../types";

interface ProfileTabProps {
  data: AppData;
  setData?: (data: AppData) => void;
}

const FIELDS: { key: "name" | "age" | "height" | "weight"; label: string; placeholder: string }[] = [
  { key: "name", label: "Как вас зовут", placeholder: "Например, Мария" },
  { key: "age", label: "Возраст", placeholder: "27" },
  { key: "height", label: "Рост, см", placeholder: "168" },
  { key: "weight", label: "Вес, кг", placeholder: "58" },
];

export function ProfileTab({ data, setData }: ProfileTabProps) {
  function update(key: string, value: string) {
    if (!setData) return;
    setData({ ...data, profile: { ...data.profile, [key]: value } });
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-6 pt-4">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Профиль</h1>
      <p className="mb-4 text-xs text-slate-500">
        Данные сохраняются только в этом браузере и никуда не отправляются.
      </p>

      <div className="space-y-3">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col space-y-1 text-sm">
            <span className="text-slate-700">{field.label}</span>
            <input
              type="text"
              inputMode={field.key === "name" ? "text" : "numeric"}
              value={data.profile[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => update(field.key, e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-white/80 p-4 text-xs text-slate-500 shadow-sm">
        <p className="font-semibold text-slate-700">Записей в истории: {data.cycles.length}</p>
        <p className="mt-1">
          Имя используется в приветствии на главной странице. Остальные поля — для справки.
        </p>
      </div>
    </div>
  );
}
