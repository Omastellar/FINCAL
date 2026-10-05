import React, { useState, useMemo, useEffect } from 'react';
import { PiggyBank, RotateCcw, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateSavingsGrowth } from '../utils/financialMath';
import { ContributionFrequency } from '../types/calculators';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { GrowthAreaChart } from '../components/charts/GrowthAreaChart';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';

export const SavingsCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  // State
  const [initialDeposit, setInitialDeposit] = useState<number>(() => {
    const val = initialParams.get('initial');
    return val ? parseFloat(val) : 0;
  });
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => {
    const val = initialParams.get('monthly');
    return val ? parseFloat(val) : 0;
  });
  const [contributionFrequency, setContributionFrequency] = useState<ContributionFrequency>(() => {
    const val = initialParams.get('c_freq') as ContributionFrequency;
    return val === 'quarterly' || val === 'yearly' || val === 'annually' ? val : 'monthly';
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 0;
  });
  const [termUnit, setTermUnit] = useState<'months' | 'years'>(() => {
    const unit = initialParams.get('termUnit');
    return unit === 'years' ? 'years' : 'months';
  });
  const [savingsPeriodMonths, setSavingsPeriodMonths] = useState<number>(() => {
    const m = initialParams.get('months');
    if (m) return parseInt(m, 10);
    const y = initialParams.get('years');
    if (y) return Math.round(parseFloat(y) * 12);
    return 0;
  });
  const [savingsPeriodYears, setSavingsPeriodYears] = useState<number>(() => {
    const y = initialParams.get('years');
    if (y) return parseFloat(y);
    const m = initialParams.get('months');
    if (m) return parseFloat((parseInt(m, 10) / 12).toFixed(2));
    return 0;
  });

  const handleMonthsChange = (months: number) => {
    setSavingsPeriodMonths(months);
    setSavingsPeriodYears(months > 0 ? parseFloat((months / 12).toFixed(2)) : 0);
  };

  const handleYearsChange = (years: number) => {
    setSavingsPeriodYears(years);
    setSavingsPeriodMonths(years > 0 ? Math.round(years * 12) : 0);
  };

  const effectiveTermYears = termUnit === 'months'
    ? (savingsPeriodMonths > 0 ? savingsPeriodMonths / 12 : 0)
    : savingsPeriodYears;

  const [compoundingFrequency, setCompoundingFrequency] = useState<'monthly' | 'quarterly' | 'annually'>(() => {
    const val = initialParams.get('freq') as 'monthly' | 'quarterly' | 'annually';
    return val === 'quarterly' || val === 'annually' ? val : 'monthly';
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
      calc: 'savings',
      initial: initialDeposit,
      monthly: monthlyContribution,
      c_freq: contributionFrequency,
      rate: interestRate,
      years: savingsPeriodYears,
      months: savingsPeriodMonths,
      termUnit: termUnit,
      freq: compoundingFrequency,
      inflation: adjustInflation ? '1' : '',
      inflationRate: adjustInflation ? inflationRate : '',
    });
  }, [
    initialDeposit,
    monthlyContribution,
    contributionFrequency,
    interestRate,
    savingsPeriodYears,
    savingsPeriodMonths,
    termUnit,
    compoundingFrequency,
    adjustInflation,
    inflationRate,
    updateUrlParams,
  ]);

  // Calculation
  const results = useMemo(() => {
    return calculateSavingsGrowth(
      initialDeposit,
      monthlyContribution,
      interestRate,
      effectiveTermYears,
      compoundingFrequency,
      adjustInflation ? inflationRate : 0,
      contributionFrequency
    );
  }, [
    initialDeposit,
    monthlyContribution,
    interestRate,
    effectiveTermYears,
    compoundingFrequency,
    adjustInflation,
    inflationRate,
    contributionFrequency,
  ]);

  // Final point real value
  const finalRealPower = useMemo(() => {
    if (!adjustInflation) return results.finalBalance;
    const lastPoint = results.growthTimeline[results.growthTimeline.length - 1];
    return lastPoint?.realPurchasingPower ?? results.finalBalance;
  }, [results, adjustInflation]);

  // Plain-English insights
  const insights = useMemo(() => {
    const list: string[] = [];
    const durationLabel = savingsPeriodMonths > 0
      ? `${savingsPeriodMonths} months (${effectiveTermYears.toFixed(1)} years)`
      : `${savingsPeriodYears} years`;
    list.push(
      `In ${durationLabel}, your estimated total savings balance will reach ${format(results.finalBalance)}.`
    );
    list.push(
      `Your total deposits equal ${format(results.totalContributions)}, generating ${format(results.interestEarned)} in earned interest.`
    );
    if (adjustInflation && inflationRate > 0) {
      list.push(
        `Inflation-Adjusted: Accounting for ${inflationRate}% annual inflation, your ${format(results.finalBalance)} will have the equivalent purchasing power of ${format(finalRealPower)} in today's money.`
      );
    }
    return list;
  }, [results, savingsPeriodMonths, savingsPeriodYears, effectiveTermYears, adjustInflation, inflationRate, finalRealPower, format]);

  const resetDefaults = () => {
    setInitialDeposit(0);
    setMonthlyContribution(0);
    setContributionFrequency('monthly');
    setInterestRate(0);
    setSavingsPeriodMonths(0);
    setSavingsPeriodYears(0);
    setTermUnit('months');
    setCompoundingFrequency('monthly');
    setAdjustInflation(false);
    setInflationRate(0);
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
            Project your savings growth over time with initial funds, recurring contributions, and optional inflation adjustments.
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

            {/* Contribution Amount */}
            <SliderField
              label={`${contributionFrequency === 'quarterly' ? 'Quarterly' : contributionFrequency === 'yearly' || contributionFrequency === 'annually' ? 'Yearly' : 'Monthly'} Contribution`}
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={0}
              max={1_000_000}
              step={5_000}
              prefix={currencyConfig.symbol}
            />

            {/* Contribution Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contribution Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['monthly', 'quarterly', 'yearly'] as const).map((freq) => (
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
              max={30}
              step={0.25}
              suffix="%"
              helperText="0% supported"
            />

            {/* Savings Duration Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Savings Duration
                </label>
                <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setTermUnit('months')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      termUnit === 'months'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Months
                  </button>
                  <button
                    type="button"
                    onClick={() => setTermUnit('years')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      termUnit === 'years'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Years
                  </button>
                </div>
              </div>

              {/* Quick Months Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setTermUnit('months');
                      handleMonthsChange(m);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      savingsPeriodMonths === m
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {m} Mo
                  </button>
                ))}
              </div>

              {termUnit === 'months' ? (
                <SliderField
                  label="Duration in Months"
                  value={savingsPeriodMonths}
                  onChange={handleMonthsChange}
                  min={0}
                  max={360}
                  step={1}
                  suffix=" mo"
                  helperText={savingsPeriodMonths > 0 ? `${(savingsPeriodMonths / 12).toFixed(1)} years` : undefined}
                />
              ) : (
                <SliderField
                  label="Duration in Years"
                  value={savingsPeriodYears}
                  onChange={handleYearsChange}
                  min={0}
                  max={30}
                  step={0.5}
                  suffix=" yrs"
                  helperText={savingsPeriodYears > 0 ? `${Math.round(savingsPeriodYears * 12)} months` : undefined}
                />
              )}
            </div>

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
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Final Nominal Balance"
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
            {adjustInflation ? (
              <MetricCard
                label="Real Purchasing Power"
                value={format(finalRealPower)}
                subValue={`Discounted at ${inflationRate}% inflation`}
                variant="warning"
              />
            ) : (
              <MetricCard
                label="Interest Earned"
                value={format(results.interestEarned)}
                subValue="From compounding"
                variant="success"
              />
            )}
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
              showInflation={adjustInflation}
              inflationLabel={`Real Power (${inflationRate}% Inflation)`}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
