import React, { useState, useMemo } from 'react';
import { TrendingUp, RotateCcw, Zap } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateCompoundInterest } from '../utils/financialMath';
import { CompoundingFrequency } from '../types/calculators';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { GrowthAreaChart } from '../components/charts/GrowthAreaChart';
import { DonutChart } from '../components/charts/DonutChart';

export const CompoundInterestCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();

  // State
  const [principal, setPrincipal] = useState<number>(1_000_000);
  const [interestRate, setInterestRate] = useState<number>(11.5);
  const [additionalContribution, setAdditionalContribution] = useState<number>(100_000);
  const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'annually'>('monthly');
  const [investmentPeriodYears, setInvestmentPeriodYears] = useState<number>(10);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('monthly');

  // Calculation
  const results = useMemo(() => {
    return calculateCompoundInterest(
      principal,
      interestRate,
      additionalContribution,
      contributionFrequency,
      investmentPeriodYears,
      compoundingFrequency
    );
  }, [
    principal,
    interestRate,
    additionalContribution,
    contributionFrequency,
    investmentPeriodYears,
    compoundingFrequency,
  ]);

  // Donut chart
  const donutData = useMemo(() => {
    return [
      { name: 'Initial Principal', value: results.principal, color: '#3b82f6' },
      { name: 'Additional Deposits', value: results.totalContributions, color: '#6366f1' },
      { name: 'Compound Interest', value: results.interestEarned, color: '#10b981' },
    ];
  }, [results]);

  // Insights
  const insights = useMemo(() => {
    const list: string[] = [];
    list.push(
      `Your investment is projected to reach ${format(results.futureValue)} in ${investmentPeriodYears} years.`
    );
    list.push(
      `Compound interest generates ${format(results.interestEarned)} in pure growth—surpassing or multiplying your out-of-pocket deposits.`
    );
    const totalOutPocket = results.principal + results.totalContributions;
    if (totalOutPocket > 0 && results.interestEarned > totalOutPocket) {
      list.push(
        `Milestone reached: Your compound interest earnings exceed the total money you deposited!`
      );
    } else {
      list.push(
        `Compounding frequency is set to ${compoundingFrequency}. The more frequent the compounding, the faster your interest yields more interest.`
      );
    }
    return list;
  }, [results, investmentPeriodYears, compoundingFrequency, format]);

  const resetDefaults = () => {
    setPrincipal(1_000_000);
    setInterestRate(11.5);
    setAdditionalContribution(100_000);
    setContributionFrequency('monthly');
    setInvestmentPeriodYears(10);
    setCompoundingFrequency('monthly');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Compound Interest Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate the exponential growth of your capital through compound interest and recurring contributions.
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
              <Zap className="w-4 h-4 text-emerald-500" />
              Investment Inputs
            </h3>

            {/* Principal */}
            <SliderField
              label="Starting Principal"
              value={principal}
              onChange={setPrincipal}
              min={0}
              max={20_000_000}
              step={50_000}
              prefix={currencyConfig.symbol}
            />

            {/* Additional Contribution */}
            <SliderField
              label="Additional Contribution"
              value={additionalContribution}
              onChange={setAdditionalContribution}
              min={0}
              max={2_000_000}
              step={10_000}
              prefix={currencyConfig.symbol}
            />

            {/* Contribution Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Deposit Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['monthly', 'annually'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setContributionFrequency(freq)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                      contributionFrequency === freq
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Annual Interest Rate */}
            <SliderField
              label="Annual Interest Rate (%)"
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={35}
              step={0.25}
              suffix="%"
              helperText="0% supported"
            />

            {/* Investment Period */}
            <SliderField
              label="Investment Horizon (Years)"
              value={investmentPeriodYears}
              onChange={setInvestmentPeriodYears}
              min={1}
              max={40}
              step={1}
              suffix=" yrs"
            />

            {/* Compounding Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Compounding Schedule
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['daily', 'monthly', 'quarterly', 'annually'] as CompoundingFrequency[]).map((freq) => (
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

          <Card>
            <DonutChart
              data={donutData}
              title="Portfolio Composition"
              height={230}
            />
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Future Value"
              value={format(results.futureValue)}
              subValue={`After ${investmentPeriodYears} years`}
              variant="primary"
            />
            <MetricCard
              label="Total Invested"
              value={format(results.principal + results.totalContributions)}
              subValue="Principal + Contributions"
              variant="info"
            />
            <MetricCard
              label="Compound Interest"
              value={format(results.interestEarned)}
              subValue="Total interest earned"
              variant="success"
            />
          </div>

          {/* Insights */}
          <InsightBanner insights={insights} />

          {/* Growth Chart */}
          <Card>
            <GrowthAreaChart
              data={results.growthTimeline}
              title="Exponential Compound Growth"
              height={320}
              principalLabel="Total Invested"
              interestLabel="Compound Interest"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
