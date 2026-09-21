import React, { useState, useMemo, useEffect } from 'react';
import { Landmark, TrendingUp, TrendingDown, DollarSign, PieChart, ShieldCheck, Download } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateNetWorth } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { DonutChart } from '../components/charts/DonutChart';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { AssetBreakdown, LiabilityBreakdown, ExplainableResultData } from '../types/calculators';

export const NetWorthCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { copyShareableLink, copied } = useShareableState();

  const [assets, setAssets] = useState<AssetBreakdown>({
    cashAndSavings: 0,
    realEstate: 0,
    retirementAccounts: 0,
    taxableInvestments: 0,
    vehiclesAndValuables: 0,
    businessEquity: 0,
  });

  const [liabilities, setLiabilities] = useState<LiabilityBreakdown>({
    mortgages: 0,
    autoLoans: 0,
    studentLoans: 0,
    creditCards: 0,
    personalLoans: 0,
    otherLiabilities: 0,
  });

  const results = useMemo(() => {
    return calculateNetWorth({ assets, liabilities });
  }, [assets, liabilities]);

  const assetDonutData = useMemo(() => {
    return results.assetDistribution.map((a) => ({
      name: a.category,
      value: a.amount,
      color: a.color,
    }));
  }, [results]);

  const liabilityDonutData = useMemo(() => {
    return results.liabilityDistribution.map((l) => ({
      name: l.category,
      value: l.amount,
      color: l.color,
    }));
  }, [results]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Net Worth & Solvency Assessment',
      summary: `Your total asset base is ${format(results.totalAssets)} counterbalanced by ${format(results.totalLiabilities)} in liabilities, producing a net worth of ${format(results.netWorth)}. Your debt-to-asset ratio is ${results.debtToAssetRatio.toFixed(1)}%, with ${format(results.liquidAssets)} (${results.liquidRatio.toFixed(1)}%) in liquid reserves.`,
      keyFigures: [
        { label: 'Total Net Worth', value: format(results.netWorth), highlight: true },
        { label: 'Total Assets', value: format(results.totalAssets) },
        { label: 'Total Liabilities', value: format(results.totalLiabilities) },
        { label: 'Debt-to-Asset Ratio', value: `${results.debtToAssetRatio.toFixed(1)}%`, hint: 'Lower indicates higher equity resilience' },
        { label: 'Liquid Reserve Capital', value: format(results.liquidAssets), hint: `${results.liquidRatio.toFixed(1)}% of total asset base` },
      ],
      assumptions: [
        { label: 'Real Estate Valuation', value: 'Current fair market value of primary residence and investment properties' },
        { label: 'Depreciation on Vehicles', value: 'Vehicles should be valued at immediate secondary resale value, not original purchase price' },
        { label: 'Liabilities Scope', value: 'Sum of all unpaid principal balances across revolving and fixed debt' },
      ],
      methodology: 'Universal balance sheet equation: Net Worth = Total Assets - Total Liabilities.',
      formulaSteps: [
        {
          name: 'Net Worth Calculation',
          formula: 'Net Worth = Total Assets - Total Liabilities',
          substituted: `${format(results.totalAssets)} - ${format(results.totalLiabilities)}`,
          result: format(results.netWorth),
          explanation: 'Fundamental metric of overall personal balance sheet solvency and wealth.',
        },
        {
          name: 'Debt-to-Asset Leverage Ratio',
          formula: 'Ratio = (Total Liabilities / Total Assets) * 100',
          substituted: `(${format(results.totalLiabilities)} / ${format(results.totalAssets)}) * 100`,
          result: `${results.debtToAssetRatio.toFixed(1)}%`,
          explanation: 'Indicates how much of your total assets are encumbered by creditor debt.',
        },
      ],
      disclaimers: [
        'Illiquid assets such as private business equity or personal collectibles may require a discount for quick liquidation during market stress.',
        'Deferred taxes on retirement accounts (if applicable) are not deducted from gross asset valuations.',
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
              Budget & Debt Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Personal Balance Sheet Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Net Worth & Asset Allocation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track total assets vs outstanding liabilities, leverage ratios, and liquid safety cushions.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Net Worth"
          value={format(results.netWorth)}
          icon={<Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue="Assets minus Liabilities"
          variant="primary"
        />
        <MetricCard
          label="Total Asset Value"
          value={format(results.totalAssets)}
          icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue="Total wealth under management"
        />
        <MetricCard
          label="Total Liabilities"
          value={format(results.totalLiabilities)}
          icon={<TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />}
          subValue="All creditor debt obligations"
        />
        <MetricCard
          label="Debt-to-Asset Ratio"
          value={`${results.debtToAssetRatio.toFixed(1)}%`}
          icon={<ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={`Liquid reserve: ${format(results.liquidAssets)}`}
        />
      </div>

      {/* Assets & Liabilities Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assets Form */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Assets (What You Own)
            </h2>
            <div className="space-y-4">
              <SliderField
                label="Cash & Liquid Bank Savings"
                value={assets.cashAndSavings}
                onChange={(val) => setAssets({ ...assets, cashAndSavings: val })}
                min={0}
                max={50_000_000}
                step={250_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Real Estate Market Value"
                value={assets.realEstate}
                onChange={(val) => setAssets({ ...assets, realEstate: val })}
                min={0}
                max={250_000_000}
                step={1_000_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Retirement Accounts & Pensions"
                value={assets.retirementAccounts}
                onChange={(val) => setAssets({ ...assets, retirementAccounts: val })}
                min={0}
                max={100_000_000}
                step={500_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Taxable Stocks & Investments"
                value={assets.taxableInvestments}
                onChange={(val) => setAssets({ ...assets, taxableInvestments: val })}
                min={0}
                max={50_000_000}
                step={250_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Vehicles & Valuables"
                value={assets.vehiclesAndValuables}
                onChange={(val) => setAssets({ ...assets, vehiclesAndValuables: val })}
                min={0}
                max={30_000_000}
                step={250_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Business Equity / Ownership"
                value={assets.businessEquity}
                onChange={(val) => setAssets({ ...assets, businessEquity: val })}
                min={0}
                max={50_000_000}
                step={500_000}
                prefix={currencyConfig.symbol}
              />
            </div>
          </Card>
        </div>

        {/* Liabilities Form */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Liabilities (What You Owe)
            </h2>
            <div className="space-y-4">
              <SliderField
                label="Mortgage Balance"
                value={liabilities.mortgages}
                onChange={(val) => setLiabilities({ ...liabilities, mortgages: val })}
                min={0}
                max={150_000_000}
                step={500_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Auto Loans"
                value={liabilities.autoLoans}
                onChange={(val) => setLiabilities({ ...liabilities, autoLoans: val })}
                min={0}
                max={20_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Student Loans"
                value={liabilities.studentLoans}
                onChange={(val) => setLiabilities({ ...liabilities, studentLoans: val })}
                min={0}
                max={10_000_000}
                step={50_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Credit Card Balances"
                value={liabilities.creditCards}
                onChange={(val) => setLiabilities({ ...liabilities, creditCards: val })}
                min={0}
                max={10_000_000}
                step={50_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Personal Loans"
                value={liabilities.personalLoans}
                onChange={(val) => setLiabilities({ ...liabilities, personalLoans: val })}
                min={0}
                max={20_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
              />
              <SliderField
                label="Other Liabilities"
                value={liabilities.otherLiabilities}
                onChange={(val) => setLiabilities({ ...liabilities, otherLiabilities: val })}
                min={0}
                max={10_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Asset & Liability Allocation Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Asset Distribution
          </h2>
          <div className="h-64">
            <DonutChart
              data={assetDonutData}
              title="Asset Breakdown"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Liability Distribution
          </h2>
          <div className="h-64">
            <DonutChart
              data={liabilityDonutData}
              title="Liability Breakdown"
            />
          </div>
        </Card>
      </div>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
