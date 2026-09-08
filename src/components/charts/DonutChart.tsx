import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

export interface DonutDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDataItem[];
  title?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  height = 260,
  innerRadius = 60,
  outerRadius = 90,
}) => {
  const { format } = useCurrency();

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white dark:bg-slate-800 p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
          <div className="flex items-center gap-2 font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.payload.color }}
            />
            <span>{item.name}</span>
          </div>
          <div className="mt-1 font-mono text-emerald-400 font-bold text-sm">
            {format(item.value)}
          </div>
          <div className="text-slate-400 mt-0.5">{percent}% of total</div>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-xl"
        style={{ height }}
      >
        <span>No data to display</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {title && (
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 w-full text-left">
          {title}
        </h4>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
              animationDuration={600}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
