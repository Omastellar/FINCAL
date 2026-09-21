import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, Percent, DollarSign, ArrowDownCircle, Download, CheckCircle, Info } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculatePersonalLoan } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { exportAmortizationCSV } from '../utils/exportUtils';
import { ExplainableResultData } from '../types/calculators';

export const PersonalLoanCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  const [loanAmount, setLoanAmount] = useState<number>(() => {
    const val = initialParams.get('amount');
    return val ? parseFloat(val) : 3_000_000;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 18.0;
  });
  const [loanTermMonths, setLoanTermMonths] = useState<number>(() => {
    const val = initialParams.get('term');
    return val ? parseInt(val, 10) : 24;
  });
  const [originationFeePct, setOriginationFeePct] = useState<number>(() => {
    const val = initialParams.get('fee');
    return val ? parseFloat(val) : 3.0;
  });

  useEffect(() => {
    updateUrlParams({
      calc: 'personal-loan',
      amount: loanAmount,
      rate: interestRate,
      term: loanTermMonths,
      fee: originationFeePct,
    });
  }, [loanAmount, interestRate, loanTermMonths, originationFeePct, updateUrlParams]);

  const results = useMemo(() => {
    return calculatePersonalLoan({
      loanAmount,
      interestRate,
      loanTermMonths,
      originationFeePct,
    });
  }, [loanAmount, interestRate, loanTermMonths, originationFeePct]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Personal Loan & APR Analytical Review',
      summary: `Borrowing ${format(loanAmount)} with a ${originationFeePct}% upfront origination fee (${format(results.originationFeeAmount)}) yields net disbursed capital of ${format(results.netDisbursedAmount)}. Because the upfront fee reduces disbursed proceeds while payments remain based on full principal, your true effective APR is ${results.effectiveAPR.toFixed(2)}% compared to the nominal rate of ${interestRate}%.`,
      keyFigures: [
        { label: 'Monthly Payment', value: format(results.monthlyPayment), highlight: true },
        { label: 'Gross Loan Amount', value: format(loanAmount) },
        { label: 'Net Disbursed Cash', value: format(results.netDisbursedAmount), hint: 'Actual cash credited to your account' },
        { label: 'Upfront Origination Fee', value: format(results.originationFeeAmount) },
        { label: 'Nominal Interest Rate', value: `${interestRate}%` },
        { label: 'True Effective APR', value: `${results.effectiveAPR.toFixed(2)}%`, highlight: true, hint: 'Includes upfront origination fee' },
        { label: 'Total Interest Charge', value: format(results.totalInterest) },
        { label: 'Total Repayment', value: format(results.totalRepayment) },
      ],
      assumptions: [
        { label: 'Repayment Schedule', value: `${loanTermMonths} Monthly Installments` },
        { label: 'Origination Fee Deduction', value: 'Deducted directly from gross loan proceeds before disbursement' },
        { label: 'Prepayment Penalty', value: 'None assumed (standard zero-penalty fixed-term model)' },
      ],
      methodology: 'Actuarial amortization accounting for upfront lender fees under Truth in Lending (APR) methodology.',
      formulaSteps: [
        {
          name: 'Net Disbursed Proceeds',
          formula: 'Net Disbursed = Loan Amount - (Loan Amount * Origination Fee %)',
          substituted: `${format(loanAmount)} - (${format(loanAmount)} * ${(originationFeePct / 100).toFixed(3)})`,
          result: format(results.netDisbursedAmount),
          explanation: 'Liquid cash delivered to the borrower after lender administrative and underwriting holdbacks.',
        },
        {
          name: 'True Effective APR (Constant Ratio)',
          formula: 'APR = [2 * m * Total Finance Charges] / [Net Disbursed * (n + 1)]',
          substituted: `[2 * 12 * ${format(results.totalInterest + results.originationFeeAmount)}] / [${format(results.netDisbursedAmount)} * ${loanTermMonths + 1}]`,
          result: `${results.effectiveAPR.toFixed(2)}%`,
          explanation: 'Standard annualized percentage rate reflecting total cost of borrowing against actual funds received.',
        },
      ],
      disclaimers: [
        'Personal loan approvals and APR tiers depend on personal credit score, verifiable debt-to-income ratios, and existing banking relationships.',
        'Late fees, dishonored check charges, or early payment administrative fees may apply per individual lender master agreement.',
      ],
    };
  }, [results, loanAmount, originationFeePct, interestRate, loanTermMonths, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Loan Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Fixed-Term Borrowing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personal Loan & Effective APR Calculator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Expose true borrowing costs by revealing net disbursed proceeds and APR factoring upfront origination fees.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
          <button
            type="button"
            onClick={() => exportAmortizationCSV(results.amortizationSchedule, loanAmount, interestRate, currencyConfig.code)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Monthly Payment"
          value={format(results.monthlyPayment)}
          icon={<CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue={`For ${loanTermMonths} months`}
          variant="primary"
        />
        <MetricCard
          label="Net Cash You Receive"
          value={format(results.netDisbursedAmount)}
          icon={<ArrowDownCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue={`After ${format(results.originationFeeAmount)} origination fee`}
        />
        <MetricCard
          label="True Effective APR"
          value={`${results.effectiveAPR.toFixed(2)}%`}
          icon={<Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={`Nominal rate: ${interestRate}%`}
        />
        <MetricCard
          label="Total Interest Repaid"
          value={format(results.totalInterest)}
          icon={<DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          subValue={`Total outlay: ${format(results.totalRepayment)}`}
        />
      </div>

      {/* Controls & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Loan Inputs
            </h2>
            <div className="space-y-5">
              <SliderField
                label="Requested Loan Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                min={200_000}
                max={25_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Nominal Annual Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                min={2}
                max={40}
                step={0.5}
                suffix="%"
              />

              <SliderField
                label="Upfront Origination Fee"
                value={originationFeePct}
                onChange={setOriginationFeePct}
                min={0}
                max={10}
                step={0.25}
                suffix="%"
                helperText={`Fee amount: ${format(results.originationFeeAmount)}`}
              />

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                  Term Length
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[12, 24, 36, 48, 60].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanTermMonths(term)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        loanTermMonths === term
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {term} mo
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Net Disbursement Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Visualizing how lender fees impact the actual cash delivered to your bank account.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Total Approved Loan Principal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{format(loanAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-red-600 dark:text-red-400">
                  <span>Less: Origination Fee ({originationFeePct}%)</span>
                  <span className="font-bold">- {format(results.originationFeeAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-base font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Net Funds Received in Bank</span>
                  <span>{format(results.netDisbursedAmount)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
                  <Info className="w-4 h-4 text-purple-600" />
                  <span>APR vs Nominal Rate Impact</span>
                </div>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                  Your effective APR of <strong className="underline">{results.effectiveAPR.toFixed(2)}%</strong> is {(results.effectiveAPR - interestRate).toFixed(2)}% higher than the stated {interestRate}% rate due to the upfront {format(results.originationFeeAmount)} deduction.
                </p>
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
