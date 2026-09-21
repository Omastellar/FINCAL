import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Calculator } from 'lucide-react';
import { ExplainableResultData } from '../../types/calculators';

interface ExplainableResultProps {
  data: ExplainableResultData;
  defaultOpen?: boolean;
}

export const ExplainableResult: React.FC<ExplainableResultProps> = ({
  data,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-slate-100/70 hover:bg-slate-200/60 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              How this was calculated
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formulas, assumptions, and decision methodology
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{isOpen ? 'Hide breakdown' : 'View formulas & assumptions'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-5 text-sm">
          {/* Executive Summary */}
          {data.summary && (
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
              <span className="font-semibold text-slate-900 dark:text-white block mb-1">Methodology & Insight:</span>
              {data.summary}
            </div>
          )}

          {/* Key Figures Grid */}
          {data.keyFigures && data.keyFigures.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Key Computed Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.keyFigures.map((fig, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      fig.highlight
                        ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700/70'
                    }`}
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">{fig.label}</div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {fig.value}
                    </div>
                    {fig.hint && (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {fig.hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mathematical Formulas & Steps */}
          {data.formulaSteps && data.formulaSteps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Mathematical Formulas & Substitution
              </h4>
              <div className="space-y-3">
                {data.formulaSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {step.name}
                    </div>
                    <div className="mt-1 font-mono text-xs bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto">
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{step.formula}</div>
                      {step.substituted && (
                        <div className="text-slate-600 dark:text-slate-400 mt-1">
                          = {step.substituted}
                        </div>
                      )}
                      {step.result && (
                        <div className="text-slate-900 dark:text-white font-bold mt-1">
                          = {step.result}
                        </div>
                      )}
                    </div>
                    {step.explanation && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicit Assumptions */}
          {data.assumptions && data.assumptions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Underlying Assumptions
              </h4>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60">
                {data.assumptions.map((item, idx) => (
                  <div key={idx} className="px-3.5 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance & Planning Disclaimers */}
          {data.disclaimers && data.disclaimers.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Decision Support & Advisory Notice:</span>
                {data.disclaimers.map((disc, idx) => (
                  <p key={idx} className="leading-relaxed">
                    • {disc}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
