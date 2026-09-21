import React from 'react';
import { Award, CheckCircle2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { ScenarioOption } from '../../types/calculators';
import { useCurrency } from '../../context/CurrencyContext';

interface ScenarioCompareCardProps {
  scenario: ScenarioOption;
  isLowestCost?: boolean;
  isHighestValue?: boolean;
  baselineScenario?: ScenarioOption;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const ScenarioCompareCard: React.FC<ScenarioCompareCardProps> = ({
  scenario,
  isLowestCost = false,
  isHighestValue = false,
  baselineScenario,
  onSelect,
  isSelected = false,
}) => {
  const { format } = useCurrency();

  const costDelta = baselineScenario && baselineScenario.id !== scenario.id
    ? scenario.totalCostOverTerm - baselineScenario.totalCostOverTerm
    : 0;

  const valueDelta = baselineScenario && baselineScenario.id !== scenario.id
    ? scenario.projectedEndingNetValue - baselineScenario.projectedEndingNetValue
    : 0;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl p-5 border transition-all cursor-pointer ${
        isSelected
          ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {scenario.category}
        </span>
        <div className="flex items-center gap-1">
          {isLowestCost && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="w-3 h-3" /> Lowest Cost
            </span>
          )}
          {isHighestValue && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <TrendingUp className="w-3 h-3" /> Highest Net Value
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        {scenario.name}
      </h3>

      {scenario.notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {scenario.notes}
        </p>
      )}

      {/* Core Financial Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 my-4">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Upfront Capital</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {format(scenario.upfrontCost)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Monthly Expense</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {format(scenario.monthlyOngoingCost)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Cost ({scenario.termYears}y)</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {format(scenario.totalCostOverTerm)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Projected Ending Net</div>
          <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
            {format(scenario.projectedEndingNetValue)}
          </div>
        </div>
      </div>

      {/* Delta comparison against baseline if present */}
      {baselineScenario && baselineScenario.id !== scenario.id && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Cost Delta vs Baseline:</span>
            <span
              className={`font-semibold ${
                costDelta < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : costDelta > 0
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {costDelta < 0 ? `Saves ${format(Math.abs(costDelta))}` : `+${format(costDelta)} more`}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Wealth Delta vs Baseline:</span>
            <span
              className={`font-semibold ${
                valueDelta > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : valueDelta < 0
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {valueDelta > 0 ? `+${format(valueDelta)} ahead` : `${format(Math.abs(valueDelta))} lower`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
