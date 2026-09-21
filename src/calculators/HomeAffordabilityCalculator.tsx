import React, { useState, useMemo, useEffect } from 'react';
import { Home, Compass, AlertCircle, ArrowUpRight, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateHomeAffordability } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { ExplainableResultData } from '../types/calculators';

export const HomeAffordabilityCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  const [annualGrossIncome, setAnnualGrossIncome] = useState<number>(() => {
    const val = initialParams.get('income');
    return val ? parseFloat(val) : 0;
  });
  const [monthlyDebts, setMonthlyDebts] = useState<number>(() => {
    const val = initialParams.get('debts');
    return val ? parseFloat(val) : 0;
  });
  const [downPaymentSaved, setDownPaymentSaved] = useState<number>(() => {
    const val = initialParams.get('saved');
    return val ? parseFloat(val) : 0;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 0;
  });
  const [loanTermYears, setLoanTermYears] = useState<number>(() => {
    const val = initialParams.get('term');
    return val ? parseFloat(val) : 0;
  });
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(0);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(0);

  useEffect(() => {
    updateUrlParams({
      calc: 'home-affordability',
      income: annualGrossIncome,
      debts: monthlyDebts,
      saved: downPaymentSaved,
      rate: interestRate,
      term: loanTermYears,
    });
  }, [annualGrossIncome, monthlyDebts, downPaymentSaved, interestRate, loanTermYears, updateUrlParams]);

  const results = useMemo(() => {
    return calculateHomeAffordability({
      annualGrossIncome,
      monthlyDebts,
      downPaymentSaved,
      interestRate,
      loanTermYears,
      propertyTaxRate,
      homeInsuranceAnnual,
      targetFrontEndDti: 28,
      targetBackEndDti: 36,
    });
  }, [annualGrossIncome, monthlyDebts, downPaymentSaved, interestRate, loanTermYears, propertyTaxRate, homeInsuranceAnnual]);

  const monthlyGrossIncome = annualGrossIncome / 12;

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Home Affordability & Underwriting Diagnostic',
      summary: `Based on an annual gross income of ${format(annualGrossIncome)} (${format(monthlyGrossIncome)}/mo) and recurring monthly debt of ${format(monthlyDebts)}, your recommended maximum home purchase price is ${format(results.maxHomePurchasePrice)}, requiring a maximum monthly housing outlay of ${format(results.maxMonthlyPayment)}.`,
      keyFigures: [
        { label: 'Recommended Home Budget', value: format(results.maxHomePurchasePrice), highlight: true },
        { label: 'Max Financing (Loan)', value: format(results.maxLoanAmount) },
        { label: 'Max Monthly Housing', value: format(results.maxMonthlyPayment) },
        { label: 'Underwriting Constraint', value: results.limitingFactor === 'front-end' ? 'Front-End (28% of Income)' : 'Back-End (Debt Burden)' },
        { label: 'Conservative Target (28/36)', value: format(results.conservativePrice) },
        { label: 'Moderate Stretch (31/43)', value: format(results.moderatePrice) },
        { label: 'Aggressive Ceiling (36/45)', value: format(results.aggressivePrice) },
      ],
      assumptions: [
        { label: 'Front-End DTI Benchmark', value: '28% of gross monthly income allocated to housing' },
        { label: 'Back-End DTI Benchmark', value: '36% total debt-to-income (Housing + Existing monthly debt)' },
        { label: 'Down Payment Applied', value: format(downPaymentSaved) },
        { label: 'Loan Term & Interest', value: `${loanTermYears} Years at ${interestRate}% per annum` },
      ],
      methodology: 'Simultaneous constraint optimization testing front-end housing ceiling vs back-end debt limit and back-solving principal capacity.',
      formulaSteps: [
        {
          name: 'Front-End Housing Limit (28%)',
          formula: 'Limit = Gross Monthly Income * 0.28',
          substituted: `${format(monthlyGrossIncome)} * 0.28`,
          result: format(monthlyGrossIncome * 0.28),
          explanation: 'Maximum monthly payment allowable strictly from gross monthly earnings.',
        },
        {
          name: 'Back-End Available Housing (36%)',
          formula: 'Available = (Gross Monthly Income * 0.36) - Monthly Debts',
          substituted: `(${format(monthlyGrossIncome)} * 0.36) - ${format(monthlyDebts)}`,
          result: format(Math.max(0, monthlyGrossIncome * 0.36 - monthlyDebts)),
          explanation: 'Net monthly capacity remaining after satisfying non-mortgage obligations (auto, credit cards, personal loans).',
        },
      ],
      disclaimers: [
        'Affordability figures represent theoretical purchasing capacity and do not account for closing costs, moving expenses, or maintenance reserves.',
        'Lenders evaluate credit score, employment tenure, and bank reserve months in addition to debt-to-income benchmarks.',
      ],
    };
  }, [results, annualGrossIncome, monthlyGrossIncome, monthlyDebts, downPaymentSaved, loanTermYears, interestRate, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Loan Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Institutional Decision Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Home Affordability Calculator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Determine your realistic purchase budget using institutional 28/36 front-end and back-end debt guidelines.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Recommended Purchase Price"
          value={format(results.maxHomePurchasePrice)}
          icon={<Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue={`With ${format(downPaymentSaved)} down`}
          variant="primary"
        />
        <MetricCard
          label="Max Monthly Housing"
          value={format(results.maxMonthlyPayment)}
          icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue="Principal + Interest + Taxes + Ins"
        />
        <MetricCard
          label="Max Mortgage Financing"
          value={format(results.maxLoanAmount)}
          icon={<ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={`${loanTermYears} years @ ${interestRate}%`}
        />
        <MetricCard
          label="Primary Constraint"
          value={results.limitingFactor === 'front-end' ? '28% Income' : 'Existing Debts'}
          icon={<Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          subValue={results.limitingFactor === 'front-end' ? 'Gross income limit' : 'Back-end debt limit'}
        />
      </div>

      {/* Main Layout: Inputs vs Decision Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Income & Debt Profile
            </h2>
            <div className="space-y-5">
              <SliderField
                label="Annual Gross Household Income"
                value={annualGrossIncome}
                onChange={setAnnualGrossIncome}
                min={0}
                max={150_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
                helperText={`${format(monthlyGrossIncome)} / month`}
              />

              <SliderField
                label="Monthly Debt Obligations (Auto, Cards, Loans)"
                value={monthlyDebts}
                onChange={setMonthlyDebts}
                min={0}
                max={5_000_000}
                step={10_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Cash Saved for Down Payment"
                value={downPaymentSaved}
                onChange={setDownPaymentSaved}
                min={0}
                max={50_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Expected Mortgage Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                min={0}
                max={30}
                step={0.25}
                suffix="%"
              />

              <SliderField
                label="Loan Term"
                value={loanTermYears}
                onChange={setLoanTermYears}
                min={0}
                max={30}
                step={1}
                suffix=" Years"
              />
            </div>
          </Card>
        </div>

        {/* Decision Tiers Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Affordability Risk Tiers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Lenders categorize purchasing capacity by risk tolerances and debt-to-income bandwidths.
            </p>

            <div className="space-y-4">
              {/* Conservative */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Conservative (28/36 DTI) — Recommended
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {format(results.conservativePrice)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Leaves ample financial buffer for savings, family emergencies, and retirement investments.
                </p>
              </div>

              {/* Moderate */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                    Moderate Stretch (31/43 DTI)
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {format(results.moderatePrice)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Standard upper underwriting ceiling for most prime institutional mortgage programs.
                </p>
              </div>

              {/* Aggressive */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Aggressive Ceiling (36/45 DTI)
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {format(results.aggressivePrice)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  High monthly housing burden. May produce financial stress if living costs rise or income drops.
                </p>
              </div>
            </div>

            {/* Estimated monthly housing breakdown at recommended price */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">
                Estimated Monthly Outflow at {format(results.maxHomePurchasePrice)}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500 block">P & I</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {format(results.breakdown.principalAndInterest)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500 block">Taxes</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {format(results.breakdown.taxes)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500 block">Insurance</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {format(results.breakdown.insurance)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
