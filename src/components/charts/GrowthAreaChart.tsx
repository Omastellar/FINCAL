import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GrowthPoint } from '../../types/calculators';
import { useCurrency } from '../../context/CurrencyContext';

interface GrowthAreaChartProps {
  data: GrowthPoint[];
  title?: string;
  height?: number;
  principalLabel?: string;
  interestLabel?: string;
  showInflation?: boolean;
  inflationLabel?: string;
}

export const GrowthAreaChart: React.FC<GrowthAreaChartProps> = ({
  data,
  title,
  height = 300,
  principalLabel = 'Total Contributions',
  interestLabel = 'Interest / Growth',
  showInflation = false,
  inflationLabel = 'Real Purchasing Power (Adjusted)',
}) => {
  const { format } = useCurrency();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as GrowthPoint;
      return (
        <div className="bg-slate-900 text-white dark:bg-slate-800 p-3 rounded-xl text-xs shadow-xl border border-slate-700 min-w-48">
          <div className="font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-1">
            Year {label}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="font-medium">Nominal Balance:</span>
              <span className="font-mono font-bold">{format(point.totalBalance)}</span>
            </div>
            {showInflation && point.realPurchasingPower !== undefined && (
              <div className="flex justify-between items-center text-amber-400 font-semibold">
                <span>Real Power:</span>
                <span className="font-mono">{format(point.realPurchasingPower)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-blue-400">
              <span>{principalLabel}:</span>
              <span className="font-mono">{format(point.principalInvested)}</span>
            </div>
            <div className="flex justify-between items-center text-teal-300">
              <span>{interestLabel}:</span>
              <span className="font-mono">{format(point.totalInterest)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (val: number) => {
    return format(val, { compact: true });
  };

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          {title}
        </h4>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(y) => `Yr ${y}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={formatYAxis}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px' }}
              formatter={(value) => (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="principalInvested"
              name={principalLabel}
              stackId="1"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorInvested)"
            />
            <Area
              type="monotone"
              dataKey="totalInterest"
              name={interestLabel}
              stackId="1"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorInterest)"
            />
            {showInflation && (
              <Line
                type="monotone"
                dataKey="realPurchasingPower"
                name={inflationLabel}
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
