interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DateField({ label, value, onChange, min, max, disabled, required }: DateFieldProps) {
  return (
    <label className="flex flex-col space-y-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input
        type="date"
        className="min-h-12 min-w-0 rounded-xl border border-rose-100 bg-rose-50/30 px-3 py-2 text-base text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50 disabled:text-slate-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
      />
    </label>
  );
}
