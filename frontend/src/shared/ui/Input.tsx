import type { ReactNode } from "react";

function clasesInput(error: string | undefined, extra = "px-3"): string {
  return `w-full rounded-xl border bg-crema-50 py-2.5 text-sm text-tinta-900 placeholder:text-tinta-400 focus:bg-white focus:outline-none focus:ring-4 ${extra} ${
    error
      ? "border-rosa-400 focus:ring-rosa-100"
      : "border-crema-300 focus:border-lavanda-300 focus:ring-lavanda-100"
  }`;
}

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FieldWrapper({ id, label, error, required = false, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-tinta-700">
        {label}
        {required && <span className="ml-0.5 text-rosa-700">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-rosa-700">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-tinta-500">{hint}</p>
      )}
    </div>
  );
}

interface BaseFieldProps {
  id: string;
  label: string;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  hint?: string;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  type?: "text" | "email" | "password" | "url";
  autoComplete?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  hint,
  placeholder,
  autoFocus = false,
  multiline = false,
  type = "text",
  autoComplete,
}: TextFieldProps) {
  const comunes = {
    id,
    name: id,
    value,
    placeholder,
    autoFocus,
    autoComplete,
    onBlur,
    className: clasesInput(error),
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <FieldWrapper id={id} label={label} error={error} required={required} hint={hint}>
      {multiline ? (
        <textarea {...comunes} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...comunes} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
    </FieldWrapper>
  );
}

interface NumberFieldProps extends BaseFieldProps {
  /** NaN representa el campo vacío. */
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  hint,
  min,
  step = 1,
  prefix,
}: NumberFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} required={required} hint={hint}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-tinta-500">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={clasesInput(error, prefix ? "pl-7 pr-3" : "px-3")}
        />
      </div>
    </FieldWrapper>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  hint,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} required={required} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        className={clasesInput(error)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur: () => void;
}

export function CheckboxField({ id, label, description, checked, onChange, onBlur }: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-crema-300 bg-crema-50 p-3 hover:bg-white"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onBlur={onBlur}
        className="mt-0.5 h-4 w-4 accent-menta-400"
      />
      <span>
        <span className="block text-sm font-bold text-tinta-700">{label}</span>
        {description && <span className="block text-xs text-tinta-500">{description}</span>}
      </span>
    </label>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Buscar..." }: SearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-tinta-400">
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="m14 14 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-crema-300 bg-white py-2.5 pl-10 pr-4 text-sm text-tinta-900 placeholder:text-tinta-400 focus:border-lavanda-300 focus:outline-none focus:ring-4 focus:ring-lavanda-100"
      />
    </div>
  );
}
