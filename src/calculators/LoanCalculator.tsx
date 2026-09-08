import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Calendar,
  CreditCard,
  RotateCcw,
  Zap,
  TrendingDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateLoanPayment, calculateLoanWithPrepayment } from '../utils/financialMath';
import { exportAmortizationCSV } from '../utils/exportUtils';
import { PaymentFrequency } from '../types/calculators';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { DonutChart } from '../components/charts/DonutChart';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';

export const LoanCalculator: React.FC = () => {
  const { currency, currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  // Load initial params from URL if present
  const initialParams = useMemo(() => getUrlParams(), []);

  // State
  const [loanAmount, setLoanAmount] = useState<number>(() => {
    const val = initialParams.get('amount');
    return val ? parseFloat(val) : 5_000_000;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 14.5;
  });
  const [loanTermYears, setLoanTermYears] = useState<number>(() => {
    const val = initialParams.get('term');
    return val ? parseFloat(val) : 5;
  });
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(() => {
    const val = initialParams.get('freq') as PaymentFrequency;
    return val === 'bi-weekly' || val === 'weekly' ? val : 'monthly';
  });

  // Prepayment Simulator State
  const [showPrepayment, setShowPrepayment] = useState<boolean>(() => {
    return !!(initialParams.get('extra') || initialParams.get('lump'));
  });
  const [extraPayment, setExtraPayment] = useState<number>(() => {
    const val = initialParams.get('extra');
    return val ? parseFloat(val) : 0;
  });
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(() => {
    const val = initialParams.get('lump');
    return val ? parseFloat(val) : 0;
  });
  const [lumpSumYear, setLumpSumYear] = useState<number>(() => {
    const val = initialParams.get('lumpYear');
    return val ? parseFloat(val) : 1;
  });

  const [scheduleView, setScheduleView] = useState<'annual' | 'periodic'>('annual');
  const [activePlan, setActivePlan] = useState<'standard' | 'accelerated'>('standard');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 12;

  // Sync state to URL
  useEffect(() => {
    updateUrlParams({
      calc: 'loan',
      amount: loanAmount,
      rate: interestRate,
      term: loanTermYears,
      freq: paymentFrequency,
      extra: extraPayment > 0 ? extraPayment : '',
      lump: lumpSumAmount > 0 ? lumpSumAmount : '',
      lumpYear: lumpSumAmount > 0 ? lumpSumYear : '',
    });
  }, [
    loanAmount,
    interestRate,
    loanTermYears,
    paymentFrequency,
    extraPayment,
    lumpSumAmount,
    lumpSumYear,
    updateUrlParams,
  ]);

  // Standard calculation
  const standardResults = useMemo(() => {
    return calculateLoanPayment(loanAmount, interestRate, loanTermYears, paymentFrequency);
  }, [loanAmount, interestRate, loanTermYears, paymentFrequency]);

  // Accelerated calculation with prepayments
  const prepaymentResults = useMemo(() => {
    return calculateLoanWithPrepayment(
      loanAmount,
      interestRate,
      loanTermYears,
      paymentFrequency,
      extraPayment,
      lumpSumAmount,
      lumpSumYear
    );
  }, [loanAmount, interestRate, loanTermYears, paymentFrequency, extraPayment, lumpSumAmount, lumpSumYear]);

  const hasActivePrepayment = extraPayment > 0 || lumpSumAmount > 0;

  // Choose schedule to display
  const currentSchedule = useMemo(() => {
    if (hasActivePrepayment && activePlan === 'accelerated') {
      return {
        amortization: prepaymentResults.amortizationSchedule,
        annual: prepaymentResults.annualSchedule,
      };
    }
    return {
      amortization: standardResults.amortizationSchedule,
      annual: standardResults.annualSchedule,
    };
  }, [hasActivePrepayment, activePlan, prepaymentResults, standardResults]);

  // Donut chart data
  const chartData = useMemo(() => {
    const totalInt = hasActivePrepayment
      ? prepaymentResults.acceleratedTotalInterest
      : standardResults.totalInterest;
    return [
      { name: 'Principal Loan', value: loanAmount, color: '#3b82f6' },
      { name: 'Total Interest', value: totalInt, color: '#10b981' },
    ];
  }, [loanAmount, hasActivePrepayment, prepaymentResults, standardResults]);

  // Insights
  const insights = useMemo(() => {
    const list: string[] = [];
    if (standardResults.periodicPayment > 0) {
      list.push(
        `Your standard ${paymentFrequency} loan payment is ${format(standardResults.periodicPayment)}.`
      );
      if (hasActivePrepayment && prepaymentResults.interestSaved > 0) {
        list.push(
          `Accelerated strategy saves you ${format(prepaymentResults.interestSaved)} in total interest charges!`
        );
        list.push(
          `You will become completely debt-free ${prepaymentResults.yearsSaved.toFixed(1)} years sooner than the standard schedule.`
        );
      } else {
        list.push(
          `You will pay approximately ${format(standardResults.totalInterest)} in total interest over the ${loanTermYears}-year term.`
        );
      }
    }
    return list;
  }, [standardResults, hasActivePrepayment, prepaymentResults, paymentFrequency, loanTermYears, format]);

  const handleExportCSV = () => {
    exportAmortizationCSV(currentSchedule.amortization, loanAmount, interestRate, currency);
  };

  const resetDefaults = () => {
    setLoanAmount(5_000_000);
    setInterestRate(14.5);
    setLoanTermYears(5);
    setPaymentFrequency('monthly');
    setExtraPayment(0);
    setLumpSumAmount(0);
    setLumpSumYear(1);
    setShowPrepayment(false);
  };

  const totalPeriodicPages = Math.ceil(currentSchedule.amortization.length / rowsPerPage);
  const paginatedPeriodicRows = currentSchedule.amortization.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Loan Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate accurate repayments, explore prepayment savings, and review complete amortization schedules.
          </p>
        </div>

        {/* Action Controls */}
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
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Loan Parameters
            </h3>

            {/* Loan Amount */}
            <SliderField
              label="Loan Amount"
              value={loanAmount}
              onChange={setLoanAmount}
              min={50_000}
              max={100_000_000}
              step={50_000}
              prefix={currencyConfig.symbol}
            />

            {/* Annual Interest Rate */}
            <SliderField
              label="Annual Interest Rate (%)"
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={40}
              step={0.1}
              suffix="%"
              helperText="0% supported"
            />

            {/* Loan Term */}
            <SliderField
              label="Loan Term (Years)"
              value={loanTermYears}
              onChange={setLoanTermYears}
              min={1}
              max={30}
              step={1}
              suffix=" yrs"
            />

            {/* Payment Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['monthly', 'bi-weekly', 'weekly'] as PaymentFrequency[]).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      setPaymentFrequency(freq);
                      setCurrentPage(1);
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                      paymentFrequency === freq
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

          {/* Prepayment & Lump-Sum Simulator Panel */}
          <Card className="space-y-4 border-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prepayment Simulator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrepayment(!showPrepayment)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {showPrepayment ? 'Hide Options' : '+ Add Prepayments'}
              </button>
            </div>

            {showPrepayment && (
              <div className="space-y-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                {/* Extra Periodic Payment */}
                <SliderField
                  label={`Extra ${paymentFrequency} Principal Payment`}
                  value={extraPayment}
                  onChange={setExtraPayment}
                  min={0}
                  max={500_000}
                  step={5_000}
                  prefix={currencyConfig.symbol}
                  helperText="Reduces principal each period"
                />

                {/* Lump Sum Amount */}
                <SliderField
                  label="One-Time Lump-Sum Payment"
                  value={lumpSumAmount}
                  onChange={setLumpSumAmount}
                  min={0}
                  max={10_000_000}
                  step={25_000}
                  prefix={currencyConfig.symbol}
                  helperText="e.g. bonus, dividend, or inheritance"
                />

                {lumpSumAmount > 0 && (
                  <SliderField
                    label="Apply Lump-Sum in Year"
                    value={lumpSumYear}
                    onChange={setLumpSumYear}
                    min={1}
                    max={loanTermYears}
                    step={1}
                    suffix=" yr"
                  />
                )}
              </div>
            )}
          </Card>

          {/* Donut Chart Card */}
          <Card>
            <DonutChart
              data={chartData}
              title={`Repayment Breakdown (${hasActivePrepayment ? 'Accelerated' : 'Standard'})`}
              height={230}
            />
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prepayment Milestone Callout if active */}
          {hasActivePrepayment && prepaymentResults.interestSaved > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Prepayment Impact: Save {format(prepaymentResults.interestSaved)}!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your loan will be paid off <strong>{prepaymentResults.yearsSaved.toFixed(1)} years</strong> earlier than scheduled.
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 bg-white/80 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setActivePlan('accelerated')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    activePlan === 'accelerated'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Accelerated Plan
                </button>
                <button
                  onClick={() => setActivePlan('standard')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    activePlan === 'standard'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Standard Plan
                </button>
              </div>
            </div>
          )}

          {/* Hero Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label={`${paymentFrequency} Payment`}
              value={format(
                hasActivePrepayment
                  ? standardResults.periodicPayment + extraPayment
                  : standardResults.periodicPayment
              )}
              subValue={
                hasActivePrepayment && extraPayment > 0
                  ? `Includes ${format(extraPayment)} extra principal`
                  : undefined
              }
              variant="primary"
            />
            <MetricCard
              label="Total Interest"
              value={format(
                hasActivePrepayment
                  ? prepaymentResults.acceleratedTotalInterest
                  : standardResults.totalInterest
              )}
              subValue={
                hasActivePrepayment && prepaymentResults.interestSaved > 0
                  ? `Saved ${format(prepaymentResults.interestSaved)}`
                  : `${standardResults.interestRatio.toFixed(1)}% of total repayment`
              }
              variant={hasActivePrepayment ? 'success' : 'warning'}
            />
            <MetricCard
              label="Total Repayment"
              value={format(
                hasActivePrepayment
                  ? prepaymentResults.acceleratedTotalRepayment
                  : standardResults.totalRepayment
              )}
              subValue="Principal + Interest"
              variant="info"
            />
            <MetricCard
              label="Payoff Timeline"
              value={
                hasActivePrepayment
                  ? `${(prepaymentResults.acceleratedPeriods / (paymentFrequency === 'monthly' ? 12 : paymentFrequency === 'bi-weekly' ? 26 : 52)).toFixed(1)} Years`
                  : `${loanTermYears} Years`
              }
              subValue={
                hasActivePrepayment
                  ? `${prepaymentResults.acceleratedPeriods} total payments`
                  : `${standardResults.amortizationSchedule.length} total payments`
              }
              variant="default"
              icon={<Clock className="w-4 h-4 text-emerald-500" />}
            />
          </div>

          {/* Plain English Insights */}
          <InsightBanner insights={insights} />

          {/* Amortization Schedule Table Card */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Amortization Schedule {hasActivePrepayment && `(${activePlan === 'accelerated' ? 'Accelerated' : 'Standard'})`}
                </h3>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* View Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setScheduleView('annual')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      scheduleView === 'annual'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => {
                      setScheduleView('periodic');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      scheduleView === 'periodic'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All Periods
                  </button>
                </div>

                {/* CSV Download Button */}
                <button
                  onClick={handleExportCSV}
                  title="Download CSV"
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              {scheduleView === 'annual' ? (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3 text-right">Total Payment</th>
                      <th className="py-2.5 px-3 text-right">Principal</th>
                      <th className="py-2.5 px-3 text-right">Interest</th>
                      <th className="py-2.5 px-3 text-right">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {currentSchedule.annual.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                          Year {row.year}
                        </td>
                        <td className="py-2 px-3 text-right">{format(row.payment)}</td>
                        <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                          {format(row.principalPaid)}
                        </td>
                        <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">
                          {format(row.interestPaid)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                          {format(row.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Period</th>
                        <th className="py-2.5 px-3 text-right">Payment</th>
                        <th className="py-2.5 px-3 text-right">Principal</th>
                        <th className="py-2.5 px-3 text-right">Interest</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {paginatedPeriodicRows.map((row) => (
                        <tr key={row.period} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                            #{row.period}
                          </td>
                          <td className="py-2 px-3 text-right">{format(row.payment)}</td>
                          <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                            {format(row.principalPaid)}
                          </td>
                          <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">
                            {format(row.interestPaid)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                            {format(row.remainingBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalPeriodicPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500">
                        Page {currentPage} of {totalPeriodicPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <button
                          disabled={currentPage === totalPeriodicPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPeriodicPages, p + 1))}
                          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
