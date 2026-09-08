import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
