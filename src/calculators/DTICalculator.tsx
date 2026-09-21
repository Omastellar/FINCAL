import React, { useState, useMemo, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, DollarSign, Home, CreditCard } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateDTI } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { ExplainableResultData } from '../types/calculators';

export const DTICalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState<number>(() => {
    const val = initialParams.get('income');
    return val ? parseFloat(val) : 0;
  });
  const [monthlyMortgageOrRent, setMonthlyMortgageOrRent] = useState<number>(() => {
    const val = initialParams.get('housing');
    return val ? parseFloat(val) : 0;
  });
  const [propertyTaxMonthly, setPropertyTaxMonthly] = useState<number>(0);
  const [homeInsuranceMonthly, setHomeInsuranceMonthly] = useState<number>(0);
  const [autoLoanMonthly, setAutoLoanMonthly] = useState<number>(0);
  const [studentLoanMonthly, setStudentLoanMonthly] = useState<number>(0);
  const [creditCardMinMonthly, setCreditCardMinMonthly] = useState<number>(0);
  const [otherDebtMonthly, setOtherDebtMonthly] = useState<number>(0);

  useEffect(() => {
    updateUrlParams({
      calc: 'dti',
      income: grossMonthlyIncome,
      housing: monthlyMortgageOrRent,
    });
  }, [grossMonthlyIncome, monthlyMortgageOrRent, updateUrlParams]);

  const results = useMemo(() => {
    return calculateDTI({
      grossMonthlyIncome,
      monthlyMortgageOrRent,
      propertyTaxMonthly,
      homeInsuranceMonthly,
      autoLoanMonthly,
      studentLoanMonthly,
      creditCardMinMonthly,
      otherDebtMonthly,
    });
  }, [
    grossMonthlyIncome,
    monthlyMortgageOrRent,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    autoLoanMonthly,
    studentLoanMonthly,
    creditCardMinMonthly,
    otherDebtMonthly,
  ]);

  const getStatusBadge = () => {
    switch (results.status) {
      case 'healthy':
        return {
          title: 'Prime Tier (Healthy Debt Ratio)',
          color: 'bg-emerald-500 text-white',
          bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900',
          text: 'text-emerald-900 dark:text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        };
      case 'moderate':
        return {
          title: 'Moderate Tier (Acceptable but Tight)',
          color: 'bg-amber-500 text-white',
          bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900',
          text: 'text-amber-900 dark:text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        };
      case 'high':
      default:
        return {
          title: 'High Risk Tier (Exceeds Standard Limits)',
          color: 'bg-red-500 text-white',
          bg: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900',
          text: 'text-red-900 dark:text-red-300',
          icon: <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />,
        };
    }
  };

  const statusInfo = getStatusBadge();

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Debt-to-Income Underwriting Analysis',
      summary: `Your Back-End DTI ratio is ${results.backEndDTI.toFixed(1)}% (Front-End Housing is ${results.frontEndDTI.toFixed(1)}%). Across your monthly gross income of ${format(grossMonthlyIncome)}, total recurring debt commitments equal ${format(results.totalMonthlyDebt)}. The maximum recommended debt payment under conservative underwriting guidelines is ${format(results.maximumRecommendedTotalDebt)}.`,
      keyFigures: [
        { label: 'Back-End Total DTI', value: `${results.backEndDTI.toFixed(1)}%`, highlight: true },
        { label: 'Front-End Housing DTI', value: `${results.frontEndDTI.toFixed(1)}%` },
        { label: 'Total Monthly Debt Commitments', value: format(results.totalMonthlyDebt) },
        { label: 'Max Recommended Debt (36%)', value: format(results.maximumRecommendedTotalDebt) },
        { label: 'Total Housing Costs', value: format(results.totalHousingExpenses) },
        { label: 'Total Non-Housing Debt', value: format(results.totalNonHousingDebt) },
      ],
      assumptions: [
        { label: 'Prime Benchmark', value: 'Back-End DTI <= 36% qualifies for best rates and credit lines' },
        { label: 'Underwriting Ceiling', value: 'Conventional mortgage underwriting caps total DTI at 43%' },
        { label: 'Front-End Benchmark', value: 'Housing costs ideally <= 28% of gross monthly income' },
      ],
      methodology: 'Segregated front-end vs back-end debt burden formula according to institutional mortgage underwriting guidelines.',
      formulaSteps: [
        {
          name: 'Front-End Housing Ratio',
          formula: 'Front-End = (Total Housing Expenses / Gross Monthly Income) * 100',
          substituted: `(${format(results.totalHousingExpenses)} / ${format(grossMonthlyIncome)}) * 100`,
          result: `${results.frontEndDTI.toFixed(1)}%`,
          explanation: 'Percentage of earnings dedicated exclusively to housing (rent/mortgage, taxes, insurance).',
        },
        {
          name: 'Back-End Total Debt Ratio',
          formula: 'Back-End = (Total Monthly Debt Obligations / Gross Monthly Income) * 100',
          substituted: `(${format(results.totalMonthlyDebt)} / ${format(grossMonthlyIncome)}) * 100`,
          result: `${results.backEndDTI.toFixed(1)}%`,
          explanation: 'Comprehensive proportion of monthly income committed to all creditor payments.',
        },
      ],
      disclaimers: [
        'Lenders define qualifying gross income strictly from verifiable tax returns, payslips, or audited bank records.',
        'Child support, alimony, or tax liens must also be factored as debt obligations in formal underwriting.',
      ],
    };
  }, [results, grossMonthlyIncome, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Budget & Debt Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Borrower Solvency Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Debt-to-Income (DTI) Diagnostic
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Evaluate front-end housing and back-end total debt burdens against standard credit and mortgage underwriting benchmarks.
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
          label="Back-End DTI (Total Debt)"
          value={`${results.backEndDTI.toFixed(1)}%`}
          icon={<Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue="Benchmark: <= 36% recommended"
          variant="primary"
        />
        <MetricCard
          label="Front-End DTI (Housing)"
          value={`${results.frontEndDTI.toFixed(1)}%`}
          icon={<Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue="Benchmark: <= 28% recommended"
        />
        <MetricCard
          label="Total Monthly Debt"
          value={format(results.totalMonthlyDebt)}
          icon={<CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={`Max at 36%: ${format(results.maximumRecommendedTotalDebt)}`}
        />
        <MetricCard
          label="Underwriting Status"
          value={results.status.toUpperCase()}
          icon={<ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          subValue={statusInfo.title}
        />
      </div>

      {/* Health Gauge Banner */}
      <div className={`p-5 rounded-2xl border ${statusInfo.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">{statusInfo.icon}</div>
          <div>
            <h3 className={`font-bold text-sm sm:text-base ${statusInfo.text}`}>
              {statusInfo.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {results.recommendations[0] || 'Maintain healthy financial buffers.'}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total DTI Gauge</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {results.backEndDTI.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Inputs Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Monthly Income & Housing
            </h2>
            <div className="space-y-5">
              <SliderField
                label="Gross Monthly Income"
                value={grossMonthlyIncome}
                onChange={setGrossMonthlyIncome}
                min={0}
                max={20_000_000}
                step={50_000}
                prefix={currencyConfig.symbol}
                helperText="Pre-tax total household earnings"
              />

              <SliderField
                label="Monthly Mortgage or Rent"
                value={monthlyMortgageOrRent}
                onChange={setMonthlyMortgageOrRent}
                min={0}
                max={5_000_000}
                step={25_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Monthly Property Tax"
                value={propertyTaxMonthly}
                onChange={setPropertyTaxMonthly}
                min={0}
                max={500_000}
                step={5_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Monthly Homeowners Insurance"
                value={homeInsuranceMonthly}
                onChange={setHomeInsuranceMonthly}
                min={0}
                max={250_000}
                step={5_000}
                prefix={currencyConfig.symbol}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Non-Housing Debt Commitments
            </h2>
            <div className="space-y-5">
              <SliderField
                label="Auto Loan Monthly Payments"
                value={autoLoanMonthly}
                onChange={setAutoLoanMonthly}
                min={0}
                max={1_500_000}
                step={10_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Student Loan Monthly Payments"
                value={studentLoanMonthly}
                onChange={setStudentLoanMonthly}
                min={0}
                max={500_000}
                step={5_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Credit Card Minimum Monthly Payments"
                value={creditCardMinMonthly}
                onChange={setCreditCardMinMonthly}
                min={0}
                max={1_000_000}
                step={10_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Other Debt Payments (Personal / Medical / Business)"
                value={otherDebtMonthly}
                onChange={setOtherDebtMonthly}
                min={0}
                max={1_000_000}
                step={10_000}
                prefix={currencyConfig.symbol}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
