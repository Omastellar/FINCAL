import React, { useState, useMemo } from 'react';
import { PiggyBank, RotateCcw, TrendingUp } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateSavingsGrowth } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { GrowthAreaChart } from '../components/charts/GrowthAreaChart';

export const SavingsCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();

  // State
  const [initialDeposit, setInitialDeposit] = useState<number>(200_000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(50_000);
  const [interestRate, setInterestRate] = useState<number>(9.0);
  const [savingsPeriodYears, setSavingsPeriodYears] = useState<number>(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Calculation
  const results = useMemo(() => {
    return calculateSavingsGrowth(
      initialDeposit,
      monthlyContribution,
      interestRate,
      savingsPeriodYears,
      compoundingFrequency
    );
  }, [initialDeposit, monthlyContribution, interestRate, savingsPeriodYears, compoundingFrequency]);

  // Plain-English insights
  const insights = useMemo(() => {
    const list: string[] = [];
    list.push(
      `In ${savingsPeriodYears} years, your estimated total savings balance will reach ${format(results.finalBalance)}.`
    );
    list.push(
      `Your total deposits equal ${format(results.totalContributions)}, generating ${format(results.interestEarned)} in earned interest.`
    );
    const returnPct = results.totalContributions > 0 ? (results.interestEarned / results.totalContributions) * 100 : 0;
    list.push(
      `Your money grew by ${returnPct.toFixed(1)}% through regular compounding. Increasing your monthly contribution by even a small amount can accelerate your final wealth.`
    );
    return list;
  }, [results, savingsPeriodYears, format]);

  const resetDefaults = () => {
    setInitialDeposit(200_000);
    setMonthlyContribution(50_000);
    setInterestRate(9.0);
    setSavingsPeriodYears(5);
    setCompoundingFrequency('monthly');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Project your savings growth over time with initial funds, recurring contributions, and compounding interest.
          </p>
        </div>
        <button
          onClick={resetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-500" />
              Savings Plan
            </h3>

            {/* Initial Deposit */}
            <SliderField
              label="Initial Deposit"
              value={initialDeposit}
              onChange={setInitialDeposit}
              min={0}
              max={10_000_000}
              step={10_000}
              prefix={currencyConfig.symbol}
            />

            {/* Monthly Contribution */}
            <SliderField
              label="Monthly Contribution"
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={0}
              max={1_000_000}
              step={5_000}
              prefix={currencyConfig.symbol}
            />

            {/* Annual Interest Rate */}
            <SliderField
              label="Annual Interest Rate (%)"
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={30}
              step={0.25}
              suffix="%"
              helperText="0% supported"
            />

            {/* Savings Period */}
            <SliderField
              label="Savings Period (Years)"
              value={savingsPeriodYears}
              onChange={setSavingsPeriodYears}
              min={1}
              max={30}
              step={1}
              suffix=" yrs"
            />

            {/* Compounding Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Compounding Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['monthly', 'quarterly', 'annually'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setCompoundingFrequency(freq)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                      compoundingFrequency === freq
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Final Balance"
              value={format(results.finalBalance)}
              subValue={`After ${savingsPeriodYears} years`}
              variant="primary"
            />
            <MetricCard
              label="Total Contributions"
              value={format(results.totalContributions)}
              subValue="Your invested principal"
              variant="info"
            />
            <MetricCard
              label="Interest Earned"
              value={format(results.interestEarned)}
              subValue="From compounding"
              variant="success"
            />
          </div>

          {/* Insights */}
          <InsightBanner insights={insights} />

          {/* Growth Chart Card */}
          <Card>
            <GrowthAreaChart
              data={results.growthTimeline}
              title="Savings Growth Over Time"
              height={300}
              principalLabel="Total Deposited"
              interestLabel="Interest Earned"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
