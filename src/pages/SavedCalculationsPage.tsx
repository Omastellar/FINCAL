import React from 'react';
import {
  Bookmark,
  Calendar,
  Trash2,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  Coins,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageView } from '../types/navigation';
import { CalculatorId } from '../types/calculators';

interface SavedCalculationsPageProps {
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
}

export const SavedCalculationsPage: React.FC<SavedCalculationsPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, savedCalculations, deleteCalculation, clearSavedCalculations } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <Bookmark className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sign In to View Saved Calculations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Log in to save amortization schedules, investment projections, and retirement portfolios.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
          >
            Sign In / Register
          </button>
          <button
            onClick={() => onNavigate('calculators')}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            Explore Calculators
          </button>
        </div>
      </div>
    );
  }

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedCalculations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fincal_calculations_${user.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-emerald-500" />
            My Saved Calculations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Logged in as <strong className="text-emerald-600 dark:text-emerald-400">{user.name}</strong> • {savedCalculations.length} saved scenario{savedCalculations.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedCalculations.length > 0 && (
            <>
              <button
                onClick={exportToJson}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button
                onClick={clearSavedCalculations}
                className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </>
          )}
          <button
            onClick={() => onNavigate('calculators')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Calculation
          </button>
        </div>
      </div>

      {/* List or Empty State */}
      {savedCalculations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Calculator className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white">No Saved Calculations Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Run any loan, mortgage, or investment calculation, and click the "Save Calculation" bookmark to store it in your portfolio.
            </p>
          </div>
          <button
            onClick={() => onNavigate('calculators')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            Open Calculators <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedCalculations.map((calc) => (
            <div
              key={calc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {calc.calculatorId.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(calc.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {calc.title}
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Computed Summary:</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {calc.summaryResult}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onNavigate('calculators', calc.calculatorId)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                >
                  Launch Calculator <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteCalculation(calc.id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete calculation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
