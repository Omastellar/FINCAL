import React, { useState, useMemo } from 'react';
import { BarChart3, RotateCcw, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateInvestment } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { GrowthAreaChart } from '../components/charts/GrowthAreaChart';
import { DonutChart } from '../components/charts/DonutChart';

export const InvestmentCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();

  // State
  const [initialInvestment, setInitialInvestment] = useState<number>(1_500_000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(75_000);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(12.0);
  const [investmentDurationYears, setInvestmentDurationYears] = useState<number>(8);

  // Calculation
  const results = useMemo(() => {
    return calculateInvestment(
      initialInvestment,
      monthlyContribution,
      expectedAnnualReturn,
      investmentDurationYears
    );
  }, [initialInvestment, monthlyContribution, expectedAnnualReturn, investmentDurationYears]);

  // Donut chart
  const donutData = useMemo(() => {
    return [
      { name: 'Total Capital Invested', value: results.totalInvested, color: '#3b82f6' },
      { name: 'Estimated Capital Growth', value: results.estimatedGrowth, color: '#10b981' },
    ];
  }, [results]);

  // Plain-English insights
  const insights = useMemo(() => {
    const list: string[] = [];
    list.push(
      `Based on an expected annual return of ${expectedAnnualReturn}%, your estimated future investment value is ${format(results.futureInvestmentValue)}.`
    );
    list.push(
      `Your total invested capital is ${format(results.totalInvested)}, while projected portfolio gains represent ${format(results.estimatedGrowth)}.`
    );
    const growthMultiplier = results.totalInvested > 0 ? (results.futureInvestmentValue / results.totalInvested).toFixed(1) : '1.0';
    list.push(
      `At this estimated trajectory, your capital is projected to grow by ${growthMultiplier}x over ${investmentDurationYears} years.`
    );
    return list;
  }, [results, expectedAnnualReturn, investmentDurationYears, format]);

  const resetDefaults = () => {
    setInitialInvestment(1_500_000);
    setMonthlyContribution(75_000);
    setExpectedAnnualReturn(12.0);
    setInvestmentDurationYears(8);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Investment Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Forecast long-term wealth creation with regular contributions and expected market returns.
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
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Investment Strategy
            </h3>

            {/* Initial Investment */}
            <SliderField
              label="Starting Investment"
              value={initialInvestment}
              onChange={setInitialInvestment}
              min={0}
              max={25_000_000}
              step={50_000}
              prefix={currencyConfig.symbol}
            />

            {/* Monthly Contribution */}
            <SliderField
              label="Monthly Contribution"
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={0}
              max={1_500_000}
              step={5_000}
              prefix={currencyConfig.symbol}
            />

            {/* Expected Annual Return */}
            <SliderField
              label="Expected Annual Return (%)"
              value={expectedAnnualReturn}
              onChange={setExpectedAnnualReturn}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
              helperText="Benchmark: Index funds 10-15%"
            />

            {/* Investment Duration */}
            <SliderField
              label="Investment Duration (Years)"
              value={investmentDurationYears}
              onChange={setInvestmentDurationYears}
              min={1}
              max={40}
              step={1}
              suffix=" yrs"
            />
          </Card>

          {/* Donut Chart */}
          <Card>
            <DonutChart
              data={donutData}
              title="Estimated Value Breakdown"
              height={230}
            />
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Future Portfolio Value"
              value={format(results.futureInvestmentValue)}
              subValue="Estimated final value"
              variant="primary"
            />
            <MetricCard
              label="Total Invested"
              value={format(results.totalInvested)}
              subValue="Your principal"
              variant="info"
            />
            <MetricCard
              label="Estimated Growth"
              value={format(results.estimatedGrowth)}
              subValue="Estimated earnings"
              variant="success"
            />
          </div>

          {/* Insights with prominent disclaimer */}
          <InsightBanner
            insights={insights}
            disclaimer="⚠️ Important: Projections are estimates based on assumed rates of return and compound frequencies. Market returns fluctuate over time and past performance does not guarantee future results."
          />

          {/* Growth Chart */}
          <Card>
            <GrowthAreaChart
              data={results.growthTimeline}
              title="Projected Wealth Trajectory"
              height={320}
              principalLabel="Total Invested"
              interestLabel="Estimated Growth"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
