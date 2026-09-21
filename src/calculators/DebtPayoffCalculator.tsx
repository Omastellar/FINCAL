import React, { useState, useMemo, useEffect } from 'react';
import { ShieldAlert, RotateCcw, Flame, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateDebtPayoff } from '../utils/financialMath';
import { formatDurationMonths } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';

export const DebtPayoffCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  // State
  const [currentDebt, setCurrentDebt] = useState<number>(() => {
    const val = initialParams.get('debt');
    return val ? parseFloat(val) : 0;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 0;
  });
  const [monthlyPayment, setMonthlyPayment] = useState<number>(() => {
    const val = initialParams.get('payment');
    return val ? parseFloat(val) : 0;
  });
  const [additionalMonthlyPayment, setAdditionalMonthlyPayment] = useState<number>(() => {
    const val = initialParams.get('extra');
    return val ? parseFloat(val) : 0;
  });

  useEffect(() => {
    updateUrlParams({
      calc: 'debt',
      debt: currentDebt,
      rate: interestRate,
      payment: monthlyPayment,
      extra: additionalMonthlyPayment,
    });
  }, [currentDebt, interestRate, monthlyPayment, additionalMonthlyPayment, updateUrlParams]);

  // Calculation
  const results = useMemo(() => {
    return calculateDebtPayoff(
      currentDebt,
      interestRate,
      monthlyPayment,
      additionalMonthlyPayment
    );
  }, [currentDebt, interestRate, monthlyPayment, additionalMonthlyPayment]);

  // Insights
  const insights = useMemo(() => {
    if (currentDebt <= 0) {
      return ['Enter your debt balance, interest rate, and monthly payment to view payoff insights.'];
    }

    if (!results.isValidPayment) {
      return [
        `Warning: Your monthly payment of ${format(monthlyPayment)} is insufficient to cover the monthly interest of ${format(results.minMonthlyInterest)}. At this rate, debt balance will grow indefinitely.`,
        `Increase your standard monthly payment to at least ${format(results.minMonthlyInterest + 5000)} to begin reducing principal.`,
      ];
    }

    const list: string[] = [];
    list.push(
      `Under your accelerated plan (${format(monthlyPayment + additionalMonthlyPayment)}/mo), you will become debt-free in ${formatDurationMonths(results.acceleratedPayoffMonths)}.`
    );
    if (additionalMonthlyPayment > 0 && results.interestSaved > 0) {
      list.push(
        `By contributing an extra ${format(additionalMonthlyPayment)} each month, you save ${format(results.interestSaved)} in interest charges and become debt-free ${formatDurationMonths(results.monthsSaved)} sooner!`
      );
    } else {
      list.push(
        `You will pay ${format(results.standardTotalInterest)} in interest over the course of ${formatDurationMonths(results.standardPayoffMonths)}.`
      );
    }
    return list;
  }, [currentDebt, results, monthlyPayment, additionalMonthlyPayment, format]);

  const resetDefaults = () => {
    setCurrentDebt(0);
    setInterestRate(0);
    setMonthlyPayment(0);
    setAdditionalMonthlyPayment(0);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white dark:bg-slate-800 p-3 rounded-xl text-xs shadow-xl border border-slate-700">
          <div className="font-semibold text-slate-300 mb-1 border-b border-slate-700 pb-1">
            Month {label} ({formatDurationMonths(Number(label))})
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4 text-slate-300">
              <span>Standard Plan:</span>
              <span className="font-mono font-bold">{format(payload[0]?.value ?? 0)}</span>
            </div>
            {payload[1] && (
              <div className="flex justify-between items-center gap-4 text-emerald-400">
                <span>Accelerated Plan:</span>
                <span className="font-mono font-bold">{format(payload[1].value)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Debt Payoff Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare standard payoff against accelerated strategies to calculate interest savings and time shaved off debt.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Debt Information
            </h3>

            {/* Current Debt */}
            <SliderField
              label="Current Debt Balance"
              value={currentDebt}
              onChange={setCurrentDebt}
              min={0}
              max={25_000_000}
              step={20_000}
              prefix={currencyConfig.symbol}
            />

            {/* Interest Rate */}
            <SliderField
              label="Annual Interest Rate (APR)"
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={40}
              step={0.25}
              suffix="%"
              helperText="Credit card avg: 18-25%"
            />

            {/* Standard Monthly Payment */}
            <SliderField
              label="Standard Monthly Payment"
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              min={0}
              max={1_000_000}
              step={2_500}
              prefix={currencyConfig.symbol}
              helperText={
                currentDebt > 0 && !results.isValidPayment
                  ? `Min required: ${format(results.minMonthlyInterest)}`
                  : undefined
              }
            />

            {/* Additional Monthly Payment */}
            <SliderField
              label="Additional Monthly Payment"
              value={additionalMonthlyPayment}
              onChange={setAdditionalMonthlyPayment}
              min={0}
              max={500_000}
              step={2_500}
              prefix={currencyConfig.symbol}
              helperText="Extra payment to principal"
            />
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Validation Warning if Payment is too low */}
          {currentDebt > 0 && !results.isValidPayment ? (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                <div className="text-sm space-y-1">
                  <h4 className="font-bold">Payment Below Monthly Interest</h4>
                  <p>
                    Your monthly payment of <strong>{format(monthlyPayment)}</strong> does not cover the monthly interest of <strong>{format(results.minMonthlyInterest)}</strong>.
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-2">
                    Please increase your monthly payment to avoid indefinite negative amortization.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  label="Accelerated Payoff Time"
                  value={formatDurationMonths(results.acceleratedPayoffMonths)}
                  subValue={
                    results.monthsSaved > 0
                      ? `${formatDurationMonths(results.monthsSaved)} faster!`
                      : 'Same as standard'
                  }
                  variant="primary"
                  icon={<Clock className="w-4 h-4 text-emerald-500" />}
                />
                <MetricCard
                  label="Total Interest Saved"
                  value={format(results.interestSaved)}
                  subValue={
                    additionalMonthlyPayment > 0
                      ? `Paid ${format(results.acceleratedTotalInterest)} vs ${format(results.standardTotalInterest)}`
                      : 'Add extra payment to save'
                  }
                  variant="success"
                  icon={<DollarSign className="w-4 h-4 text-teal-500" />}
                />
                <MetricCard
                  label="Accelerated Total Repayment"
                  value={format(results.acceleratedTotalRepayment)}
                  subValue={`Principal: ${format(currentDebt)}`}
                  variant="default"
                />
                <MetricCard
                  label="Standard Plan Repayment"
                  value={format(results.standardTotalRepayment)}
                  subValue={`Interest: ${format(results.standardTotalInterest)}`}
                  variant="warning"
                />
              </div>

              {/* Insights */}
              <InsightBanner
                insights={insights}
                variant={results.interestSaved > 0 ? 'insight' : 'info'}
              />

              {/* Debt Reduction Timeline Chart */}
              <Card className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Debt Reduction Timeline (Balance over Months)
                </h4>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={results.timeline}
                      margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(m) => `Mo ${m}`}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(v) => format(v, { compact: true })}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: '8px' }}
                        formatter={(value) => (
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {value}
                          </span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="standardBalance"
                        name="Standard Plan"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="acceleratedBalance"
                        name="Accelerated Plan"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
