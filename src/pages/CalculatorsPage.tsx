import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Flame,
  Wallet,
  Zap,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CALCULATORS_LIST } from '../data/calculatorMetadata';
import { CalculatorId } from '../types/calculators';
import { LoanCalculator } from '../calculators/LoanCalculator';
import { SavingsCalculator } from '../calculators/SavingsCalculator';
import { CompoundInterestCalculator } from '../calculators/CompoundInterestCalculator';
import { InvestmentCalculator } from '../calculators/InvestmentCalculator';
import { DebtPayoffCalculator } from '../calculators/DebtPayoffCalculator';
import { BudgetCalculator } from '../calculators/BudgetCalculator';
import { CurrencyConverterCalculator } from '../calculators/CurrencyConverterCalculator';

interface CalculatorsPageProps {
  initialCalculatorId?: CalculatorId | null;
  onSelectCalculator?: (id: CalculatorId) => void;
}

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({
  initialCalculatorId = null,
  onSelectCalculator,
}) => {
  const getCalcFromUrl = (): CalculatorId | null => {
    try {
      const search = new URLSearchParams(window.location.search);
      const param = search.get('calc');
      if (param === 'loan') return 'loan';
      if (param === 'savings') return 'savings';
      if (param === 'compound' || param === 'compound-interest') return 'compound-interest';
      if (param === 'investment') return 'investment';
      if (param === 'debt' || param === 'debt-payoff') return 'debt-payoff';
      if (param === 'budget') return 'budget';
      if (param === 'currency' || param === 'currency-converter') return 'currency-converter';
    } catch {
      // ignore
    }
    return null;
  };

  const [activeCalcId, setActiveCalcId] = useState<CalculatorId | null>(() => {
    return initialCalculatorId !== undefined ? initialCalculatorId : getCalcFromUrl();
  });
  const categories = ['All', 'Borrowing', 'Growth', 'Planning'] as const;
  type CategoryTab = (typeof categories)[number];

  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('All');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (initialCalculatorId !== undefined) {
      setActiveCalcId(initialCalculatorId);
    }
  }, [initialCalculatorId]);

  const filteredCalculators = CALCULATORS_LIST.filter((calc) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Growth') return calc.category === 'Growing';
    return calc.category === selectedCategory;
  });

  const handleCategoryClick = (cat: CategoryTab) => {
    if (selectedCategory === cat) {
      setIsCollapsed((prev) => !prev);
    } else {
      setSelectedCategory(cat);
      setIsCollapsed(false);
    }
  };

  const getCalcIcon = (id: CalculatorId) => {
    switch (id) {
      case 'loan':
        return <CreditCard className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'compound-interest':
        return <Zap className="w-4 h-4" />;
      case 'investment':
        return <BarChart3 className="w-4 h-4" />;
      case 'debt-payoff':
        return <Flame className="w-4 h-4" />;
      case 'budget':
        return <Wallet className="w-4 h-4" />;
      case 'currency-converter':
        return <ArrowRightLeft className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const renderActiveCalculator = () => {
    if (!activeCalcId) return null;
    switch (activeCalcId) {
      case 'loan':
        return <LoanCalculator />;
      case 'savings':
        return <SavingsCalculator />;
      case 'compound-interest':
        return <CompoundInterestCalculator />;
      case 'investment':
        return <InvestmentCalculator />;
      case 'debt-payoff':
        return <DebtPayoffCalculator />;
      case 'budget':
        return <BudgetCalculator />;
      case 'currency-converter':
        return <CurrencyConverterCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Pills & Quick Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={
                    isSelected
                      ? isCollapsed
                        ? `Expand ${cat}`
                        : `Collapse ${cat}`
                      : `Filter by ${cat}`
                  }
                >
                  <span>{cat}</span>
                  {isSelected &&
                    (isCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-200" />
                    ))}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:block">
              {filteredCalculators.length} available
            </span>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={
                isCollapsed
                  ? `Expand ${selectedCategory} calculators`
                  : `Collapse ${selectedCategory} calculators`
              }
              aria-expanded={!isCollapsed}
            >
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Calculator Tab Buttons Bar (Collapsible) */}
        {!isCollapsed ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 transition-all">
            {filteredCalculators.map((calc) => {
              const isActive = activeCalcId === calc.id;
              return (
                <button
                  key={calc.id}
                  onClick={() => {
                    setActiveCalcId(calc.id);
                    onSelectCalculator?.(calc.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {getCalcIcon(calc.id)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {calc.category === 'Growing' ? 'GROWTH' : calc.category}
                    </span>
                  </div>
                  <span className="text-xs font-bold leading-snug line-clamp-1">
                    {calc.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div
            onClick={() => setIsCollapsed(false)}
            className="p-3.5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all"
            title="Click to expand calculators"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedCategory} Calculators
              </span>
              <span>•</span>
              <span>{filteredCalculators.length} items hidden (click to expand)</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>Show Calculators</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Active Calculator Component View */}
      {activeCalcId ? (
        <div className="pt-2">
          {renderActiveCalculator()}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Choose a Calculator to Get Started
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Select any financial tool from the options above or the sidebar to view calculations, schedules, and charts.
          </p>
        </div>
      )}
    </div>
  );
};
