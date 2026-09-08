import React, { useState, useMemo } from 'react';
import { Download, Calendar, Percent, CreditCard, RotateCcw } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateLoanPayment } from '../utils/financialMath';
import { exportAmortizationCSV } from '../utils/exportUtils';
import { PaymentFrequency } from '../types/calculators';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { DonutChart } from '../components/charts/DonutChart';

export const LoanCalculator: React.FC = () => {
  const { currency, currencyConfig, format } = useCurrency();

  // State
  const [loanAmount, setLoanAmount] = useState<number>(5_000_000);
  const [interestRate, setInterestRate] = useState<number>(14.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(5);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [scheduleView, setScheduleView] = useState<'annual' | 'periodic'>('annual');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 12;

  // Calculation
  const results = useMemo(() => {
    return calculateLoanPayment(loanAmount, interestRate, loanTermYears, paymentFrequency);
  }, [loanAmount, interestRate, loanTermYears, paymentFrequency]);

  // Donut chart data
  const chartData = useMemo(() => {
    return [
      { name: 'Principal Loan', value: loanAmount, color: '#3b82f6' },
      { name: 'Total Interest', value: results.totalInterest, color: '#10b981' },
    ];
  }, [loanAmount, results.totalInterest]);

  // Insights
  const insights = useMemo(() => {
    const list: string[] = [];
    if (results.periodicPayment > 0) {
      list.push(
        `Your estimated ${paymentFrequency} loan payment is ${format(results.periodicPayment)}.`
      );
      list.push(
        `You will pay approximately ${format(results.totalInterest)} in total interest over the ${loanTermYears}-year term.`
      );
      if (results.interestRatio > 30) {
        list.push(
          `Interest accounts for ${results.interestRatio.toFixed(1)}% of your total repayment. Making extra principal payments or securing a lower rate will reduce this significantly.`
        );
      } else {
        list.push(
          `Principal represents ${results.principalRatio.toFixed(1)}% of total payments.`
        );
      }
    }
    return list;
  }, [results, paymentFrequency, format, loanTermYears]);

  const handleExportCSV = () => {
    exportAmortizationCSV(results.amortizationSchedule, loanAmount, interestRate, currency);
  };

  const resetDefaults = () => {
    setLoanAmount(5_000_000);
    setInterestRate(14.5);
    setLoanTermYears(5);
    setPaymentFrequency('monthly');
  };

  // Pagination for periodic schedule
  const totalPeriodicPages = Math.ceil(results.amortizationSchedule.length / rowsPerPage);
  const paginatedPeriodicRows = results.amortizationSchedule.slice(
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
            Calculate accurate repayments, interest charges, and review complete amortization schedules.
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

          {/* Donut Chart Card */}
          <Card>
            <DonutChart
              data={chartData}
              title="Repayment Breakdown (Principal vs Interest)"
              height={230}
            />
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label={`${paymentFrequency} Payment`}
              value={format(results.periodicPayment)}
              subValue={
                paymentFrequency !== 'monthly'
                  ? `≈ ${format(results.monthlyEquivalentPayment)} / month`
                  : undefined
              }
              variant="primary"
            />
            <MetricCard
              label="Total Interest"
              value={format(results.totalInterest)}
              subValue={`${results.interestRatio.toFixed(1)}% of total repayment`}
              variant="warning"
            />
            <MetricCard
              label="Total Repayment"
              value={format(results.totalRepayment)}
              subValue="Principal + Interest"
              variant="info"
            />
            <MetricCard
              label="Loan Term"
              value={`${loanTermYears} Years`}
              subValue={`${results.amortizationSchedule.length} total payments`}
              variant="default"
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
                  Amortization Schedule
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
                    Annual Summary
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
                    {results.annualSchedule.map((row) => (
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

                  {/* Periodic Pagination Controls */}
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
