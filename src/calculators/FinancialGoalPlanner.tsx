import React, { useState, useMemo } from 'react';
import { Target, Plus, Trash2, Calendar, ShieldCheck, DollarSign, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateFinancialGoals } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { FinancialGoalItem, ExplainableResultData } from '../types/calculators';

export const FinancialGoalPlanner: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { copyShareableLink, copied } = useShareableState();

  const [monthlySavingsBudget, setMonthlySavingsBudget] = useState<number>(0);
  const [goals, setGoals] = useState<FinancialGoalItem[]>([]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<FinancialGoalItem['category']>('Emergency');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newDate, setNewDate] = useState('2027-12');
  const [newPriority, setNewPriority] = useState<FinancialGoalItem['priority']>('medium');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;
    const item: FinancialGoalItem = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      targetAmount: parseFloat(newTarget) || 0,
      currentAmount: parseFloat(newCurrent) || 0,
      targetDate: newDate,
      priority: newPriority,
    };
    setGoals([...goals, item]);
    setNewTitle('');
    setNewTarget('');
    setNewCurrent('');
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const results = useMemo(() => {
    return calculateFinancialGoals({ goals, monthlySavingsBudget });
  }, [goals, monthlySavingsBudget]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Financial Goals Prioritization & Budget Capacity',
      summary: `Across ${goals.length} target milestones, your aggregate goal value is ${format(results.totalTargetAmount)} with ${format(results.totalCurrentAmount)} accumulated to date (${results.overallProgressPct.toFixed(1)}% complete). Achieving all targets on their dates requires ${format(results.totalRequiredMonthly)} monthly. Against your monthly budget of ${format(monthlySavingsBudget)}, you have a ${
        results.budgetSurplusDeficit >= 0 ? `surplus of ${format(results.budgetSurplusDeficit)}` : `deficit of ${format(Math.abs(results.budgetSurplusDeficit))}`
      }.`,
      keyFigures: [
        { label: 'Total Goals Target Capital', value: format(results.totalTargetAmount), highlight: true },
        { label: 'Total Accumulated So Far', value: format(results.totalCurrentAmount) },
        { label: 'Cumulative Progress', value: `${results.overallProgressPct.toFixed(1)}%` },
        { label: 'Required Monthly Savings', value: format(results.totalRequiredMonthly) },
        { label: 'Monthly Savings Budget', value: format(monthlySavingsBudget) },
        { label: 'Monthly Surplus / Deficit', value: `${results.budgetSurplusDeficit >= 0 ? '+' : ''}${format(results.budgetSurplusDeficit)}`, highlight: results.budgetSurplusDeficit < 0 },
      ],
      assumptions: [
        { label: 'Priority Weighting Engine', value: 'High Priority (weight 3x) > Medium Priority (weight 2x) > Low Priority (weight 1x)' },
        { label: 'Zero Real Return Drag', value: 'Values calculated linearly without speculative investment return inflation' },
      ],
      methodology: 'Proportional multi-goal optimization distributing monthly disposable cash flow by priority coefficients.',
      formulaSteps: [
        {
          name: 'Monthly Savings Requirement Per Goal',
          formula: 'Required = (Target - Current) / Months Remaining',
          substituted: 'Calculated dynamically for each deadline',
          result: format(results.totalRequiredMonthly),
          explanation: 'Sum of minimum monthly deposits necessary to satisfy every goal concurrently on time.',
        },
      ],
      disclaimers: [
        'High-priority essential goals (like Emergency Safety Reserves) should be prioritized before discretionary lifestyle targets.',
      ],
    };
  }, [goals, results, monthlySavingsBudget, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Planning & Decisions Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Multi-Goal Budget Allocation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Financial Goals & Allocation Planner
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Prioritize multiple life goals (housing, emergency, travel) against your available monthly savings budget.
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
          label="Overall Goal Progress"
          value={`${results.overallProgressPct.toFixed(1)}%`}
          icon={<Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue={`${format(results.totalCurrentAmount)} of ${format(results.totalTargetAmount)}`}
          variant="primary"
        />
        <MetricCard
          label="Required Monthly Savings"
          value={format(results.totalRequiredMonthly)}
          icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue="To fulfill all deadlines"
        />
        <MetricCard
          label="Your Monthly Budget"
          value={format(monthlySavingsBudget)}
          icon={<DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue="Available for allocation"
        />
        <MetricCard
          label="Budget Sufficiency"
          value={results.budgetSurplusDeficit >= 0 ? 'Surplus' : 'Deficit'}
          icon={
            results.budgetSurplusDeficit >= 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )
          }
          subValue={
            results.budgetSurplusDeficit >= 0
              ? `+${format(results.budgetSurplusDeficit)} buffer/mo`
              : `${format(Math.abs(results.budgetSurplusDeficit))} shortfall/mo`
          }
        />
      </div>

      {/* Budget Adjustment Slider */}
      <Card className="!p-5">
        <SliderField
          label="Your Monthly Dedicated Savings Budget"
          value={monthlySavingsBudget}
          onChange={setMonthlySavingsBudget}
          min={0}
          max={10_000_000}
          step={25_000}
          prefix={currencyConfig.symbol}
          suffix="/mo"
          helperText="Adjust to see how budget changes affect goal achievement timelines."
        />
      </Card>

      {/* Goals List & Form */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Active Financial Goals ({goals.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.goals.length === 0 ? (
            <div className="col-span-full p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
              No financial goals added yet. Fill out the target form below to configure your savings milestones.
            </div>
          ) : (
            results.goals.map((item) => {
            const pct = item.goal.targetAmount > 0 ? (item.goal.currentAmount / item.goal.targetAmount) * 100 : 0;
            return (
              <div
                key={item.goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.goal.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : item.goal.priority === 'medium'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.goal.priority} Priority
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(item.goal.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {item.goal.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Target: {format(item.goal.targetAmount)} • Target Date: {item.goal.targetDate}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Needed to Finish:</span>
                    <span className="font-semibold">{format(item.requiredMonthlySavings)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget Allocated:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {format(item.allocatedMonthlySavings)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span>Status:</span>
                    <span className={item.isAchievableWithBudget ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                      {item.isAchievableWithBudget ? 'On Schedule' : 'Needs +More Budget'}
                    </span>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Add Goal Form */}
        <Card className="!p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            Add New Financial Goal
          </h3>
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Goal Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="lg:col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <input
              type="number"
              placeholder="Target Amount"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
            />
            <input
              type="number"
              placeholder="Current Saved"
              value={newCurrent}
              onChange={(e) => setNewCurrent(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
            />
            <input
              type="month"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <div className="flex gap-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0"
              >
                Add
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
