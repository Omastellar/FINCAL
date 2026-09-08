import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, RotateCcw, PieChart as PieIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateBudget } from '../utils/financialMath';
import { BudgetInputs } from '../types/calculators';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { DonutChart } from '../components/charts/DonutChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';

export const BudgetCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  // Income state
  const [salary, setSalary] = useState<number>(() => {
    const val = initialParams.get('salary');
    return val ? parseFloat(val) : 650_000;
  });
  const [otherIncome, setOtherIncome] = useState<number>(() => {
    const val = initialParams.get('other');
    return val ? parseFloat(val) : 100_000;
  });

  // Expense state
  const [housing, setHousing] = useState<number>(() => {
    const val = initialParams.get('housing');
    return val ? parseFloat(val) : 200_000;
  });
  const [food, setFood] = useState<number>(() => {
    const val = initialParams.get('food');
    return val ? parseFloat(val) : 110_000;
  });
  const [transportation, setTransportation] = useState<number>(() => {
    const val = initialParams.get('transport');
    return val ? parseFloat(val) : 55_000;
  });
  const [utilities, setUtilities] = useState<number>(() => {
    const val = initialParams.get('utils');
    return val ? parseFloat(val) : 40_000;
  });
  const [debtPayments, setDebtPayments] = useState<number>(() => {
    const val = initialParams.get('debt');
    return val ? parseFloat(val) : 35_000;
  });
  const [entertainment, setEntertainment] = useState<number>(() => {
    const val = initialParams.get('fun');
    return val ? parseFloat(val) : 45_000;
  });
  const [otherExpenses, setOtherExpenses] = useState<number>(() => {
    const val = initialParams.get('misc');
    return val ? parseFloat(val) : 30_000;
  });

  useEffect(() => {
    updateUrlParams({
      calc: 'budget',
      salary,
      other: otherIncome,
      housing,
      food,
      transport: transportation,
      utils: utilities,
      debt: debtPayments,
      fun: entertainment,
      misc: otherExpenses,
    });
  }, [
    salary,
    otherIncome,
    housing,
    food,
    transportation,
    utilities,
    debtPayments,
    entertainment,
    otherExpenses,
    updateUrlParams,
  ]);

  // Calculation
  const results = useMemo(() => {
    const inputs: BudgetInputs = {
      salary,
      otherIncome,
      expenses: {
        housing,
        food,
        transportation,
        utilities,
        debtPayments,
        entertainment,
        otherExpenses,
      },
    };
    return calculateBudget(inputs);
  }, [
    salary,
    otherIncome,
    housing,
    food,
    transportation,
    utilities,
    debtPayments,
    entertainment,
    otherExpenses,
  ]);

  // Donut chart items
  const expenseChartData = useMemo(() => {
    return results.expenseBreakdown.map((item) => ({
      name: item.category,
      value: item.amount,
      color: item.color,
    }));
  }, [results.expenseBreakdown]);

  // Comparison Bar items
  const comparisonData = useMemo(() => {
    return [
      { name: 'Total Income', amount: results.totalIncome, color: '#10b981' },
      { name: 'Total Expenses', amount: results.totalExpenses, color: '#ef4444' },
      {
        name: results.remainingBalance >= 0 ? 'Monthly Surplus' : 'Monthly Deficit',
        amount: Math.abs(results.remainingBalance),
        color: results.remainingBalance >= 0 ? '#3b82f6' : '#f97316',
      },
    ];
  }, [results]);

  // Insights
  const insights = useMemo(() => {
    const list: string[] = [];
    if (results.remainingBalance > 0) {
      list.push(
        `You have a healthy monthly surplus of ${format(results.remainingBalance)}, yielding a savings rate of ${results.savingsRate.toFixed(1)}%.`
      );
    } else if (results.remainingBalance < 0) {
      list.push(
        `Deficit alert: Expenses exceed income by ${format(Math.abs(results.remainingBalance))}. Consider lowering flexible categories like entertainment or dining.`
      );
    } else {
      list.push(`You are breaking even with exact zero surplus remaining.`);
    }

    const needsPct = results.rule50_30_20.needs.percentage;
    list.push(
      `Under the 50/30/20 guideline: Needs comprise ${needsPct.toFixed(1)}% of your income (recommended ≤ 50%), and Wants comprise ${results.rule50_30_20.wants.percentage.toFixed(1)}% (recommended ≤ 30%).`
    );

    return list;
  }, [results, format]);

  const resetDefaults = () => {
    setSalary(650_000);
    setOtherIncome(100_000);
    setHousing(200_000);
    setFood(110_000);
    setTransportation(55_000);
    setUtilities(40_000);
    setDebtPayments(35_000);
    setEntertainment(45_000);
    setOtherExpenses(30_000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budget Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Map out monthly income and expenses, calculate your true savings rate, and optimize your financial balance.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Income Card */}
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
              Monthly Income
            </h3>
            <InputField
              label="Primary Salary / Wages"
              value={salary}
              onChange={setSalary}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Other Income / Side Business"
              value={otherIncome}
              onChange={setOtherIncome}
              prefix={currencyConfig.symbol}
            />
          </Card>

          {/* Expenses Card */}
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-rose-500" />
              Monthly Expenses
            </h3>
            <InputField
              label="Housing (Rent/Mortgage)"
              value={housing}
              onChange={setHousing}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Food & Groceries"
              value={food}
              onChange={setFood}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Transportation / Fuel"
              value={transportation}
              onChange={setTransportation}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Utilities & Internet"
              value={utilities}
              onChange={setUtilities}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Debt & Loan Payments"
              value={debtPayments}
              onChange={setDebtPayments}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Entertainment & Leisure"
              value={entertainment}
              onChange={setEntertainment}
              prefix={currencyConfig.symbol}
            />
            <InputField
              label="Other Miscellaneous Expenses"
              value={otherExpenses}
              onChange={setOtherExpenses}
              prefix={currencyConfig.symbol}
            />
          </Card>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label="Total Income"
              value={format(results.totalIncome)}
              subValue="Combined earnings"
              variant="success"
            />
            <MetricCard
              label="Total Expenses"
              value={format(results.totalExpenses)}
              subValue={`${results.totalIncome > 0 ? ((results.totalExpenses / results.totalIncome) * 100).toFixed(1) : 0}% of income`}
              variant="warning"
            />
            <MetricCard
              label={results.remainingBalance >= 0 ? 'Remaining Surplus' : 'Budget Deficit'}
              value={format(results.remainingBalance)}
              subValue={results.remainingBalance >= 0 ? 'Available to invest/save' : 'Deficit'}
              variant={results.remainingBalance >= 0 ? 'primary' : 'warning'}
            />
            <MetricCard
              label="Savings Rate"
              value={`${results.savingsRate.toFixed(1)}%`}
              subValue="Target: 20% or higher"
              variant="info"
            />
          </div>

          {/* Insights */}
          <InsightBanner
            insights={insights}
            variant={results.remainingBalance < 0 ? 'warning' : 'insight'}
          />

          {/* 50/30/20 Framework Progress */}
          <Card className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              50 / 30 / 20 Budget Rule Benchmark
            </h4>
            <div className="space-y-3 text-xs">
              {/* Needs */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Needs (Target 50%)</span>
                  <span>{results.rule50_30_20.needs.percentage.toFixed(1)}% ({format(results.rule50_30_20.needs.actual)})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      results.rule50_30_20.needs.percentage <= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, results.rule50_30_20.needs.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Wants */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Wants (Target 30%)</span>
                  <span>{results.rule50_30_20.wants.percentage.toFixed(1)}% ({format(results.rule50_30_20.wants.actual)})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      results.rule50_30_20.wants.percentage <= 30 ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, results.rule50_30_20.wants.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Savings */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Savings / Investing (Target 20%)</span>
                  <span>{results.rule50_30_20.savings.percentage.toFixed(1)}% ({format(results.rule50_30_20.savings.actual)})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${Math.min(100, results.rule50_30_20.savings.percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <DonutChart
                data={expenseChartData}
                title="Expense Breakdown by Category"
                height={220}
              />
            </Card>

            <Card>
              <ComparisonBarChart
                data={comparisonData}
                title="Monthly Cash Flow Overview"
                height={220}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
