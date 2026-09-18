import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
  Bookmark,
  Check,
  ShieldCheck,
  Globe2,
  Sliders,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES, CurrencyCode } from '../types/currency';
import { calculateCurrencyConversion } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { InsightBanner } from '../components/common/InsightBanner';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const CurrencyConverterCalculator: React.FC = () => {
  const { currency: globalCurrency } = useCurrency();
  const { user, isAuthenticated, saveCalculation } = useAuth();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  // State
  const [amount, setAmount] = useState<number>(() => {
    const val = initialParams.get('amount');
    return val ? parseFloat(val) : 1000;
  });

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(() => {
    const val = initialParams.get('from') as CurrencyCode;
    if (val && CURRENCIES[val]) return val;
    return 'USD';
  });

  const [toCurrency, setToCurrency] = useState<CurrencyCode>(() => {
    const val = initialParams.get('to') as CurrencyCode;
    if (val && CURRENCIES[val]) return val;
    return 'NGN';
  });

  const [transferFeePct, setTransferFeePct] = useState<number>(() => {
    const val = initialParams.get('fee');
    return val ? parseFloat(val) : 0;
  });

  const [useCustomRate, setUseCustomRate] = useState<boolean>(() => {
    return initialParams.get('custom') === '1';
  });

  const [customRate, setCustomRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 0;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync with URL params
  useEffect(() => {
    updateUrlParams({
      calc: 'currency-converter',
      amount,
      from: fromCurrency,
      to: toCurrency,
      fee: transferFeePct,
      custom: useCustomRate ? '1' : '',
      rate: useCustomRate && customRate > 0 ? customRate : '',
    });
  }, [amount, fromCurrency, toCurrency, transferFeePct, useCustomRate, customRate]);

  // Perform calculation
  const results = useMemo(() => {
    return calculateCurrencyConversion({
      amount,
      fromCurrency,
      toCurrency,
      transferFeePct,
      customRate: useCustomRate && customRate > 0 ? customRate : undefined,
    });
  }, [amount, fromCurrency, toCurrency, transferFeePct, useCustomRate, customRate]);

  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (useCustomRate && customRate > 0) {
      setCustomRate(Math.round((1 / customRate) * 10000) / 10000);
    }
  };

  // Reset defaults
  const handleReset = () => {
    setAmount(1000);
    setFromCurrency('USD');
    setToCurrency('NGN');
    setTransferFeePct(0);
    setUseCustomRate(false);
    setCustomRate(0);
  };

  // Save calculation
  const handleSave = () => {
    const summary = `${formatCurrency(amount, fromCurrency)} = ${formatCurrency(results.netConvertedAmount, toCurrency)}`;
    saveCalculation({
      calculatorId: 'currency-converter',
      title: `${fromCurrency} to ${toCurrency} Exchange`,
      inputs: { amount, fromCurrency, toCurrency, transferFeePct, customRate },
      summaryResult: summary,
      currency: toCurrency,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Preset quick buttons
  const presetAmounts = fromCurrency === 'NGN'
    ? [50_000, 100_000, 250_000, 500_000, 1_000_000]
    : [100, 500, 1_000, 2_500, 5_000];

  const currencyList = Object.keys(CURRENCIES) as CurrencyCode[];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            Currency Converter
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time cross currency exchange, remittance spread fee simulation, and global comparison matrix.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved!
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-emerald-500" /> Save
              </>
            )}
          </button>
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Coins className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Exchange Parameters</h3>
            </div>
            <div className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Amount to Convert
                  </label>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {CURRENCIES[fromCurrency].symbol} {formatNumber(amount)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {CURRENCIES[fromCurrency].symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                        amount === preset
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {CURRENCIES[fromCurrency].symbol}{formatNumber(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Pair Selector with Swap */}
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                {/* From Currency */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    From Currency
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {currencyList.map((code) => (
                      <option key={code} value={code}>
                        {CURRENCIES[code].flag || ''} {code} - {CURRENCIES[code].name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-6">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-all flex items-center justify-center shadow-xs hover:rotate-180 duration-300"
                    title="Swap From and To currencies"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Currency */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    To Currency
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {currencyList.map((code) => (
                      <option key={code} value={code}>
                        {CURRENCIES[code].flag || ''} {code} - {CURRENCIES[code].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transfer Fee Slider */}
              <SliderField
                label="Bank / Remittance Spread Fee (%)"
                value={transferFeePct}
                onChange={setTransferFeePct}
                min={0}
                max={5}
                step={0.1}
                suffix="%"
                helperText="Simulate payment gateway or foreign transfer spreads (typically 1.0% - 2.5%)"
              />

              {/* Custom Rate Override Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={useCustomRate}
                      onChange={(e) => setUseCustomRate(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Custom Exchange Rate Override</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Parallel / Spot Market</span>
                </div>

                {useCustomRate && (
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      1 {fromCurrency} = ? {toCurrency}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={customRate || results.exchangeRate}
                      onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Output Card & Metrics */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Converted Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Exchange Rate Quotation
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {fromCurrency} / {toCurrency}
                </div>
              </div>

              {/* Huge Converted Amount */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-400">
                  {formatCurrency(amount, fromCurrency)} equals:
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 tracking-tight flex items-baseline gap-2">
                  <span>{formatCurrency(results.netConvertedAmount, toCurrency)}</span>
                </div>
                {transferFeePct > 0 && (
                  <div className="text-xs text-slate-400">
                    Gross: {formatCurrency(results.grossConvertedAmount, toCurrency)} • Fee ({transferFeePct}%): -{formatCurrency(results.feeAmount, toCurrency)}
                  </div>
                )}
              </div>

              {/* Rate Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-[11px] text-slate-400">Direct Conversion Rate</div>
                  <div className="text-sm font-bold text-white font-mono">
                    1 {fromCurrency} = {results.exchangeRate < 1 ? results.exchangeRate.toFixed(6) : results.exchangeRate.toFixed(4)} {toCurrency}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-[11px] text-slate-400">Inverse Cross Rate</div>
                  <div className="text-sm font-bold text-white font-mono">
                    1 {toCurrency} = {results.inverseRate < 1 ? results.inverseRate.toFixed(6) : results.inverseRate.toFixed(4)} {fromCurrency}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Gross Value"
              value={formatCurrency(results.grossConvertedAmount, toCurrency)}
              subValue={`Before ${transferFeePct}% spread fee`}
              variant="default"
            />
            <MetricCard
              label="Net Received"
              value={formatCurrency(results.netConvertedAmount, toCurrency)}
              subValue={transferFeePct > 0 ? `After fee deduction` : 'Zero fee applied'}
              variant="primary"
            />
          </div>

          <InsightBanner
            title="FX Conversion Advisory"
            insights={[
              `Converting ${formatCurrency(amount, fromCurrency)} into ${CURRENCIES[toCurrency].name} at 1 ${fromCurrency} = ${results.exchangeRate < 1 ? results.exchangeRate.toFixed(4) : results.exchangeRate.toFixed(2)} ${toCurrency}.`,
              'Commercial bank and remittance providers may apply additional payment gateway spreads or international transfer processing margins.',
            ]}
            variant="info"
          />
        </div>
      </div>

      {/* Multi-Currency Cross Comparison Matrix Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-500" /> Multi-Currency Valuation Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              See what <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(amount, fromCurrency)}</strong> is worth across major global and African currencies.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 self-start sm:self-auto">
            Click any currency to convert
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Currency</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Exchange Rate (vs {fromCurrency})</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Equivalent Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.matrix.map((row) => (
                <tr
                  key={row.code}
                  onClick={() => setToCurrency(row.code)}
                  className={`cursor-pointer transition-colors ${
                    toCurrency === row.code
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="text-base">{row.flag || '🌐'}</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{row.code}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{row.symbol}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                    1 {fromCurrency} = {row.rate < 1 ? row.rate.toFixed(6) : row.rate.toFixed(4)} {row.code}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(row.amount, row.code)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
