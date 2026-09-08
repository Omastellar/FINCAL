import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

export interface ComparisonBarItem {
  name: string;
  amount: number;
  color?: string;
}

interface ComparisonBarChartProps {
  data: ComparisonBarItem[];
  title?: string;
  height?: number;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  title,
  height = 240,
}) => {
  const { format } = useCurrency();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as ComparisonBarItem;
      return (
        <div className="bg-slate-900 text-white dark:bg-slate-800 p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
          <div className="text-slate-400 font-medium">{item.name}</div>
          <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">
            {format(item.amount)}
          </div>
        </div>
      );
    }
    return null;
  };

  const defaultColors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {title}
        </h4>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => format(v, { compact: true })}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || defaultColors[index % defaultColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
