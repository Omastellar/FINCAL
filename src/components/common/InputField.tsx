import React from 'react';

interface InputFieldProps {
  id?: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
  placeholder,
  helperText,
  error,
  required = false,
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300">
        <label htmlFor={inputId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
        {helperText && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {helperText}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 font-medium select-none">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value === 0 && placeholder ? '' : value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 py-2.5 text-base tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            prefix ? (prefix.length > 2 ? 'pl-14' : 'pl-9') : 'pl-3.5'
          } ${suffix ? 'pr-12' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        />
        {suffix && (
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 font-medium text-sm select-none">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-rose-500 dark:text-rose-400 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
