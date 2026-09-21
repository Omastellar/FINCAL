import React, { useState, useMemo, useEffect } from 'react';
import { Home, ShieldCheck, DollarSign, Calendar, TrendingDown, Download, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateMortgage } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { DonutChart } from '../components/charts/DonutChart';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { WhatIfSlider } from '../components/common/WhatIfSlider';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { exportAmortizationCSV } from '../utils/exportUtils';
import { ExplainableResultData } from '../types/calculators';

export const MortgageCalculator: React.FC = () => {
  const { currency, currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  // Primary Inputs
  const [homePrice, setHomePrice] = useState<number>(() => {
    const val = initialParams.get('price');
    return val ? parseFloat(val) : 45_000_000;
  });
  const [downPayment, setDownPayment] = useState<number>(() => {
    const val = initialParams.get('down');
    return val ? parseFloat(val) : 20;
  });
  const [downPaymentIsPercent, setDownPaymentIsPercent] = useState<boolean>(true);
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 15.0;
  });
  const [loanTermYears, setLoanTermYears] = useState<number>(() => {
    const val = initialParams.get('term');
    return val ? parseFloat(val) : 20;
  });
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState<number>(() => {
    const val = initialParams.get('tax');
    return val ? parseFloat(val) : 450_000;
  });
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(() => {
    const val = initialParams.get('ins');
    return val ? parseFloat(val) : 250_000;
  });
  const [hoaMonthly, setHoaMonthly] = useState<number>(() => {
    const val = initialParams.get('hoa');
    return val ? parseFloat(val) : 35_000;
  });
  const [pmiRate, setPmiRate] = useState<number>(0.8);
  const [closingCostsPct, setClosingCostsPct] = useState<number>(2.5);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);

  useEffect(() => {
    updateUrlParams({
      calc: 'mortgage',
      price: homePrice,
      down: downPayment,
      rate: interestRate,
      term: loanTermYears,
      tax: propertyTaxAnnual,
      ins: homeInsuranceAnnual,
      hoa: hoaMonthly,
    });
  }, [homePrice, downPayment, interestRate, loanTermYears, propertyTaxAnnual, homeInsuranceAnnual, hoaMonthly, updateUrlParams]);

  const results = useMemo(() => {
    return calculateMortgage({
      homePrice,
      downPayment,
      downPaymentIsPercent,
      interestRate,
      loanTermYears,
      propertyTaxAnnual,
      homeInsuranceAnnual,
      hoaMonthly,
      pmiRate,
      closingCostsPct,
      extraMonthlyPayment,
    });
  }, [
    homePrice,
    downPayment,
    downPaymentIsPercent,
    interestRate,
    loanTermYears,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaMonthly,
    pmiRate,
    closingCostsPct,
    extraMonthlyPayment,
  ]);

  const donutData = useMemo(() => {
    return [
      { name: 'Principal & Interest', value: results.principalAndInterest, color: '#10b981' },
      { name: 'Property Tax', value: results.monthlyPropertyTax, color: '#3b82f6' },
      { name: 'Homeowners Insurance', value: results.monthlyHomeInsurance, color: '#f59e0b' },
      { name: 'HOA Fees', value: results.monthlyHOA, color: '#8b5cf6' },
      ...(results.monthlyPMI > 0 ? [{ name: 'PMI (Private Mortgage Ins.)', value: results.monthlyPMI, color: '#ef4444' }] : []),
    ].filter((d) => d.value > 0);
  }, [results]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Mortgage & PITI Analytical Breakdown',
      summary: `Your estimated monthly housing outflow is ${format(results.totalMonthlyPITI)}, comprising ${format(results.principalAndInterest)} for principal and interest debt service, and ${format(results.monthlyPropertyTax + results.monthlyHomeInsurance + results.monthlyHOA + results.monthlyPMI)} for escrow items (taxes, insurance, HOA, and PMI).`,
      keyFigures: [
        { label: 'Total Monthly PITI', value: format(results.totalMonthlyPITI), highlight: true },
        { label: 'Financed Loan Amount', value: format(results.loanAmount) },
        { label: 'Down Payment', value: `${format(results.downPaymentAmount)} (${results.downPaymentPercent.toFixed(1)}%)` },
        { label: 'Upfront Closing Cash', value: format(results.totalCashNeededToClose), hint: 'Down payment + ~2.5% closing costs' },
        { label: 'PMI Cancellation Point', value: results.downPaymentPercent >= 20 ? 'Not Required (>20% down)' : `Month ${results.pmiDropMonth} (at 80% LTV)` },
        { label: 'Extra Payment Term Reduction', value: results.payoffMonthsSaved > 0 ? `${results.payoffMonthsSaved} Months (${(results.payoffMonthsSaved / 12).toFixed(1)} yrs)` : 'None (₦0 extra)' },
      ],
      assumptions: [
        { label: 'Amortization Term', value: `${loanTermYears} Years (${loanTermYears * 12} monthly cycles)` },
        { label: 'Interest Rate Compounding', value: `${interestRate}% fixed annual rate compounded monthly` },
        { label: 'PMI Rule', value: 'Private Mortgage Insurance required when Loan-To-Value (LTV) exceeds 80%' },
        { label: 'Closing Costs Estimate', value: `${closingCostsPct}% of total financed amount` },
      ],
      methodology: 'Standard fixed-rate annuity amortization formula with segregated escrow breakdown and dynamic threshold PMI termination.',
      formulaSteps: [
        {
          name: 'Monthly Principal & Interest (M)',
          formula: 'M = P * [r(1 + r)^n] / [(1 + r)^n - 1]',
          substituted: `${format(results.loanAmount)} * [${(interestRate / 1200).toFixed(5)} * (1 + ${(interestRate / 1200).toFixed(5)})^${loanTermYears * 12}] / ...`,
          result: format(results.principalAndInterest),
          explanation: 'Monthly debt service applied strictly toward reducing outstanding mortgage balance and interest.',
        },
        {
          name: 'Total Monthly PITI Sum',
          formula: 'PITI = M + (Annual Taxes / 12) + (Annual Ins / 12) + HOA + PMI',
          substituted: `${format(results.principalAndInterest)} + ${format(results.monthlyPropertyTax)} + ${format(results.monthlyHomeInsurance)} + ${format(results.monthlyHOA)} + ${format(results.monthlyPMI)}`,
          result: format(results.totalMonthlyPITI),
          explanation: 'Comprehensive monthly outlay required to maintain property occupancy and mortgage compliance.',
        },
      ],
      disclaimers: [
        'Property taxes and HOA dues fluctuate based on local government assessment roll updates and community management levies.',
        'Calculations provide decision support estimates and do not constitute an official loan estimate or lending commitment under financial regulations.',
      ],
    };
  }, [results, loanTermYears, interestRate, closingCostsPct, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Loan Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Institutional Decision Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mortgage & PITI Analysis Platform
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Detailed home financing modeling with Principal, Interest, Taxes, Insurance, and PMI cancellation schedules.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
          <button
            type="button"
            onClick={() => exportAmortizationCSV(results.amortizationSchedule, results.loanAmount, interestRate, currencyConfig.code)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Monthly PITI"
          value={format(results.totalMonthlyPITI)}
          icon={<Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue="Principal + Interest + Taxes + Insurance"
          variant="primary"
        />
        <MetricCard
          label="Principal & Interest"
          value={format(results.principalAndInterest)}
          icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue={`Financed loan: ${format(results.loanAmount)}`}
        />
        <MetricCard
          label="Cash Needed at Closing"
          value={format(results.totalCashNeededToClose)}
          icon={<ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          subValue={`Down (${format(results.downPaymentAmount)}) + Closing Costs`}
        />
        <MetricCard
          label="Total Interest Over Term"
          value={format(results.totalInterestWithExtra)}
          icon={<TrendingDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={results.interestSaved > 0 ? `Saves ${format(results.interestSaved)} with extra payments` : `Across ${loanTermYears} years`}
        />
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Property & Financing Parameters
            </h2>

            <div className="space-y-5">
              <SliderField
                label="Home Purchase Price"
                value={homePrice}
                onChange={setHomePrice}
                min={5_000_000}
                max={250_000_000}
                step={500_000}
                prefix={currencyConfig.symbol}
              />

              {/* Down payment with percent toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                  <label>Down Payment</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDownPaymentIsPercent(true)}
                      className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                        downPaymentIsPercent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDownPaymentIsPercent(false)}
                      className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                        !downPaymentIsPercent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {currencyConfig.symbol}
                    </button>
                  </div>
                </div>
                <SliderField
                  label={downPaymentIsPercent ? 'Down Payment (%)' : 'Down Payment Cash'}
                  value={downPayment}
                  onChange={setDownPayment}
                  min={downPaymentIsPercent ? 0 : 0}
                  max={downPaymentIsPercent ? 50 : homePrice * 0.5}
                  step={downPaymentIsPercent ? 1 : 250_000}
                  suffix={downPaymentIsPercent ? '%' : ''}
                  prefix={!downPaymentIsPercent ? currencyConfig.symbol : ''}
                  helperText={`${format(results.downPaymentAmount)} (${results.downPaymentPercent.toFixed(1)}%)`}
                />
              </div>

              <SliderField
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                min={1}
                max={30}
                step={0.25}
                suffix="%"
              />

              {/* Loan Term Quick Selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mortgage Term
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 20, 30].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanTermYears(term)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                        loanTermYears === term
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {term} Years
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Taxes, Insurance & Escrow
                </h3>
                <SliderField
                  label="Annual Property Tax"
                  value={propertyTaxAnnual}
                  onChange={setPropertyTaxAnnual}
                  min={0}
                  max={5_000_000}
                  step={50_000}
                  prefix={currencyConfig.symbol}
                />
                <SliderField
                  label="Annual Homeowners Insurance"
                  value={homeInsuranceAnnual}
                  onChange={setHomeInsuranceAnnual}
                  min={0}
                  max={2_000_000}
                  step={25_000}
                  prefix={currencyConfig.symbol}
                />
                <SliderField
                  label="Monthly HOA / Service Charge"
                  value={hoaMonthly}
                  onChange={setHoaMonthly}
                  min={0}
                  max={500_000}
                  step={5_000}
                  prefix={currencyConfig.symbol}
                />
              </div>
            </div>
          </Card>

          {/* What-If Extra Prepayment Sensitivity Slider */}
          <WhatIfSlider
            label="What-If: Extra Monthly Payment"
            value={extraMonthlyPayment}
            min={0}
            max={250_000}
            step={5_000}
            prefix={currencyConfig.symbol}
            suffix="/mo"
            baselineValue={0}
            impactSummary={
              results.payoffMonthsSaved > 0
                ? `Pay off ${(results.payoffMonthsSaved / 12).toFixed(1)} years earlier & save ${format(results.interestSaved)} in interest`
                : undefined
            }
            impactPositive={true}
            onChange={setExtraMonthlyPayment}
            helperText="Accelerates debt payoff directly against remaining principal."
          />
        </div>

        {/* Charts & Analytical Breakdown Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Monthly PITI Payment Composition
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Visual allocation of monthly debt service vs tax and insurance reserves.
            </p>

            <div className="h-64 sm:h-72">
              <DonutChart
                data={donutData}
                title="Monthly Breakdown"
              />
            </div>

            {/* PITI Summary Breakdown table */}
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Principal & Interest</span>
                <span className="font-semibold text-slate-900 dark:text-white">{format(results.principalAndInterest)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Property Taxes</span>
                <span className="font-semibold text-slate-900 dark:text-white">{format(results.monthlyPropertyTax)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Homeowners Insurance</span>
                <span className="font-semibold text-slate-900 dark:text-white">{format(results.monthlyHomeInsurance)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Monthly HOA / Maintenance</span>
                <span className="font-semibold text-slate-900 dark:text-white">{format(results.monthlyHOA)}</span>
              </div>
              {results.monthlyPMI > 0 && (
                <div className="py-2 flex justify-between text-red-600 dark:text-red-400 font-semibold">
                  <span>PMI (LTV &gt; 80%)</span>
                  <span>{format(results.monthlyPMI)}</span>
                </div>
              )}
            </div>

            {/* PMI Notice if applicable */}
            {results.downPaymentPercent < 20 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">PMI Active:</span>
                  Down payment is below 20%. PMI terminates around Month {results.pmiDropMonth} when remaining balance drops below {format(homePrice * 0.8)}.
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Explainable Result: Formulas, Assumptions & Disclaimers */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
