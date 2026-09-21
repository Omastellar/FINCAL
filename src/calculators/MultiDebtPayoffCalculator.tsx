import React, { useState, useMemo } from 'react';
import { Flame, Plus, Trash2, ShieldCheck, DollarSign, Calendar, Zap, ArrowRight, Award } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateMultiDebtPayoff } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { DebtItem, ExplainableResultData } from '../types/calculators';

export const MultiDebtPayoffCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { copyShareableLink, copied } = useShareableState();

  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);
  const [activeStrategy, setActiveStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtRate, setNewDebtRate] = useState('');
  const [newDebtMin, setNewDebtMin] = useState('');

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtName || !newDebtBalance) return;
    const item: DebtItem = {
      id: Date.now().toString(),
      name: newDebtName,
      balance: parseFloat(newDebtBalance) || 0,
      interestRate: parseFloat(newDebtRate) || 0,
      minimumPayment: parseFloat(newDebtMin) || 0,
    };
    setDebts([...debts, item]);
    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtRate('');
    setNewDebtMin('');
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const results = useMemo(() => {
    return calculateMultiDebtPayoff({ debts, extraMonthlyPayment });
  }, [debts, extraMonthlyPayment]);

  const totalDebtBalance = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.balance, 0);
  }, [debts]);

  const totalMinPayment = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  }, [debts]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Multi-Debt Payoff Strategy Evaluation',
      summary: `You have ${debts.length} outstanding debts totaling ${format(totalDebtBalance)}. Adding ${format(extraMonthlyPayment)} in extra monthly payments accelerates debt freedom. The Avalanche strategy achieves full payoff in ${results.avalanche.totalMonths} months (${results.avalanche.debtFreeDateStr}), saving ${format(results.interestSavedAvalancheVsMinimum)}. The Snowball strategy eliminates debts in ${results.snowball.totalMonths} months (${results.snowball.debtFreeDateStr}), saving ${format(results.interestSavedSnowballVsMinimum)}.`,
      keyFigures: [
        { label: 'Avalanche Total Interest', value: format(results.avalanche.totalInterestPaid), highlight: true },
        { label: 'Snowball Total Interest', value: format(results.snowball.totalInterestPaid) },
        { label: 'Minimum-Only Baseline Interest', value: format(results.minimumOnly.totalInterestPaid) },
        { label: 'Avalanche Interest Saved', value: format(results.interestSavedAvalancheVsMinimum), hint: 'Maximum mathematical savings' },
        { label: 'Snowball Interest Saved', value: format(results.interestSavedSnowballVsMinimum), hint: 'Maximum behavioral momentum' },
        { label: 'Time Saved vs Minimum', value: `${results.monthsSavedAvalancheVsMinimum} Months (${(results.monthsSavedAvalancheVsMinimum / 12).toFixed(1)} yrs)` },
      ],
      assumptions: [
        { label: 'Strategy Comparison', value: 'Neither strategy is universally superior: Avalanche minimizes monetary interest costs, while Snowball maximizes early behavioral milestone wins.' },
        { label: 'Payment Rollover (Cascade)', value: 'As each debt is eliminated, 100% of its minimum payment is rolled into the next prioritized debt.' },
        { label: 'No Additional Borrowing', value: 'Assumes balances remain frozen with zero new revolving credit charges.' },
      ],
      methodology: 'Iterative month-by-month debt amortization simulation with freed-up cash flow cascading to prioritized balances.',
      formulaSteps: [
        {
          name: 'Debt Cascade Rollover',
          formula: 'Available Cascade = Extra Monthly Payment + Sum of Paid-Off Minimums',
          substituted: `${format(extraMonthlyPayment)} + Freed-Up Minimums`,
          result: 'Applied sequentially to target balance',
          explanation: 'Compounding cash flow acceleration reduces subsequent loan balances at an exponential velocity.',
        },
      ],
      disclaimers: [
        'Late fees, variable APR rate spikes, or missed monthly minimums will extend timeline projections.',
        'Always verify minimum payment calculations with individual card issuer and lender statements.',
      ],
    };
  }, [debts, totalDebtBalance, extraMonthlyPayment, results, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Budget & Debt Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Debt Freedom Accelerator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Multi-Debt Payoff Planner
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compare Avalanche (highest rate first) vs Snowball (lowest balance first) strategies side-by-side without bias.
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
          label="Total Outstanding Debt"
          value={format(totalDebtBalance)}
          icon={<Flame className="w-5 h-5 text-red-600 dark:text-red-400" />}
          subValue={`Across ${debts.length} active liabilities`}
          variant="primary"
        />
        <MetricCard
          label="Debt-Free Date (Avalanche)"
          value={results.avalanche.debtFreeDateStr}
          icon={<Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue={`${results.avalanche.totalMonths} months total`}
        />
        <MetricCard
          label="Interest Saved (Avalanche)"
          value={format(results.interestSavedAvalancheVsMinimum)}
          icon={<ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue="Compared to paying minimums only"
        />
        <MetricCard
          label="Required Monthly Outflow"
          value={format(totalMinPayment + extraMonthlyPayment)}
          icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue={`Min: ${format(totalMinPayment)} + Extra: ${format(extraMonthlyPayment)}`}
        />
      </div>

      {/* Side-by-Side Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avalanche Card */}
        <div
          onClick={() => setActiveStrategy('avalanche')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeStrategy === 'avalanche'
              ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Avalanche Method
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Mathematical Optimization
              </span>
            </div>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Target Highest Interest Rate First
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Directs extra funds to the highest APR liability first, saving the absolute maximum amount in interest.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-500 block">Total Interest Paid</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {format(results.avalanche.totalInterestPaid)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">Interest Saved</span>
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                {format(results.interestSavedAvalancheVsMinimum)}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Payoff Sequence:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {results.avalanche.payoffOrder.map((name, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {i + 1}. {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Snowball Card */}
        <div
          onClick={() => setActiveStrategy('snowball')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeStrategy === 'snowball'
              ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Snowball Method
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Behavioral Momentum
              </span>
            </div>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Target Smallest Balance First
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Eliminates smaller balances first for quick psychological milestones and fast debt account reduction.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-500 block">Total Interest Paid</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {format(results.snowball.totalInterestPaid)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[11px] text-blue-700 dark:text-blue-400 block">Interest Saved</span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300 mt-0.5 block">
                {format(results.interestSavedSnowballVsMinimum)}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Payoff Sequence:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {results.snowball.payoffOrder.map((name, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {i + 1}. {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Debt Table & Extra Payment Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Your Debts ({debts.length})
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Min Payment: {format(totalMinPayment)}/mo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="pb-2 font-semibold">Debt Name</th>
                    <th className="pb-2 font-semibold text-right">Balance</th>
                    <th className="pb-2 font-semibold text-right">APR</th>
                    <th className="pb-2 font-semibold text-right">Min Payment</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {debts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500">
                        No debts added yet. Enter your debt details below to begin strategy analysis.
                      </td>
                    </tr>
                  ) : (
                    debts.map((d) => (
                      <tr key={d.id}>
                        <td className="py-2.5 font-medium text-slate-900 dark:text-white">{d.name}</td>
                        <td className="py-2.5 text-right font-mono">{format(d.balance)}</td>
                        <td className="py-2.5 text-right font-mono">{d.interestRate}%</td>
                        <td className="py-2.5 text-right font-mono">{format(d.minimumPayment)}</td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDebt(d.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Debt Inline Form */}
            <form onSubmit={handleAddDebt} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Debt Name (e.g. Card)"
                value={newDebtName}
                onChange={(e) => setNewDebtName(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="number"
                placeholder="Balance"
                value={newDebtBalance}
                onChange={(e) => setNewDebtBalance(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
              />
              <input
                type="number"
                placeholder="APR %"
                value={newDebtRate}
                onChange={(e) => setNewDebtRate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
              />
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min Pay"
                  value={newDebtMin}
                  onChange={(e) => setNewDebtMin(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Acceleration Budget
            </h2>
            <div className="space-y-4">
              <SliderField
                label="Extra Monthly Payment"
                value={extraMonthlyPayment}
                onChange={setExtraMonthlyPayment}
                min={0}
                max={500_000}
                step={10_000}
                prefix={currencyConfig.symbol}
                suffix="/mo"
                helperText="Extra cash dedicated above all required minimums"
              />

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Minimum Only Horizon:</span>
                  <span className="font-semibold">{results.minimumOnly.totalMonths} months</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Accelerated Horizon:</span>
                  <span>{results[activeStrategy].totalMonths} months</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Time Saved:</span>
                  <span>{results.minimumOnly.totalMonths - results[activeStrategy].totalMonths} months</span>
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
