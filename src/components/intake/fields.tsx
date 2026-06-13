import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-brand-navy">{label}</span>
      {hint && <span className="block text-xs text-gray-500 mb-1">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold";

export function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      className={inputClass}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      className={inputClass}
      rows={3}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex gap-3">
      {[
        { label: "Yes", val: true },
        { label: "No", val: false },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
            value === opt.val
              ? "border-brand-gold bg-brand-gold/20 text-brand-navy"
              : "border-gray-300 text-gray-600 hover:border-brand-gold"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  value: string | null;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      className={inputClass}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function MultiSelectGrid({
  values,
  onChange,
  options,
  max,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  options: { value: string; label: string }[];
  max?: number;
}) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      if (max && values.length >= max) return;
      onChange([...values, value]);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        const rank = values.indexOf(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-medium transition ${
              selected
                ? "border-brand-gold bg-brand-gold/20 text-brand-navy"
                : "border-gray-300 text-gray-600 hover:border-brand-gold"
            }`}
          >
            <span>{opt.label}</span>
            {selected && (
              <span className="ml-2 rounded-full bg-brand-navy text-xs text-white px-2 py-0.5">
                {rank + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
