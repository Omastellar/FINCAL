import React, { useState, useMemo } from 'react';
import { Columns3, Plus, ArrowRightLeft, DollarSign, Calendar, TrendingUp, Award } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { compareScenarios } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { ScenarioCompareCard } from '../components/common/ScenarioCompareCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { ScenarioOption, ExplainableResultData } from '../types/calculators';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const ScenarioComparisonCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { copyShareableLink, copied } = useShareableState();

  const presets: Record<string, { title: string; horizon: number; scenarios: ScenarioOption[] }> = {
    mortgage: {
      title: '15-Year Fixed vs 30-Year Fixed Mortgage',
      horizon: 15,
      scenarios: [
        {
          id: '15yr',
          name: '15-Year Fixed Mortgage',
          category: 'Mortgage Term',
          upfrontCost: 8_000_000,
          monthlyOngoingCost: 650_000,
          termYears: 15,
          projectedEndingNetValue: 55_000_000,
          totalCostOverTerm: 125_000_000,
          notes: 'Higher monthly payments, but 100% home equity owned free and clear in 15 years with zero residual debt.',
        },
        {
          id: '30yr',
          name: '30-Year Fixed Mortgage',
          category: 'Mortgage Term',
          upfrontCost: 8_000_000,
          monthlyOngoingCost: 460_000,
          termYears: 15,
          projectedEndingNetValue: 35_000_000,
          totalCostOverTerm: 90_800_000,
          notes: 'Lower monthly obligation freeing up ₦190,000/mo cash flow, but remaining mortgage principal still owed at year 15.',
        },
      ],
    },
    buyVsRent: {
      title: 'Buy Property vs Rent & Invest Difference',
      horizon: 10,
      scenarios: [
        {
          id: 'buy',
          name: 'Homeownership (Buy & Maintain)',
          category: 'Buy vs Rent',
          upfrontCost: 12_000_000,
          monthlyOngoingCost: 550_000,
          termYears: 10,
          projectedEndingNetValue: 65_000_000,
          totalCostOverTerm: 78_000_000,
          notes: 'Building real estate equity and long-term capital appreciation plus protection against rent increases.',
        },
        {
          id: 'rentInvest',
          name: 'Rent & Invest Surplus Capital',
          category: 'Buy vs Rent',
          upfrontCost: 2_000_000,
          monthlyOngoingCost: 350_000,
          annualGrowthRate: 11.0,
          termYears: 10,
          projectedEndingNetValue: 52_000_000,
          totalCostOverTerm: 44_000_000,
          notes: 'Minimal upfront capital locked up; surplus monthly liquidity channeled into diversified index funds.',
        },
      ],
    },
    debtVsInvest: {
      title: 'Aggressive Debt Payoff vs Index Fund Investing',
      horizon: 5,
      scenarios: [
        {
          id: 'payoff',
          name: 'Aggressive Debt Elimination',
          category: 'Debt Strategy',
          upfrontCost: 0,
          monthlyOngoingCost: 350_000,
          termYears: 5,
          projectedEndingNetValue: 21_000_000,
          totalCostOverTerm: 21_000_000,
          notes: 'Guaranteed risk-free return equal to your loan interest rate with immediate credit score elevation.',
        },
        {
          id: 'invest',
          name: 'Minimum Debt + Market Investing',
          category: 'Investment Allocation',
          upfrontCost: 0,
          monthlyOngoingCost: 350_000,
          annualGrowthRate: 12.0,
          termYears: 5,
          projectedEndingNetValue: 26_500_000,
          totalCostOverTerm: 21_000_000,
          notes: 'Leverages market equity returns if long-term return rate exceeds average debt interest rate.',
        },
      ],
    },
  };

  const [activePresetKey, setActivePresetKey] = useState<string>('mortgage');
  const [scenarios, setScenarios] = useState<ScenarioOption[]>(presets.mortgage.scenarios);

  const handleSelectPreset = (key: string) => {
    setActivePresetKey(key);
    setScenarios(presets[key].scenarios);
  };

  const results = useMemo(() => {
    return compareScenarios({
      comparisonTitle: presets[activePresetKey]?.title || 'Scenario Comparison',
      horizonYears: 10,
      scenarios,
    });
  }, [scenarios, activePresetKey]);

  const barChartData = useMemo(() => {
    return results.scenarios.map((s) => ({
      name: s.name,
      'Total Cost': s.totalCostOverTerm,
      'Ending Net Value': s.projectedEndingNetValue,
    }));
  }, [results]);

  const explainableData: ExplainableResultData = useMemo(() => {
    const s1 = results.scenarios[0];
    const s2 = results.scenarios[1];
    return {
      title: 'Comparative Strategic Trade-Off Analysis',
      summary: `Comparing ${s1 ? s1.name : 'Option A'} against ${s2 ? s2.name : 'Option B'}. The lowest total cash outlay option is "${
        results.scenarios.find((s) => s.id === results.lowestCostScenarioId)?.name || 'N/A'
      }", while the highest projected net wealth creator is "${
        results.scenarios.find((s) => s.id === results.highestEndingValueScenarioId)?.name || 'N/A'
      }".`,
      keyFigures: [
        { label: 'Lowest Total Cost Option', value: results.scenarios.find((s) => s.id === results.lowestCostScenarioId)?.name || 'N/A', highlight: true },
        { label: 'Highest Net Value Option', value: results.scenarios.find((s) => s.id === results.highestEndingValueScenarioId)?.name || 'N/A', highlight: true },
        { label: 'Cost Delta Difference', value: format(results.deltaSummary[0]?.difference || 0) },
        { label: 'Ending Net Value Delta', value: format(results.deltaSummary[2]?.difference || 0) },
      ],
      assumptions: [
        { label: 'Holding Horizon', value: 'Values computed consistently across identical time horizons' },
        { label: 'Opportunity Cost', value: 'Cash flow differences allow alternative investment accumulation' },
      ],
      methodology: 'Side-by-side terminal wealth differential modeling comparing cumulative outflow against asset equity.',
      formulaSteps: [
        {
          name: 'Cumulative Cash Outlay Over Horizon',
          formula: 'Total Cost = Upfront Capital + (Monthly Cost * Term * 12)',
          substituted: 'Evaluated individually per scenario',
          result: 'Compared side-by-side in delta matrix',
          explanation: 'Sum of all liquid cash required to maintain the selected strategy.',
        },
      ],
      disclaimers: [
        'Tax advantages, inflation, and market liquidity differ across real estate and securities asset classes.',
      ],
    };
  }, [results, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Planning & Decisions Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Decision-Support Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Scenario Comparison Tool
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Model alternative financial pathways side-by-side to expose trade-offs in cash flow, total cost, and terminal net worth.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
        </div>
      </div>

      {/* Preset Model Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
          Preset Models:
        </span>
        <button
          type="button"
          onClick={() => handleSelectPreset('mortgage')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
            activePresetKey === 'mortgage'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
          }`}
        >
          15-Yr vs 30-Yr Mortgage
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('buyVsRent')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
            activePresetKey === 'buyVsRent'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
          }`}
        >
          Buy vs Rent Decision
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('debtVsInvest')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
            activePresetKey === 'debtVsInvest'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
          }`}
        >
          Pay Off Debt vs Invest
        </button>
      </div>

      {/* Side-by-Side Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.scenarios.map((scen) => (
          <ScenarioCompareCard
            key={scen.id}
            scenario={scen}
            isLowestCost={scen.id === results.lowestCostScenarioId}
            isHighestValue={scen.id === results.highestEndingValueScenarioId}
            baselineScenario={results.scenarios[0]}
          />
        ))}
      </div>

      {/* Visual Contrast Bar Chart */}
      <Card>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Side-by-Side Trade-Off Comparison
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Comparing cumulative costs over horizon against projected ending net value.
        </p>

        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(val) => `${(val / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: number) => format(val)} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Total Cost" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Ending Net Value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
