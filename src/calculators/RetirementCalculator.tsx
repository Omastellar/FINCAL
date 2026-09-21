import React, { useState, useMemo, useEffect } from 'react';
import { UserCheck, ShieldAlert, TrendingUp, DollarSign, Calendar, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateRetirement } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { GrowthAreaChart } from '../components/charts/GrowthAreaChart';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { ExplainableResultData } from '../types/calculators';

export const RetirementCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  const [currentAge, setCurrentAge] = useState<number>(() => {
    const val = initialParams.get('age');
    return val ? parseInt(val, 10) : 32;
  });
  const [retirementAge, setRetirementAge] = useState<number>(() => {
    const val = initialParams.get('retAge');
    return val ? parseInt(val, 10) : 60;
  });
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [currentNestEgg, setCurrentNestEgg] = useState<number>(() => {
    const val = initialParams.get('nest');
    return val ? parseFloat(val) : 5_000_000;
  });
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => {
    const val = initialParams.get('contrib');
    return val ? parseFloat(val) : 150_000;
  });
  const [expectedAnnualReturnPre, setExpectedAnnualReturnPre] = useState<number>(10.0);
  const [expectedAnnualReturnPost, setExpectedAnnualReturnPost] = useState<number>(6.0);
  const [desiredMonthlyRetirementIncome, setDesiredMonthlyRetirementIncome] = useState<number>(() => {
    const val = initialParams.get('income');
    return val ? parseFloat(val) : 800_000;
  });
  const [inflationRate, setInflationRate] = useState<number>(4.0);
  const [pensionOrSocialSecurityMonthly, setPensionOrSocialSecurityMonthly] = useState<number>(100_000);

  useEffect(() => {
    updateUrlParams({
      calc: 'retirement',
      age: currentAge,
      retAge: retirementAge,
      nest: currentNestEgg,
      contrib: monthlyContribution,
      income: desiredMonthlyRetirementIncome,
    });
  }, [currentAge, retirementAge, currentNestEgg, monthlyContribution, desiredMonthlyRetirementIncome, updateUrlParams]);

  const results = useMemo(() => {
    return calculateRetirement({
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentNestEgg,
      monthlyContribution,
      expectedAnnualReturnPre,
      expectedAnnualReturnPost,
      desiredMonthlyRetirementIncome,
      inflationRate,
      pensionOrSocialSecurityMonthly,
    });
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentNestEgg,
    monthlyContribution,
    expectedAnnualReturnPre,
    expectedAnnualReturnPost,
    desiredMonthlyRetirementIncome,
    inflationRate,
    pensionOrSocialSecurityMonthly,
  ]);

  const chartData = useMemo(() => {
    return results.timeline.map((point) => ({
      year: point.age,
      totalBalance: point.balance,
      principalInvested: point.contributions,
      totalInterest: Math.max(0, point.balance - point.contributions),
    }));
  }, [results]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Retirement Readiness & Nest Egg Underwriting',
      summary: `At current savings rates of ${format(monthlyContribution)}/month and expected returns, your projected capital at age ${retirementAge} will reach ${format(results.nestEggAtRetirement)}. To sustain your lifestyle of ${format(desiredMonthlyRetirementIncome)}/month (inflation-adjusted) across ${results.yearsInRetirement} years in retirement, your required capital is ${format(results.totalRequiredNestEgg)}. ${
        results.isOnTrack
          ? 'You are on track to fully fund your retirement!'
          : `You face a projected capital gap of ${format(Math.abs(results.totalFundingSurplusOrDeficit))}.`
      }`,
      keyFigures: [
        { label: 'Projected Capital at Retirement', value: format(results.nestEggAtRetirement), highlight: true },
        { label: 'Required Target Nest Egg', value: format(results.totalRequiredNestEgg) },
        { label: 'Retirement Funding Status', value: results.isOnTrack ? 'Fully Funded' : 'Funding Shortfall', hint: results.isOnTrack ? 'Surplus buffer' : 'Action recommended' },
        { label: 'Capital Gap / Surplus', value: `${results.totalFundingSurplusOrDeficit >= 0 ? '+' : ''}${format(results.totalFundingSurplusOrDeficit)}` },
        { label: 'Recommended Monthly Contribution', value: format(results.requiredMonthlySavings), highlight: !results.isOnTrack },
        { label: 'Years in Retirement', value: `${results.yearsInRetirement} Years (Age ${retirementAge} to ${lifeExpectancy})` },
      ],
      assumptions: [
        { label: 'Pre-Retirement Accumulation Return', value: `${expectedAnnualReturnPre}% annual return compounded monthly` },
        { label: 'Post-Retirement Preservation Return', value: `${expectedAnnualReturnPost}% annual return during drawdown` },
        { label: 'Annual Inflation Rate', value: `${inflationRate}% expected annual inflation adjustment` },
        { label: 'Guaranteed Pension / Annuity Offset', value: `${format(pensionOrSocialSecurityMonthly)} monthly` },
      ],
      methodology: 'Two-phase financial lifecycle model: compound accumulation stage followed by present-value actuarial drawdown stage.',
      formulaSteps: [
        {
          name: 'Required Retirement Nest Egg (PV of Drawdown)',
          formula: 'PV = Net Drawdown * [1 - (1 + r_post)^-n] / r_post',
          substituted: `[${format(desiredMonthlyRetirementIncome)} (adjusted for inflation) - ${format(pensionOrSocialSecurityMonthly)}] * ...`,
          result: format(results.totalRequiredNestEgg),
          explanation: 'Calculates the lump sum required on retirement day to fund all subsequent living withdrawals until life expectancy.',
        },
      ],
      disclaimers: [
        'Healthcare and long-term care costs frequently accelerate during later retirement years and may require dedicated insurance coverage.',
        'Market volatility around retirement age (sequence-of-returns risk) can materially affect drawdown sustainability.',
      ],
    };
  }, [
    results,
    retirementAge,
    desiredMonthlyRetirementIncome,
    monthlyContribution,
    expectedAnnualReturnPre,
    expectedAnnualReturnPost,
    inflationRate,
    pensionOrSocialSecurityMonthly,
    lifeExpectancy,
    format,
  ]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Savings & Investment Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Wealth Horizon Modeling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Retirement & Nest Egg Planner
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Project retirement capital, account for pension/annuity offsets, and test funding sufficiency against inflation.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Projected Nest Egg"
          value={format(results.nestEggAtRetirement)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue={`At age ${retirementAge}`}
          variant="primary"
        />
        <MetricCard
          label="Required Capital"
          value={format(results.totalRequiredNestEgg)}
          icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue={`For ${results.yearsInRetirement} yrs of retirement`}
        />
        <MetricCard
          label="Retirement Status"
          value={results.isOnTrack ? 'Fully Funded' : 'Funding Deficit'}
          icon={
            results.isOnTrack ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )
          }
          subValue={
            results.isOnTrack
              ? `Surplus of ${format(results.totalFundingSurplusOrDeficit)}`
              : `Gap of ${format(Math.abs(results.totalFundingSurplusOrDeficit))}`
          }
        />
        <MetricCard
          label="Recommended Monthly Savings"
          value={format(results.requiredMonthlySavings)}
          icon={<Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={
            results.isOnTrack
              ? 'Current savings are sufficient'
              : `Increase by ${format(results.monthlyFundingGap)}/mo`
          }
        />
      </div>

      {/* Inputs & Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Ages & Timeline
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <SliderField
                  label="Current Age"
                  value={currentAge}
                  onChange={setCurrentAge}
                  min={18}
                  max={75}
                  step={1}
                  suffix=" yrs"
                />
                <SliderField
                  label="Retirement Age"
                  value={retirementAge}
                  onChange={setRetirementAge}
                  min={currentAge + 1}
                  max={80}
                  step={1}
                  suffix=" yrs"
                />
              </div>

              <SliderField
                label="Life Expectancy"
                value={lifeExpectancy}
                onChange={setLifeExpectancy}
                min={retirementAge + 1}
                max={100}
                step={1}
                suffix=" yrs"
              />

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <SliderField
                  label="Current Retirement Savings Balance"
                  value={currentNestEgg}
                  onChange={setCurrentNestEgg}
                  min={0}
                  max={100_000_000}
                  step={500_000}
                  prefix={currencyConfig.symbol}
                />

                <SliderField
                  label="Monthly Contribution"
                  value={monthlyContribution}
                  onChange={setMonthlyContribution}
                  min={0}
                  max={2_000_000}
                  step={10_000}
                  prefix={currencyConfig.symbol}
                />

                <SliderField
                  label="Desired Monthly Retirement Income (Today's Value)"
                  value={desiredMonthlyRetirementIncome}
                  onChange={setDesiredMonthlyRetirementIncome}
                  min={100_000}
                  max={5_000_000}
                  step={50_000}
                  prefix={currencyConfig.symbol}
                />

                <SliderField
                  label="Pension / Social Security Monthly Offset"
                  value={pensionOrSocialSecurityMonthly}
                  onChange={setPensionOrSocialSecurityMonthly}
                  min={0}
                  max={2_000_000}
                  step={25_000}
                  prefix={currencyConfig.symbol}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Wealth Curve Visualization */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Wealth Accumulation & Drawdown Trajectory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Projected account balance trajectory from age {currentAge} to age {lifeExpectancy}.
            </p>

            <div className="h-64 sm:h-72">
              <GrowthAreaChart
                data={chartData}
                principalLabel="Contributions"
                interestLabel="Compound Growth"
                height={260}
              />
            </div>

            {/* Strategy advice badge */}
            <div
              className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
                results.isOnTrack
                  ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300'
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5">
                {results.isOnTrack ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                <span>{results.isOnTrack ? 'Retirement Readiness Target Met' : 'Strategic Catch-Up Recommended'}</span>
              </div>
              <p>
                {results.isOnTrack
                  ? `Your accumulated wealth will safely sustain withdrawals of ${format(desiredMonthlyRetirementIncome)}/month throughout retirement without depleting your capital.`
                  : `Increasing your monthly contribution from ${format(monthlyContribution)} to ${format(results.requiredMonthlySavings)} (an extra ${format(results.monthlyFundingGap)}/mo) will bridge the gap before age ${retirementAge}.`}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
