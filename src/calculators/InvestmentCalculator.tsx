import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateInvestment } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { GrowthAreaChart } from '../components/charts/GrowthAreaChart';
import { DonutChart } from '../components/charts/DonutChart';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';

export const InvestmentCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  // State
  const [initialInvestment, setInitialInvestment] = useState<number>(() => {
    const val = initialParams.get('initial');
    return val ? parseFloat(val) : 0;
  });
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => {
    const val = initialParams.get('monthly');
    return val ? parseFloat(val) : 0;
  });
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(() => {
    const val = initialParams.get('returnRate');
    return val ? parseFloat(val) : 0;
  });
  const [investmentDurationYears, setInvestmentDurationYears] = useState<number>(() => {
    const val = initialParams.get('duration');
    return val ? parseFloat(val) : 0;
  });

  // Inflation State
  const [adjustInflation, setAdjustInflation] = useState<boolean>(() => {
    return initialParams.get('inflation') !== null && initialParams.get('inflation') !== '0';
  });
  const [inflationRate, setInflationRate] = useState<number>(() => {
    const val = initialParams.get('inflationRate');
    return val ? parseFloat(val) : 0;
  });

  // Sync state to URL
  useEffect(() => {
    updateUrlParams({
      calc: 'investment',
      initial: initialInvestment,
      monthly: monthlyContribution,
      returnRate: expectedAnnualReturn,
      duration: investmentDurationYears,
      inflation: adjustInflation ? '1' : '',
      inflationRate: adjustInflation ? inflationRate : '',
    });
  }, [
    initialInvestment,
    monthlyContribution,
    expectedAnnualReturn,
    investmentDurationYears,
    adjustInflation,
    inflationRate,
    updateUrlParams,
  ]);

  // Calculation
  const results = useMemo(() => {
    return calculateInvestment(
      initialInvestment,
      monthlyContribution,
      expectedAnnualReturn,
      investmentDurationYears,
      adjustInflation ? inflationRate : 0
    );
  }, [
    initialInvestment,
    monthlyContribution,
    expectedAnnualReturn,
    investmentDurationYears,
    adjustInflation,
    inflationRate,
  ]);

  const finalRealPower = useMemo(() => {
    if (!adjustInflation) return results.futureInvestmentValue;
    const lastPoint = results.growthTimeline[results.growthTimeline.length - 1];
    return lastPoint?.realPurchasingPower ?? results.futureInvestmentValue;
  }, [results, adjustInflation]);

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
      `Based on an expected annual return of ${expectedAnnualReturn}%, your estimated future nominal investment value is ${format(results.futureInvestmentValue)}.`
    );
    list.push(
      `Your total invested capital is ${format(results.totalInvested)}, while projected portfolio gains represent ${format(results.estimatedGrowth)}.`
    );
    if (adjustInflation && inflationRate > 0) {
      list.push(
        `Inflation Outlook: Assuming ${inflationRate}% average inflation, your estimated real purchasing power will equal ${format(finalRealPower)} in today's money.`
      );
    }
    return list;
  }, [results, expectedAnnualReturn, adjustInflation, inflationRate, finalRealPower, format]);

  const resetDefaults = () => {
    setInitialInvestment(0);
    setMonthlyContribution(0);
    setExpectedAnnualReturn(0);
    setInvestmentDurationYears(0);
    setAdjustInflation(false);
    setInflationRate(0);
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
            Forecast long-term wealth creation with regular contributions, expected market returns, and inflation discounts.
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
              min={0}
              max={40}
              step={1}
              suffix=" yrs"
            />
          </Card>

          {/* Inflation Adjuster Card */}
          <Card className="space-y-4 bg-gradient-to-b from-white to-amber-50/20 dark:from-slate-900 dark:to-amber-950/10 border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Inflation Adjustment
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adjustInflation}
                  onChange={(e) => setAdjustInflation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            {adjustInflation && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <SliderField
                  label="Assumed Annual Inflation Rate (%)"
                  value={inflationRate}
                  onChange={setInflationRate}
                  min={1}
                  max={25}
                  step={0.5}
                  suffix="%"
                  helperText="Calculates real purchasing power"
                />
              </div>
            )}
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
              subValue={`After ${investmentDurationYears} years`}
              variant="primary"
            />
            <MetricCard
              label="Total Invested"
              value={format(results.totalInvested)}
              subValue="Your principal"
              variant="info"
            />
            {adjustInflation ? (
              <MetricCard
                label="Real Purchasing Power"
                value={format(finalRealPower)}
                subValue={`Discounted at ${inflationRate}% inflation`}
                variant="warning"
              />
            ) : (
              <MetricCard
                label="Estimated Growth"
                value={format(results.estimatedGrowth)}
                subValue="Estimated earnings"
                variant="success"
              />
            )}
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
              showInflation={adjustInflation}
              inflationLabel={`Real Power (${inflationRate}% Inflation)`}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
