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
  Sparkles,
  Home,
  Compass,
  Car,
  Target,
  UserCheck,
  Activity,
  Landmark,
  Columns3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageView } from '../types/navigation';
import { CALCULATORS_LIST } from '../data/calculatorMetadata';
import { CalculatorId, CalculatorSuite } from '../types/calculators';

// All Calculator Modules
import { LoanCalculator } from '../calculators/LoanCalculator';
import { MortgageCalculator } from '../calculators/MortgageCalculator';
import { HomeAffordabilityCalculator } from '../calculators/HomeAffordabilityCalculator';
import { AutoLoanCalculator } from '../calculators/AutoLoanCalculator';
import { PersonalLoanCalculator } from '../calculators/PersonalLoanCalculator';
import { SavingsCalculator } from '../calculators/SavingsCalculator';
import { SavingsGoalCalculator } from '../calculators/SavingsGoalCalculator';
import { CompoundInterestCalculator } from '../calculators/CompoundInterestCalculator';
import { InvestmentCalculator } from '../calculators/InvestmentCalculator';
import { RetirementCalculator } from '../calculators/RetirementCalculator';
import { BudgetCalculator } from '../calculators/BudgetCalculator';
import { DebtPayoffCalculator } from '../calculators/DebtPayoffCalculator';
import { MultiDebtPayoffCalculator } from '../calculators/MultiDebtPayoffCalculator';
import { DTICalculator } from '../calculators/DTICalculator';
import { NetWorthCalculator } from '../calculators/NetWorthCalculator';
import { FinancialGoalPlanner } from '../calculators/FinancialGoalPlanner';
import { ScenarioComparisonCalculator } from '../calculators/ScenarioComparisonCalculator';
import { CurrencyConverterCalculator } from '../calculators/CurrencyConverterCalculator';

interface CalculatorsPageProps {
  initialCalculatorId?: CalculatorId | null;
  onSelectCalculator?: (id: CalculatorId) => void;
  onNavigate?: (page: PageView, calcId?: CalculatorId) => void;
}

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({
  initialCalculatorId = null,
  onSelectCalculator,
  onNavigate,
}) => {
  const { isAuthenticated } = useAuth();

  const getCalcFromUrl = (): CalculatorId | null => {
    try {
      const search = new URLSearchParams(window.location.search);
      const param = search.get('calc');
      if (!param) return null;
      if (param === 'loan') return 'loan';
      if (param === 'mortgage') return 'mortgage';
      if (param === 'home-affordability' || param === 'affordability') return 'home-affordability';
      if (param === 'auto-loan' || param === 'auto') return 'auto-loan';
      if (param === 'personal-loan' || param === 'personal') return 'personal-loan';
      if (param === 'savings') return 'savings';
      if (param === 'savings-goal' || param === 'goal') return 'savings-goal';
      if (param === 'compound' || param === 'compound-interest') return 'compound-interest';
      if (param === 'investment') return 'investment';
      if (param === 'retirement') return 'retirement';
      if (param === 'budget') return 'budget';
      if (param === 'debt' || param === 'debt-payoff') return 'debt-payoff';
      if (param === 'multi-debt-payoff' || param === 'multi-debt') return 'multi-debt-payoff';
      if (param === 'dti') return 'dti';
      if (param === 'net-worth') return 'net-worth';
      if (param === 'financial-goals' || param === 'goals') return 'financial-goals';
      if (param === 'scenarios' || param === 'scenario') return 'scenarios';
      if (param === 'currency' || param === 'currency-converter') return 'currency-converter';
    } catch {
      // ignore
    }
    return null;
  };

  const [activeCalcId, setActiveCalcId] = useState<CalculatorId | null>(() => {
    return initialCalculatorId !== undefined ? initialCalculatorId : getCalcFromUrl();
  });

  const categories = [
    'All',
    'Loans',
    'Savings & Investments',
    'Budget & Debt',
    'Planning & Decisions',
    'Borrowing',
    'Growth',
    'Planning',
  ] as const;

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
    if (selectedCategory === 'Loans') return calc.suite === 'Loans';
    if (selectedCategory === 'Savings & Investments') return calc.suite === 'Savings & Investments';
    if (selectedCategory === 'Budget & Debt') return calc.suite === 'Budget & Debt';
    if (selectedCategory === 'Planning & Decisions') return calc.suite === 'Planning & Decisions';
    if (selectedCategory === 'Growth') return calc.category === 'Growing' || calc.suite === 'Savings & Investments';
    if (selectedCategory === 'Borrowing') return calc.category === 'Borrowing' || calc.suite === 'Loans';
    if (selectedCategory === 'Planning') return calc.category === 'Planning' || calc.suite === 'Planning & Decisions';
    return calc.category === selectedCategory || calc.suite === selectedCategory;
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
      case 'mortgage':
        return <Home className="w-4 h-4" />;
      case 'home-affordability':
        return <Compass className="w-4 h-4" />;
      case 'auto-loan':
        return <Car className="w-4 h-4" />;
      case 'personal-loan':
        return <CreditCard className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'savings-goal':
        return <Target className="w-4 h-4" />;
      case 'compound-interest':
        return <Zap className="w-4 h-4" />;
      case 'investment':
        return <BarChart3 className="w-4 h-4" />;
      case 'retirement':
        return <UserCheck className="w-4 h-4" />;
      case 'budget':
        return <Wallet className="w-4 h-4" />;
      case 'debt-payoff':
        return <Flame className="w-4 h-4" />;
      case 'multi-debt-payoff':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'dti':
        return <Activity className="w-4 h-4" />;
      case 'net-worth':
        return <Landmark className="w-4 h-4" />;
      case 'financial-goals':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'scenarios':
        return <Columns3 className="w-4 h-4" />;
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
      case 'mortgage':
        return <MortgageCalculator />;
      case 'home-affordability':
        return <HomeAffordabilityCalculator />;
      case 'auto-loan':
        return <AutoLoanCalculator />;
      case 'personal-loan':
        return <PersonalLoanCalculator />;
      case 'savings':
        return <SavingsCalculator />;
      case 'savings-goal':
        return <SavingsGoalCalculator />;
      case 'compound-interest':
        return <CompoundInterestCalculator />;
      case 'investment':
        return <InvestmentCalculator />;
      case 'retirement':
        return <RetirementCalculator />;
      case 'budget':
        return <BudgetCalculator />;
      case 'debt-payoff':
        return <DebtPayoffCalculator />;
      case 'multi-debt-payoff':
        return <MultiDebtPayoffCalculator />;
      case 'dti':
        return <DTICalculator />;
      case 'net-worth':
        return <NetWorthCalculator />;
      case 'financial-goals':
        return <FinancialGoalPlanner />;
      case 'scenarios':
        return <ScenarioComparisonCalculator />;
      case 'currency-converter':
        return <CurrencyConverterCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Non-registered Guest Mode Notice */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Guest Access Active:</strong> You have unrestricted access to all 18 institutional financial engines. Your calculation data will not be saved permanently to your portfolio until you{' '}
              <button
                type="button"
                onClick={() => onNavigate?.('login')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                register or sign in
              </button>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('login')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Sign In / Register
          </button>
        </div>
      )}

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 transition-all">
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
                      {calc.suite ? calc.suite.split(' ')[0] : calc.category}
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
            Choose a Financial Engine to Get Started
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Select any tool from the 4 suites above or use the sidebar navigation to run simulations, view schedules, and inspect mathematical proofs.
          </p>
        </div>
      )}
    </div>
  );
};
