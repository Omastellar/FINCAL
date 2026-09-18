import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'default',
  trend,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100';
      case 'success':
        return 'bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border-teal-200/80 dark:border-teal-800/40';
      case 'warning':
        return 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-200/80 dark:border-amber-800/40';
      case 'info':
        return 'bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-200/80 dark:border-blue-800/40';
      default:
        return 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-teal-600 dark:text-teal-400';
      default:
        return 'text-slate-900 dark:text-slate-50';
    }
  };

  const getValueFontSize = (val: string) => {
    const len = val.length;
    if (len > 22) return 'text-sm sm:text-base md:text-lg';
    if (len > 16) return 'text-base sm:text-lg md:text-xl';
    if (len > 12) return 'text-lg sm:text-xl md:text-2xl';
    if (len > 9) return 'text-xl sm:text-2xl md:text-[1.65rem]';
    return 'text-2xl sm:text-3xl';
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 min-w-0 overflow-hidden ${getVariantStyles()}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate min-w-0">
          {label}
        </span>
        {icon && (
          <div className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs text-slate-700 dark:text-slate-300 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="min-w-0 overflow-hidden my-1">
        <div
          className={`${getValueFontSize(value)} font-extrabold tracking-tight tabular-nums leading-tight break-words max-w-full ${getValueColor()}`}
          title={value}
        >
          {value}
        </div>
        {subValue && (
          <p
            className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium break-words leading-tight"
            title={subValue}
          >
            {subValue}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 text-xs min-w-0">
          <span
            className={`font-semibold truncate ${
              trend.direction === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trend.direction === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500'
            }`}
          >
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};
