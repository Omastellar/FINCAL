import React from 'react';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  helperText,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(Math.max(0, Math.min(max, parsed)));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300 gap-2 min-w-0">
        <label className="truncate min-w-0">{label}</label>
        <div className="relative flex items-center shrink-0">
          {prefix && (
            <span className="absolute left-2.5 text-xs text-slate-400 font-semibold pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            className={`w-32 sm:w-36 text-right ${
              String(value).length > 8 ? 'text-xs' : 'text-sm'
            } font-semibold tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${
              prefix ? 'pl-6 sm:pl-7' : 'pl-2.5'
            } ${suffix ? 'pr-7 sm:pr-8' : 'pr-2.5'}`}
          />
          {suffix && (
            <span className="absolute right-2.5 text-xs text-slate-400 font-semibold pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500"
      />

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {prefix}
          {min.toLocaleString()}
          {suffix}
        </span>
        {helperText && <span>{helperText}</span>}
        <span>
          {prefix}
          {max.toLocaleString()}
          {suffix}
        </span>
      </div>
    </div>
  );
};
