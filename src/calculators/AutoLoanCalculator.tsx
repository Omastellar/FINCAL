import React, { useState, useMemo, useEffect } from 'react';
import { Car, DollarSign, ArrowRightLeft, FileText, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateAutoLoan } from '../utils/financialMath';
import { Card } from '../components/common/Card';
import { SliderField } from '../components/common/SliderField';
import { MetricCard } from '../components/common/MetricCard';
import { ExplainableResult } from '../components/common/ExplainableResult';
import { ShareButton, PrintButton } from '../components/common/ShareButton';
import { useShareableState } from '../hooks/useShareableState';
import { exportAmortizationCSV } from '../utils/exportUtils';
import { ExplainableResultData } from '../types/calculators';

export const AutoLoanCalculator: React.FC = () => {
  const { currencyConfig, format } = useCurrency();
  const { updateUrlParams, getUrlParams, copyShareableLink, copied } = useShareableState();

  const initialParams = useMemo(() => getUrlParams(), []);

  const [vehiclePrice, setVehiclePrice] = useState<number>(() => {
    const val = initialParams.get('price');
    return val ? parseFloat(val) : 18_000_000;
  });
  const [downPayment, setDownPayment] = useState<number>(() => {
    const val = initialParams.get('down');
    return val ? parseFloat(val) : 3_000_000;
  });
  const [tradeInValue, setTradeInValue] = useState<number>(() => {
    const val = initialParams.get('trade');
    return val ? parseFloat(val) : 4_000_000;
  });
  const [tradeInBalanceOwed, setTradeInBalanceOwed] = useState<number>(() => {
    const val = initialParams.get('tradeOwed');
    return val ? parseFloat(val) : 1_500_000;
  });
  const [salesTaxPct, setSalesTaxPct] = useState<number>(7.5);
  const [dealerFees, setDealerFees] = useState<number>(250_000);
  const [cashRebate, setCashRebate] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(() => {
    const val = initialParams.get('rate');
    return val ? parseFloat(val) : 16.0;
  });
  const [loanTermMonths, setLoanTermMonths] = useState<number>(() => {
    const val = initialParams.get('term');
    return val ? parseInt(val, 10) : 48;
  });

  useEffect(() => {
    updateUrlParams({
      calc: 'auto-loan',
      price: vehiclePrice,
      down: downPayment,
      trade: tradeInValue,
      rate: interestRate,
      term: loanTermMonths,
    });
  }, [vehiclePrice, downPayment, tradeInValue, interestRate, loanTermMonths, updateUrlParams]);

  const results = useMemo(() => {
    return calculateAutoLoan({
      vehiclePrice,
      downPayment,
      tradeInValue,
      tradeInBalanceOwed,
      salesTaxPct,
      dealerFees,
      cashRebate,
      interestRate,
      loanTermMonths,
    });
  }, [
    vehiclePrice,
    downPayment,
    tradeInValue,
    tradeInBalanceOwed,
    salesTaxPct,
    dealerFees,
    cashRebate,
    interestRate,
    loanTermMonths,
  ]);

  const explainableData: ExplainableResultData = useMemo(() => {
    return {
      title: 'Auto Financing & Trade-In Equity Analysis',
      summary: `Financing a vehicle price of ${format(vehiclePrice)} with ${format(downPayment)} down payment and ${format(results.netTradeIn)} net trade-in equity results in a net amount financed of ${format(results.totalFinanced)}. Over ${loanTermMonths} months at ${interestRate}%, the monthly payment is ${format(results.monthlyPayment)}.`,
      keyFigures: [
        { label: 'Monthly Payment', value: format(results.monthlyPayment), highlight: true },
        { label: 'Total Financed Amount', value: format(results.totalFinanced) },
        { label: 'Net Trade-In Equity', value: format(results.netTradeIn), hint: results.netTradeIn < 0 ? 'Negative equity added to loan' : 'Reduces loan amount' },
        { label: 'Sales Tax Amount', value: format(results.salesTaxAmount) },
        { label: 'Total Interest Charge', value: format(results.totalInterest) },
        { label: 'Total Out-of-Pocket Cost', value: format(results.totalCostOfVehicle) },
      ],
      assumptions: [
        { label: 'Loan Term', value: `${loanTermMonths} Months (${(loanTermMonths / 12).toFixed(1)} years)` },
        { label: 'Annual Financing Rate (APR)', value: `${interestRate}% APR compounded monthly` },
        { label: 'Tax Base Calculation', value: `Taxed after netting trade-in value: ${format(Math.max(0, vehiclePrice - tradeInValue - cashRebate))}` },
        { label: 'Dealer Doc & Title Fees', value: format(dealerFees) },
      ],
      methodology: 'Automotive installment loan formula factoring trade-in equity roll-over and taxable basis reduction.',
      formulaSteps: [
        {
          name: 'Total Financed Amount',
          formula: 'Financed = Vehicle Price - Down - Net Trade-In + Sales Tax + Dealer Fees - Rebates',
          substituted: `${format(vehiclePrice)} - ${format(downPayment)} - ${format(results.netTradeIn)} + ${format(results.salesTaxAmount)} + ${format(dealerFees)} - ${format(cashRebate)}`,
          result: format(results.totalFinanced),
          explanation: 'Net principal amount borrowed from the automotive lender.',
        },
        {
          name: 'Monthly Installment Payment',
          formula: 'PMT = P * [r(1 + r)^n] / [(1 + r)^n - 1]',
          substituted: `${format(results.totalFinanced)} * [${(interestRate / 1200).toFixed(5)}...]`,
          result: format(results.monthlyPayment),
          explanation: 'Fixed monthly auto loan payment due to the financing institution.',
        },
      ],
      disclaimers: [
        'Vehicle registration, title, and licensing fees may vary based on vehicle curb weight and state/provincial department of motor vehicles mandates.',
        'Negative trade-in equity (owing more on your previous car than its trade-in valuation) increases your monthly payment and interest charges.',
      ],
    };
  }, [results, vehiclePrice, downPayment, loanTermMonths, interestRate, dealerFees, cashRebate, tradeInValue, format]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Loan Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Institutional Vehicle Finance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Auto Loan & Trade-In Calculator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Evaluate true vehicle financing costs including positive or negative trade-in equity, sales taxes, and dealer fees.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton onShare={copyShareableLink} copied={copied} />
          <PrintButton />
          <button
            type="button"
            onClick={() => exportAmortizationCSV(results.amortizationSchedule, results.totalFinanced, interestRate, currencyConfig.code)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Monthly Auto Payment"
          value={format(results.monthlyPayment)}
          icon={<Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subValue={`Across ${loanTermMonths} monthly payments`}
          variant="primary"
        />
        <MetricCard
          label="Total Amount Financed"
          value={format(results.totalFinanced)}
          icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subValue="Net vehicle loan principal"
        />
        <MetricCard
          label="Net Trade-In Equity"
          value={format(results.netTradeIn)}
          icon={<ArrowRightLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          subValue={results.netTradeIn >= 0 ? 'Positive trade equity applied' : 'Negative equity rolled into loan'}
        />
        <MetricCard
          label="Total Vehicle Cost"
          value={format(results.totalCostOfVehicle)}
          icon={<FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          subValue={`Includes ${format(results.totalInterest)} financing interest`}
        />
      </div>

      {/* Input Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Vehicle & Deal Details
            </h2>
            <div className="space-y-5">
              <SliderField
                label="Vehicle Purchase Price"
                value={vehiclePrice}
                onChange={setVehiclePrice}
                min={1_000_000}
                max={100_000_000}
                step={250_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Cash Down Payment"
                value={downPayment}
                onChange={setDownPayment}
                min={0}
                max={30_000_000}
                step={100_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Interest Rate (APR)"
                value={interestRate}
                onChange={setInterestRate}
                min={1}
                max={35}
                step={0.25}
                suffix="%"
              />

              {/* Term Selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                  Loan Duration
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[24, 36, 48, 60, 72].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanTermMonths(term)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        loanTermMonths === term
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {term} mo
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Trade-in & Fees Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Trade-In & Acquisition Costs
            </h2>
            <div className="space-y-5">
              <SliderField
                label="Trade-In Vehicle Value"
                value={tradeInValue}
                onChange={setTradeInValue}
                min={0}
                max={30_000_000}
                step={250_000}
                prefix={currencyConfig.symbol}
              />

              <SliderField
                label="Outstanding Balance Owed on Trade-In"
                value={tradeInBalanceOwed}
                onChange={setTradeInBalanceOwed}
                min={0}
                max={30_000_000}
                step={250_000}
                prefix={currencyConfig.symbol}
                helperText="Remaining loan balance on your existing vehicle"
              />

              {/* Trade equity badge */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  results.netTradeIn >= 0
                    ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50/60 border-red-200 dark:bg-red-950/20 text-red-800 dark:text-red-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {results.netTradeIn >= 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{results.netTradeIn >= 0 ? 'Positive Trade Equity' : 'Negative Trade Equity (Underwater)'}</span>
                </div>
                <span className="font-bold text-sm">{format(results.netTradeIn)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <SliderField
                  label="Sales Tax Rate"
                  value={salesTaxPct}
                  onChange={setSalesTaxPct}
                  min={0}
                  max={15}
                  step={0.25}
                  suffix="%"
                />

                <SliderField
                  label="Dealer Doc & Acquisition Fees"
                  value={dealerFees}
                  onChange={setDealerFees}
                  min={0}
                  max={2_000_000}
                  step={25_000}
                  prefix={currencyConfig.symbol}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Explainable Result */}
      <ExplainableResult data={explainableData} />
    </div>
  );
};
