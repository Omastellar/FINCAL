import React from 'react';
import { Sliders, ArrowRight } from 'lucide-react';

interface WhatIfSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  baselineValue?: number;
  impactSummary?: string;
  impactPositive?: boolean;
  onChange: (val: number) => void;
  helperText?: string;
}

export const WhatIfSlider: React.FC<WhatIfSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  baselineValue,
  impactSummary,
  impactPositive = true,
  onChange,
  helperText,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  return (
    <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            {prefix && (
              <span className="absolute left-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                {prefix}
              </span>
            )}
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleInputChange}
              className={`w-28 sm:w-32 text-right font-bold text-xs sm:text-sm tabular-nums rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                prefix ? 'pl-6' : 'pl-2'
              } ${suffix ? 'pr-6' : 'pr-2'}`}
            />
            {suffix && (
              <span className="absolute right-2 text-xs text-slate-400 font-semibold pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
      />

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {prefix}
          {min.toLocaleString()}
          {suffix}
        </span>
        {baselineValue !== undefined && (
          <span className="text-slate-400 dark:text-slate-500">
            Baseline: {prefix}{baselineValue.toLocaleString()}{suffix}
          </span>
        )}
        <span>
          {prefix}
          {max.toLocaleString()}
          {suffix}
        </span>
      </div>

      {impactSummary && (
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
            impactPositive
              ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          <span>{impactSummary}</span>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          {helperText}
        </p>
      )}
    </div>
  );
};
