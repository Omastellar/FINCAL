import React, { ReactNode } from 'react';
import { Sparkles, Info, AlertTriangle } from 'lucide-react';

interface InsightBannerProps {
  title?: string;
  insights: string[];
  disclaimer?: string;
  variant?: 'insight' | 'warning' | 'info';
}

export const InsightBanner: React.FC<InsightBannerProps> = ({
  title = 'Financial Insight',
  insights,
  disclaimer,
  variant = 'insight',
}) => {
  if (!insights || insights.length === 0) return null;

  const getThemeStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-amber-500/10 border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
        };
      case 'info':
        return {
          container: 'bg-blue-500/10 border-blue-300 dark:border-blue-800/60 text-blue-900 dark:text-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
        };
      case 'insight':
      default:
        return {
          container: 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100',
          icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
        };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <div className={`rounded-2xl border p-4.5 transition-colors ${currentTheme.container}`}>
      <div className="flex items-start gap-3">
        {currentTheme.icon}
        <div className="flex-1 space-y-1.5 text-sm">
          {title && (
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              {title}
            </h4>
          )}
          <div className="space-y-1 text-slate-700 dark:text-slate-200 leading-relaxed">
            {insights.map((text, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">•</span>
                <span>{text}</span>
              </p>
            ))}
          </div>
          {disclaimer && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-300/40 dark:border-slate-700/40 italic">
              {disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
