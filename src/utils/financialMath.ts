import {
  LoanInputs,
  LoanResults,
  SavingsInputs,
  SavingsResults,
  CompoundInterestInputs,
  CompoundInterestResults,
  InvestmentInputs,
  InvestmentResults,
  DebtPayoffInputs,
  DebtPayoffResults,
  BudgetInputs,
  BudgetResults,
  AmortizationRow,
  AmortizationYearSummary,
  GrowthPoint,
  DebtTimelinePoint,
  ExpenseCategoryBreakdown,
  PaymentFrequency,
  CompoundingFrequency,
  CurrencyConversionInputs,
  CurrencyConversionResults,
  CurrencyMatrixItem,
  MortgageInputs,
  MortgageResults,
  HomeAffordabilityInputs,
  HomeAffordabilityResults,
  AutoLoanInputs,
  AutoLoanResults,
  PersonalLoanInputs,
  PersonalLoanResults,
  SavingsGoalInputs,
  SavingsGoalResults,
  RetirementInputs,
  RetirementResults,
  DebtItem,
  DebtPayoffPlanSummary,
  MultiDebtPayoffInputs,
  MultiDebtPayoffResults,
  DTIInputs,
  DTIResults,
  NetWorthInputs,
  NetWorthResults,
  FinancialGoalItem,
  FinancialGoalInputs,
  FinancialGoalsResults,
  ScenarioOption,
  ScenarioComparisonInputs,
  ScenarioComparisonResults,
  ExplainableResultData,
} from '../types/calculators';
import { CURRENCIES, CurrencyCode } from '../types/currency';

// Helper to sanitize numeric inputs to avoid NaN, negative values when unexpected, or infinities
export function sanitizeNumber(value: unknown, fallback: number = 0, min: number = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.max(min, num);
}

// -------------------------------------------------------------
// 1. LOAN CALCULATOR
// -------------------------------------------------------------
export function getPeriodsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'bi-weekly':
      return 26;
    case 'monthly':
    default:
      return 12;
  }
}

export function calculateLoanPayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
  frequency: PaymentFrequency = 'monthly'
): LoanResults {
  const safePrincipal = sanitizeNumber(principal, 0, 0);
  const safeRate = sanitizeNumber(annualRatePct, 0, 0);
  const safeTermYears = sanitizeNumber(termYears, 1, 0.08); // at least 1 month ~ 0.08 yr

  const periodsPerYear = getPeriodsPerYear(frequency);
  const totalPeriods = Math.round(safeTermYears * periodsPerYear);

  if (safePrincipal <= 0 || totalPeriods <= 0) {
    return {
      periodicPayment: 0,
      totalRepayment: 0,
      totalInterest: 0,
      monthlyEquivalentPayment: 0,
      principalRatio: 100,
      interestRatio: 0,
      amortizationSchedule: [],
      annualSchedule: [],
    };
  }

  const periodicRate = (safeRate / 100) / periodsPerYear;
  let payment: number;

  if (periodicRate === 0) {
    payment = safePrincipal / totalPeriods;
  } else {
    const rateFactor = Math.pow(1 + periodicRate, totalPeriods);
    payment = (safePrincipal * (periodicRate * rateFactor)) / (rateFactor - 1);
  }

  // Monthly equivalent payment for easy comparison
  const monthlyEquivalentPayment = frequency === 'monthly'
    ? payment
    : (payment * periodsPerYear) / 12;

  // Build full amortization schedule
  const amortizationSchedule: AmortizationRow[] = [];
  let remainingBalance = safePrincipal;
  let cumulativeInterest = 0;

  for (let p = 1; p <= totalPeriods; p++) {
    const interestForPeriod = periodicRate === 0 ? 0 : remainingBalance * periodicRate;
    let principalForPeriod = payment - interestForPeriod;

    // Adjust for the final period to eliminate balance discrepancies
    if (p === totalPeriods || remainingBalance - principalForPeriod < 0.01) {
      principalForPeriod = remainingBalance;
      remainingBalance = 0;
    } else {
      remainingBalance = Math.max(0, remainingBalance - principalForPeriod);
    }

    cumulativeInterest += interestForPeriod;

    amortizationSchedule.push({
      period: p,
      payment: principalForPeriod + interestForPeriod,
      principalPaid: principalForPeriod,
      interestPaid: interestForPeriod,
      remainingBalance,
      totalInterestPaid: cumulativeInterest,
    });

    if (remainingBalance === 0) break;
  }

  const totalRepayment = safePrincipal + cumulativeInterest;
  const principalRatio = totalRepayment > 0 ? (safePrincipal / totalRepayment) * 100 : 100;
  const interestRatio = totalRepayment > 0 ? (cumulativeInterest / totalRepayment) * 100 : 0;

  // Aggregate schedule by year
  const annualSchedule: AmortizationYearSummary[] = [];
  const periodsInYear = periodsPerYear;
  const totalYears = Math.ceil(amortizationSchedule.length / periodsInYear);

  for (let yr = 1; yr <= totalYears; yr++) {
    const startIdx = (yr - 1) * periodsInYear;
    const endIdx = Math.min(startIdx + periodsInYear, amortizationSchedule.length);
    const chunk = amortizationSchedule.slice(startIdx, endIdx);

    const yearPayment = chunk.reduce((sum, row) => sum + row.payment, 0);
    const yearPrincipal = chunk.reduce((sum, row) => sum + row.principalPaid, 0);
    const yearInterest = chunk.reduce((sum, row) => sum + row.interestPaid, 0);
    const endingBalance = chunk.length > 0 ? chunk[chunk.length - 1].remainingBalance : 0;

    annualSchedule.push({
      year: yr,
      payment: yearPayment,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      endingBalance,
    });
  }

  return {
    periodicPayment: payment,
    totalRepayment,
    totalInterest: cumulativeInterest,
    monthlyEquivalentPayment,
    principalRatio,
    interestRatio,
    amortizationSchedule,
    annualSchedule,
  };
}

// -------------------------------------------------------------
// 1B. LOAN PREPAYMENT & LUMP-SUM SIMULATOR
// -------------------------------------------------------------
export function calculateLoanWithPrepayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
  frequency: PaymentFrequency = 'monthly',
  extraPeriodicPayment: number = 0,
  lumpSumAmount: number = 0,
  lumpSumYear: number = 1
) {
  const standard = calculateLoanPayment(principal, annualRatePct, termYears, frequency);
  const safeExtra = sanitizeNumber(extraPeriodicPayment, 0, 0);
  const safeLumpSum = sanitizeNumber(lumpSumAmount, 0, 0);
  const safeLumpYear = sanitizeNumber(lumpSumYear, 1, 1);

  if (standard.periodicPayment <= 0 || (safeExtra <= 0 && safeLumpSum <= 0)) {
    return {
      acceleratedTotalRepayment: standard.totalRepayment,
      acceleratedTotalInterest: standard.totalInterest,
      acceleratedPeriods: standard.amortizationSchedule.length,
      interestSaved: 0,
      periodsSaved: 0,
      yearsSaved: 0,
      amortizationSchedule: standard.amortizationSchedule,
      annualSchedule: standard.annualSchedule,
    };
  }

  const periodsPerYear = getPeriodsPerYear(frequency);
  const periodicRate = (sanitizeNumber(annualRatePct, 0, 0) / 100) / periodsPerYear;
  const lumpSumPeriod = Math.round(safeLumpYear * periodsPerYear);

  const acceleratedSchedule: AmortizationRow[] = [];
  let remainingBalance = sanitizeNumber(principal, 0, 0);
  let cumulativeInterest = 0;
  let period = 0;
  const maxPeriodCap = Math.round(termYears * periodsPerYear);

  while (remainingBalance > 0.01 && period < maxPeriodCap) {
    period++;
    const interestForPeriod = periodicRate === 0 ? 0 : remainingBalance * periodicRate;
    let scheduledPayment = standard.periodicPayment + safeExtra;

    // Apply lump sum in the designated period
    if (period === lumpSumPeriod && safeLumpSum > 0) {
      scheduledPayment += safeLumpSum;
    }

    let principalPaid = scheduledPayment - interestForPeriod;

    if (remainingBalance <= principalPaid || period === maxPeriodCap) {
      principalPaid = remainingBalance;
      scheduledPayment = principalPaid + interestForPeriod;
      remainingBalance = 0;
    } else {
      remainingBalance -= principalPaid;
    }

    cumulativeInterest += interestForPeriod;

    acceleratedSchedule.push({
      period,
      payment: scheduledPayment,
      principalPaid,
      interestPaid: interestForPeriod,
      remainingBalance,
      totalInterestPaid: cumulativeInterest,
    });

    if (remainingBalance <= 0) break;
  }

  const acceleratedTotalRepayment = sanitizeNumber(principal, 0, 0) + cumulativeInterest;
  const interestSaved = Math.max(0, standard.totalInterest - cumulativeInterest);
  const periodsSaved = Math.max(0, standard.amortizationSchedule.length - period);
  const yearsSaved = periodsSaved / periodsPerYear;

  // Build annual schedule for accelerated plan
  const annualSchedule: AmortizationYearSummary[] = [];
  const totalYears = Math.ceil(acceleratedSchedule.length / periodsPerYear);

  for (let yr = 1; yr <= totalYears; yr++) {
    const startIdx = (yr - 1) * periodsPerYear;
    const endIdx = Math.min(startIdx + periodsPerYear, acceleratedSchedule.length);
    const chunk = acceleratedSchedule.slice(startIdx, endIdx);

    const yearPayment = chunk.reduce((sum, row) => sum + row.payment, 0);
    const yearPrincipal = chunk.reduce((sum, row) => sum + row.principalPaid, 0);
    const yearInterest = chunk.reduce((sum, row) => sum + row.interestPaid, 0);
    const endingBalance = chunk.length > 0 ? chunk[chunk.length - 1].remainingBalance : 0;

    annualSchedule.push({
      year: yr,
      payment: yearPayment,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      endingBalance,
    });
  }

  return {
    acceleratedTotalRepayment,
    acceleratedTotalInterest: cumulativeInterest,
    acceleratedPeriods: period,
    interestSaved,
    periodsSaved,
    yearsSaved,
    amortizationSchedule: acceleratedSchedule,
    annualSchedule,
  };
}

// -------------------------------------------------------------
// INFLATION DISCOUNT FORMULA
// -------------------------------------------------------------
export function calculateRealPurchasingPower(
  nominalValue: number,
  annualInflationRatePct: number,
  years: number
): number {
  const safeVal = sanitizeNumber(nominalValue, 0, 0);
  const safeRate = sanitizeNumber(annualInflationRatePct, 0, 0);
  const safeYears = sanitizeNumber(years, 0, 0);

  if (safeVal <= 0 || safeYears <= 0 || safeRate <= 0) return safeVal;
  const discountFactor = Math.pow(1 + safeRate / 100, safeYears);
  return safeVal / discountFactor;
}

// -------------------------------------------------------------
// 2. SAVINGS CALCULATOR
// -------------------------------------------------------------
export function calculateSavingsGrowth(
  initialDeposit: number,
  monthlyContribution: number,
  annualRatePct: number,
  savingsPeriodYears: number,
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually' = 'monthly',
  annualInflationRatePct: number = 0
): SavingsResults {
  const initial = sanitizeNumber(initialDeposit, 0, 0);
  const monthly = sanitizeNumber(monthlyContribution, 0, 0);
  const rate = sanitizeNumber(annualRatePct, 0, 0);
  const inflation = sanitizeNumber(annualInflationRatePct, 0, 0);
  const years = Math.max(1, Math.round(sanitizeNumber(savingsPeriodYears, 1, 1)));

  let compoundTimesPerYear = 12;
  if (compoundingFrequency === 'quarterly') compoundTimesPerYear = 4;
  if (compoundingFrequency === 'annually') compoundTimesPerYear = 1;

  const totalMonths = years * 12;
  const monthlyRate = (rate / 100) / 12;

  const growthTimeline: GrowthPoint[] = [
    {
      year: 0,
      principalInvested: initial,
      totalInterest: 0,
      totalBalance: initial,
      realPurchasingPower: initial,
    },
  ];

  let currentBalance = initial;
  let totalContributed = initial;

  for (let month = 1; month <= totalMonths; month++) {
    currentBalance += monthly;
    totalContributed += monthly;

    if (rate > 0) {
      currentBalance += currentBalance * monthlyRate;
    }

    if (month % 12 === 0 || month === totalMonths) {
      const yearNumber = Math.ceil(month / 12);
      const interestSoFar = Math.max(0, currentBalance - totalContributed);
      growthTimeline.push({
        year: yearNumber,
        principalInvested: Math.round(totalContributed * 100) / 100,
        totalInterest: Math.round(interestSoFar * 100) / 100,
        totalBalance: Math.round(currentBalance * 100) / 100,
        realPurchasingPower: Math.round(calculateRealPurchasingPower(currentBalance, inflation, yearNumber) * 100) / 100,
      });
    }
  }

  const finalBalance = currentBalance;
  const interestEarned = Math.max(0, finalBalance - totalContributed);

  return {
    totalContributions: totalContributed,
    interestEarned,
    finalBalance,
    growthTimeline,
  };
}

// -------------------------------------------------------------
// 3. COMPOUND INTEREST CALCULATOR
// -------------------------------------------------------------
export function getCompoundingTimes(freq: CompoundingFrequency): number {
  switch (freq) {
    case 'daily':
      return 365;
    case 'quarterly':
      return 4;
    case 'annually':
      return 1;
    case 'monthly':
    default:
      return 12;
  }
}

export function calculateCompoundInterest(
  principalInput: number,
  ratePctInput: number,
  additionalContribution: number,
  contributionFreq: 'monthly' | 'annually' = 'monthly',
  periodYears: number = 5,
  compoundingFreq: CompoundingFrequency = 'monthly',
  annualInflationRatePct: number = 0
): CompoundInterestResults {
  const principal = sanitizeNumber(principalInput, 0, 0);
  const ratePct = sanitizeNumber(ratePctInput, 0, 0);
  const contribution = sanitizeNumber(additionalContribution, 0, 0);
  const inflation = sanitizeNumber(annualInflationRatePct, 0, 0);
  const years = Math.max(1, Math.round(sanitizeNumber(periodYears, 1, 1)));

  const n = getCompoundingTimes(compoundingFreq);
  const annualContrib = contributionFreq === 'monthly' ? contribution * 12 : contribution;
  const periodicContrib = contributionFreq === 'monthly' ? contribution : contribution / 12;

  const totalMonths = years * 12;
  const nominalRate = ratePct > 0 ? (ratePct / 100) : 0;
  const monthlyRate = nominalRate > 0 ? Math.pow(1 + nominalRate / n, n / 12) - 1 : 0;

  const growthTimeline: GrowthPoint[] = [
    {
      year: 0,
      principalInvested: principal,
      totalInterest: 0,
      totalBalance: principal,
      realPurchasingPower: principal,
    },
  ];

  let currentBalance = principal;
  let totalInvested = principal;

  for (let m = 1; m <= totalMonths; m++) {
    currentBalance += periodicContrib;
    totalInvested += periodicContrib;

    if (monthlyRate > 0) {
      currentBalance += currentBalance * monthlyRate;
    }

    if (m % 12 === 0) {
      const year = m / 12;
      growthTimeline.push({
        year,
        principalInvested: Math.round(totalInvested * 100) / 100,
        totalInterest: Math.max(0, Math.round((currentBalance - totalInvested) * 100) / 100),
        totalBalance: Math.round(currentBalance * 100) / 100,
        realPurchasingPower: Math.round(calculateRealPurchasingPower(currentBalance, inflation, year) * 100) / 100,
      });
    }
  }

  const interestEarned = Math.max(0, currentBalance - totalInvested);

  return {
    futureValue: currentBalance,
    totalContributions: totalInvested - principal,
    interestEarned,
    principal,
    growthTimeline,
  };
}

// -------------------------------------------------------------
// 4. INVESTMENT CALCULATOR
// -------------------------------------------------------------
export function calculateInvestment(
  initialInvestment: number,
  monthlyContribution: number,
  expectedAnnualReturnPct: number,
  investmentDurationYears: number,
  annualInflationRatePct: number = 0
): InvestmentResults {
  const initial = sanitizeNumber(initialInvestment, 0, 0);
  const monthly = sanitizeNumber(monthlyContribution, 0, 0);
  const returnRate = sanitizeNumber(expectedAnnualReturnPct, 0, 0);
  const inflation = sanitizeNumber(annualInflationRatePct, 0, 0);
  const years = Math.max(1, Math.round(sanitizeNumber(investmentDurationYears, 1, 1)));

  const totalMonths = years * 12;
  const monthlyRate = returnRate > 0 ? (returnRate / 100) / 12 : 0;

  const growthTimeline: GrowthPoint[] = [
    {
      year: 0,
      principalInvested: initial,
      totalInterest: 0,
      totalBalance: initial,
      realPurchasingPower: initial,
    },
  ];

  let currentBalance = initial;
  let totalInvested = initial;

  for (let m = 1; m <= totalMonths; m++) {
    currentBalance += monthly;
    totalInvested += monthly;

    if (monthlyRate > 0) {
      currentBalance += currentBalance * monthlyRate;
    }

    if (m % 12 === 0) {
      const year = m / 12;
      growthTimeline.push({
        year,
        principalInvested: Math.round(totalInvested * 100) / 100,
        totalInterest: Math.max(0, Math.round((currentBalance - totalInvested) * 100) / 100),
        totalBalance: Math.round(currentBalance * 100) / 100,
        realPurchasingPower: Math.round(calculateRealPurchasingPower(currentBalance, inflation, year) * 100) / 100,
      });
    }
  }

  const estimatedGrowth = Math.max(0, currentBalance - totalInvested);

  return {
    totalInvested,
    estimatedGrowth,
    futureInvestmentValue: currentBalance,
    growthTimeline,
  };
}

// -------------------------------------------------------------
// 5. DEBT PAYOFF CALCULATOR
// -------------------------------------------------------------
export function calculateDebtPayoff(
  currentDebt: number,
  annualInterestRatePct: number,
  monthlyPayment: number,
  additionalMonthlyPayment: number = 0
): DebtPayoffResults {
  const debt = sanitizeNumber(currentDebt, 0, 0);
  const ratePct = sanitizeNumber(annualInterestRatePct, 0, 0);
  const stdPayment = sanitizeNumber(monthlyPayment, 0, 0);
  const extraPayment = sanitizeNumber(additionalMonthlyPayment, 0, 0);

  const monthlyRate = (ratePct / 100) / 12;
  const minMonthlyInterest = debt * monthlyRate;

  // Validation: payment must exceed monthly interest charge
  if (debt <= 0 || (stdPayment <= minMonthlyInterest && ratePct > 0)) {
    return {
      standardPayoffMonths: 0,
      acceleratedPayoffMonths: 0,
      standardTotalInterest: 0,
      acceleratedTotalInterest: 0,
      standardTotalRepayment: 0,
      acceleratedTotalRepayment: 0,
      interestSaved: 0,
      monthsSaved: 0,
      timeline: [],
      isValidPayment: false,
      minMonthlyInterest: Math.ceil(minMonthlyInterest + 1),
    };
  }

  // Simulate Standard Plan
  let stdBalance = debt;
  let stdInterest = 0;
  let stdMonths = 0;
  const maxMonthsLimit = 600; // 50 years safeguard

  const timelineMap: Map<number, { std: number; acc: number }> = new Map();
  timelineMap.set(0, { std: debt, acc: debt });

  while (stdBalance > 0.01 && stdMonths < maxMonthsLimit) {
    stdMonths++;
    const interest = stdBalance * monthlyRate;
    stdInterest += interest;
    const principalPaid = Math.min(stdBalance, stdPayment - interest);
    stdBalance = Math.max(0, stdBalance - principalPaid);

    if (stdMonths <= 120 || stdMonths % 12 === 0) {
      const entry = timelineMap.get(stdMonths) || { std: 0, acc: 0 };
      entry.std = Math.round(stdBalance);
      timelineMap.set(stdMonths, entry);
    }
  }

  // Simulate Accelerated Plan
  const accPayment = stdPayment + extraPayment;
  let accBalance = debt;
  let accInterest = 0;
  let accMonths = 0;

  while (accBalance > 0.01 && accMonths < maxMonthsLimit) {
    accMonths++;
    const interest = accBalance * monthlyRate;
    accInterest += interest;
    const principalPaid = Math.min(accBalance, accPayment - interest);
    accBalance = Math.max(0, accBalance - principalPaid);

    const entry = timelineMap.get(accMonths) || { std: 0, acc: 0 };
    entry.acc = Math.round(accBalance);
    timelineMap.set(accMonths, entry);
  }

  // Convert timeline map into sorted array
  const maxTimelineMonths = Math.min(Math.max(stdMonths, accMonths), 120);
  const timeline: DebtTimelinePoint[] = [];

  for (let m = 0; m <= maxTimelineMonths; m++) {
    if (m <= 24 || m % 6 === 0 || m === accMonths || m === stdMonths) {
      const entry = timelineMap.get(m);
      timeline.push({
        month: m,
        standardBalance: entry ? entry.std : 0,
        acceleratedBalance: entry ? entry.acc : 0,
      });
    }
  }

  const interestSaved = Math.max(0, stdInterest - accInterest);
  const monthsSaved = Math.max(0, stdMonths - accMonths);

  return {
    standardPayoffMonths: stdMonths,
    acceleratedPayoffMonths: accMonths,
    standardTotalInterest: stdInterest,
    acceleratedTotalInterest: accInterest,
    standardTotalRepayment: debt + stdInterest,
    acceleratedTotalRepayment: debt + accInterest,
    interestSaved,
    monthsSaved,
    timeline,
    isValidPayment: true,
    minMonthlyInterest: Math.ceil(minMonthlyInterest + 1),
  };
}

// -------------------------------------------------------------
// 6. BUDGET CALCULATOR
// -------------------------------------------------------------
export function calculateBudget(inputs: BudgetInputs): BudgetResults {
  const salary = sanitizeNumber(inputs.salary, 0, 0);
  const otherIncome = sanitizeNumber(inputs.otherIncome, 0, 0);
  const totalIncome = salary + otherIncome;

  const housing = sanitizeNumber(inputs.expenses.housing, 0, 0);
  const food = sanitizeNumber(inputs.expenses.food, 0, 0);
  const transportation = sanitizeNumber(inputs.expenses.transportation, 0, 0);
  const utilities = sanitizeNumber(inputs.expenses.utilities, 0, 0);
  const debtPayments = sanitizeNumber(inputs.expenses.debtPayments, 0, 0);
  const entertainment = sanitizeNumber(inputs.expenses.entertainment, 0, 0);
  const otherExpenses = sanitizeNumber(inputs.expenses.otherExpenses, 0, 0);
  const healthcare = sanitizeNumber(inputs.expenses.healthcare, 0, 0);
  const insurance = sanitizeNumber(inputs.expenses.insurance, 0, 0);
  const diningOut = sanitizeNumber(inputs.expenses.diningOut, 0, 0);
  const clothing = sanitizeNumber(inputs.expenses.clothing, 0, 0);
  const travel = sanitizeNumber(inputs.expenses.travel, 0, 0);
  const personalCare = sanitizeNumber(inputs.expenses.personalCare, 0, 0);
  const savingsContributions = sanitizeNumber(inputs.expenses.savingsContributions, 0, 0);

  const totalExpenses =
    housing +
    food +
    transportation +
    utilities +
    debtPayments +
    entertainment +
    otherExpenses +
    healthcare +
    insurance +
    diningOut +
    clothing +
    travel +
    personalCare +
    savingsContributions;

  const remainingBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((remainingBalance + savingsContributions) / totalIncome) * 100) : 0;

  const categories = [
    { category: 'Housing', amount: housing, color: '#3b82f6' },
    { category: 'Food & Groceries', amount: food, color: '#10b981' },
    { category: 'Transportation', amount: transportation, color: '#f59e0b' },
    { category: 'Utilities', amount: utilities, color: '#8b5cf6' },
    { category: 'Healthcare', amount: healthcare, color: '#06b6d4' },
    { category: 'Insurance', amount: insurance, color: '#6366f1' },
    { category: 'Debt Payments', amount: debtPayments, color: '#ef4444' },
    { category: 'Dining Out', amount: diningOut, color: '#f97316' },
    { category: 'Entertainment', amount: entertainment, color: '#ec4899' },
    { category: 'Clothing & Apparel', amount: clothing, color: '#14b8a6' },
    { category: 'Travel & Vacations', amount: travel, color: '#eab308' },
    { category: 'Personal Care', amount: personalCare, color: '#a855f7' },
    { category: 'Savings & Investments', amount: savingsContributions, color: '#22c55e' },
    { category: 'Other Expenses', amount: otherExpenses, color: '#64748b' },
  ];

  const expenseBreakdown: ExpenseCategoryBreakdown[] = categories
    .filter((c) => c.amount > 0)
    .map((c) => ({
      ...c,
      percentage: totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0,
    }));

  // 50/30/20 Rule:
  // Needs (50%): Housing, Food, Transportation, Utilities, Healthcare, Insurance, Debt
  // Wants (30%): Entertainment, Dining Out, Clothing, Travel, Personal Care, Other
  // Savings (20%): Savings Contributions + Remaining Balance
  const needsTotal = housing + food + transportation + utilities + debtPayments + healthcare + insurance;
  const wantsTotal = entertainment + otherExpenses + diningOut + clothing + travel + personalCare;
  const savingsTotal = Math.max(0, remainingBalance) + savingsContributions;

  const rule50_30_20 = {
    needs: {
      actual: needsTotal,
      target: totalIncome * 0.5,
      percentage: totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0,
    },
    wants: {
      actual: wantsTotal,
      target: totalIncome * 0.3,
      percentage: totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0,
    },
    savings: {
      actual: savingsTotal,
      target: totalIncome * 0.2,
      percentage: totalIncome > 0 ? (savingsTotal / totalIncome) * 100 : 0,
    },
  };

  return {
    totalIncome,
    totalExpenses,
    remainingBalance,
    savingsRate,
    expenseBreakdown,
    rule50_30_20,
  };
}

// -------------------------------------------------------------
// 7. CURRENCY CONVERSION ENGINE
// -------------------------------------------------------------
export function getCurrencyExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  customRate?: number
): number {
  if (customRate && customRate > 0) {
    return customRate;
  }
  if (fromCurrency === toCurrency) {
    return 1;
  }
  const fromConfig = CURRENCIES[fromCurrency];
  const toConfig = CURRENCIES[toCurrency];
  if (!fromConfig || !toConfig || fromConfig.rateToUSD <= 0) {
    return 1;
  }
  return toConfig.rateToUSD / fromConfig.rateToUSD;
}

export function calculateCurrencyConversion(
  inputs: CurrencyConversionInputs
): CurrencyConversionResults {
  const safeAmount = sanitizeNumber(inputs.amount, 0, 0);
  const feePct = sanitizeNumber(inputs.transferFeePct, 0, 0);
  const exchangeRate = getCurrencyExchangeRate(
    inputs.fromCurrency,
    inputs.toCurrency,
    inputs.customRate
  );
  const inverseRate = exchangeRate > 0 ? 1 / exchangeRate : 0;

  const grossConvertedAmount = safeAmount * exchangeRate;
  const feeAmount = grossConvertedAmount * (feePct / 100);
  const netConvertedAmount = Math.max(0, grossConvertedAmount - feeAmount);

  // Cross currency comparison matrix
  const matrix: CurrencyMatrixItem[] = (Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
    const cfg = CURRENCIES[code];
    const rate = getCurrencyExchangeRate(inputs.fromCurrency, code);
    return {
      code,
      name: cfg.name,
      symbol: cfg.symbol,
      flag: cfg.flag,
      rate,
      amount: safeAmount * rate,
    };
  });

  return {
    fromAmount: safeAmount,
    fromCurrency: inputs.fromCurrency,
    toCurrency: inputs.toCurrency,
    exchangeRate,
    inverseRate,
    grossConvertedAmount,
    feeAmount,
    netConvertedAmount,
    feePct,
    matrix,
  };
}

// -------------------------------------------------------------
// 8. MORTGAGE CALCULATOR & PITI ENGINE
// -------------------------------------------------------------
export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
  const homePrice = sanitizeNumber(inputs.homePrice, 0, 0);
  const downPaymentInput = sanitizeNumber(inputs.downPayment, 0, 0);
  const downPaymentAmount = inputs.downPaymentIsPercent
    ? (downPaymentInput / 100) * homePrice
    : Math.min(homePrice, downPaymentInput);
  const downPaymentPercent = homePrice > 0 ? (downPaymentAmount / homePrice) * 100 : 0;
  const loanAmount = Math.max(0, homePrice - downPaymentAmount);
  const interestRate = sanitizeNumber(inputs.interestRate, 0, 0);
  const loanTermYears = Math.max(1, sanitizeNumber(inputs.loanTermYears, 30, 1));
  const totalMonths = loanTermYears * 12;
  const monthlyRate = interestRate > 0 ? (interestRate / 100) / 12 : 0;

  // Monthly Principal & Interest
  let principalAndInterest = 0;
  if (loanAmount > 0) {
    if (monthlyRate === 0) {
      principalAndInterest = loanAmount / totalMonths;
    } else {
      principalAndInterest =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
  }

  const monthlyPropertyTax = sanitizeNumber(inputs.propertyTaxAnnual, 0, 0) / 12;
  const monthlyHomeInsurance = sanitizeNumber(inputs.homeInsuranceAnnual, 0, 0) / 12;
  const monthlyHOA = sanitizeNumber(inputs.hoaMonthly, 0, 0);
  const pmiRate = sanitizeNumber(inputs.pmiRate, 0.5, 0);
  const closingCostsPct = sanitizeNumber(inputs.closingCostsPct, 2, 0);
  const extraMonthlyPayment = sanitizeNumber(inputs.extraMonthlyPayment, 0, 0);

  const initialPMIRequired = downPaymentPercent < 20 && loanAmount > 0;
  const initialMonthlyPMI = initialPMIRequired ? (loanAmount * (pmiRate / 100)) / 12 : 0;

  const upfrontClosingCosts = (closingCostsPct / 100) * loanAmount;
  const totalCashNeededToClose = downPaymentAmount + upfrontClosingCosts;
  const totalMonthlyPITI = principalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyHOA + initialMonthlyPMI;

  // Standard Amortization Schedule (tracking PMI drop-off at 80% LTV of initial homePrice)
  const pmiTerminationThreshold = homePrice * 0.8;
  let pmiDropMonth = 0;
  let stdBalance = loanAmount;
  let stdTotalInterest = 0;

  for (let m = 1; m <= totalMonths && stdBalance > 0; m++) {
    const interest = stdBalance * monthlyRate;
    const principal = Math.min(stdBalance, principalAndInterest - interest);
    stdBalance -= principal;
    stdTotalInterest += interest;
    if (pmiDropMonth === 0 && stdBalance <= pmiTerminationThreshold && initialPMIRequired) {
      pmiDropMonth = m;
    }
  }
  const totalRepaymentStandard = loanAmount + stdTotalInterest;

  // Accelerated Schedule with Extra Monthly Payment
  const amortizationSchedule: AmortizationRow[] = [];
  let currentBalance = loanAmount;
  let accTotalInterest = 0;
  let monthCount = 0;

  while (currentBalance > 0.01 && monthCount < totalMonths * 2) {
    monthCount++;
    const interestPaid = currentBalance * monthlyRate;
    let scheduledPrincipal = principalAndInterest - interestPaid;
    let extra = extraMonthlyPayment;

    if (scheduledPrincipal + extra > currentBalance) {
      const needed = currentBalance;
      if (scheduledPrincipal >= needed) {
        scheduledPrincipal = needed;
        extra = 0;
      } else {
        extra = needed - scheduledPrincipal;
      }
    }

    const principalPaid = scheduledPrincipal + extra;
    currentBalance = Math.max(0, currentBalance - principalPaid);
    accTotalInterest += interestPaid;

    if (monthCount <= 360) {
      amortizationSchedule.push({
        period: monthCount,
        payment: principalPaid + interestPaid,
        principalPaid,
        interestPaid,
        remainingBalance: Math.round(currentBalance * 100) / 100,
        totalInterestPaid: Math.round(accTotalInterest * 100) / 100,
        extraPaymentPaid: extra,
      });
    }
  }

  const payoffMonthsSaved = Math.max(0, totalMonths - monthCount);
  const interestSaved = Math.max(0, stdTotalInterest - accTotalInterest);

  return {
    principalAndInterest,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyHOA,
    monthlyPMI: initialMonthlyPMI,
    totalMonthlyPITI,
    loanAmount,
    downPaymentAmount,
    downPaymentPercent,
    upfrontClosingCosts,
    totalCashNeededToClose,
    totalInterestStandard: stdTotalInterest,
    totalRepaymentStandard,
    totalInterestWithExtra: accTotalInterest,
    interestSaved,
    payoffMonthsSaved,
    pmiDropMonth: pmiDropMonth || (initialPMIRequired ? totalMonths : 0),
    amortizationSchedule,
  };
}

// -------------------------------------------------------------
// 9. HOME AFFORDABILITY ENGINE
// -------------------------------------------------------------
export function calculateHomeAffordability(inputs: HomeAffordabilityInputs): HomeAffordabilityResults {
  const grossMonthlyIncome = sanitizeNumber(inputs.annualGrossIncome, 0, 0) / 12;
  const monthlyDebts = sanitizeNumber(inputs.monthlyDebts, 0, 0);
  const downPaymentSaved = sanitizeNumber(inputs.downPaymentSaved, 0, 0);
  const interestRate = sanitizeNumber(inputs.interestRate, 0, 0);
  const loanTermYears = Math.max(1, sanitizeNumber(inputs.loanTermYears, 30, 1));
  const propertyTaxRate = sanitizeNumber(inputs.propertyTaxRate, 1.2, 0);
  const homeInsuranceAnnual = sanitizeNumber(inputs.homeInsuranceAnnual, 1200, 0);
  const monthlyInsurance = homeInsuranceAnnual / 12;

  const frontEndPct = sanitizeNumber(inputs.targetFrontEndDti, 28, 1) / 100;
  const backEndPct = sanitizeNumber(inputs.targetBackEndDti, 36, 1) / 100;

  const solvePriceForDti = (frontDti: number, backDti: number) => {
    const frontMax = grossMonthlyIncome * frontDti;
    const backMax = Math.max(0, grossMonthlyIncome * backDti - monthlyDebts);
    const allowedMonthlyHousing = Math.min(frontMax, backMax);

    if (allowedMonthlyHousing <= monthlyInsurance) {
      return { price: downPaymentSaved, loan: 0, monthlyPITI: allowedMonthlyHousing, factor: 'front-end' as const };
    }

    const n = loanTermYears * 12;
    const r = interestRate > 0 ? (interestRate / 100) / 12 : 0;
    const factorM = r > 0 ? (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (1 / n);
    const taxMonthlyRate = (propertyTaxRate / 100) / 12;

    const denominator = factorM + taxMonthlyRate;
    const numerator = Math.max(0, allowedMonthlyHousing - monthlyInsurance + downPaymentSaved * factorM);
    const maxPrice = denominator > 0 ? numerator / denominator : downPaymentSaved;
    const maxLoan = Math.max(0, maxPrice - downPaymentSaved);

    const factor = frontMax < backMax ? ('front-end' as const) : ('back-end' as const);
    return { price: Math.max(downPaymentSaved, maxPrice), loan: maxLoan, monthlyPITI: allowedMonthlyHousing, factor };
  };

  const conservative = solvePriceForDti(0.28, 0.36);
  const moderate = solvePriceForDti(0.31, 0.43);
  const aggressive = solvePriceForDti(0.36, 0.45);
  const targeted = solvePriceForDti(frontEndPct, backEndPct);

  const n = loanTermYears * 12;
  const r = interestRate > 0 ? (interestRate / 100) / 12 : 0;
  const factorM = r > 0 ? (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (1 / n);
  const principalAndInterest = targeted.loan * factorM;
  const taxes = (propertyTaxRate / 100 / 12) * targeted.price;

  return {
    maxHomePurchasePrice: targeted.price,
    maxLoanAmount: targeted.loan,
    maxMonthlyPayment: targeted.monthlyPITI,
    limitingFactor: targeted.factor,
    conservativePrice: conservative.price,
    moderatePrice: moderate.price,
    aggressivePrice: aggressive.price,
    breakdown: {
      principalAndInterest,
      taxes,
      insurance: monthlyInsurance,
      totalHousingPayment: principalAndInterest + taxes + monthlyInsurance,
    },
  };
}

// -------------------------------------------------------------
// 10. AUTO LOAN & TRADE-IN ENGINE
// -------------------------------------------------------------
export function calculateAutoLoan(inputs: AutoLoanInputs): AutoLoanResults {
  const vehiclePrice = sanitizeNumber(inputs.vehiclePrice, 0, 0);
  const downPayment = sanitizeNumber(inputs.downPayment, 0, 0);
  const tradeInValue = sanitizeNumber(inputs.tradeInValue, 0, 0);
  const tradeInBalanceOwed = sanitizeNumber(inputs.tradeInBalanceOwed, 0, 0);
  const salesTaxPct = sanitizeNumber(inputs.salesTaxPct, 0, 0);
  const dealerFees = sanitizeNumber(inputs.dealerFees, 0, 0);
  const cashRebate = sanitizeNumber(inputs.cashRebate, 0, 0);
  const interestRate = sanitizeNumber(inputs.interestRate, 0, 0);
  const loanTermMonths = Math.max(1, sanitizeNumber(inputs.loanTermMonths, 60, 1));

  const netTradeIn = tradeInValue - tradeInBalanceOwed;
  const taxableBase = Math.max(0, vehiclePrice - Math.max(0, tradeInValue) - cashRebate);
  const salesTaxAmount = (salesTaxPct / 100) * taxableBase;
  const totalFinanced = Math.max(0, vehiclePrice - downPayment - netTradeIn + salesTaxAmount + dealerFees - cashRebate);

  const monthlyRate = interestRate > 0 ? (interestRate / 100) / 12 : 0;
  let monthlyPayment = 0;
  if (totalFinanced > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = totalFinanced / loanTermMonths;
    } else {
      monthlyPayment =
        (totalFinanced * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    }
  }

  const totalRepayment = monthlyPayment * loanTermMonths;
  const totalInterest = Math.max(0, totalRepayment - totalFinanced);
  const totalCostOfVehicle = downPayment + Math.max(0, tradeInValue) + totalRepayment + dealerFees + salesTaxAmount;

  const amortizationSchedule: AmortizationRow[] = [];
  let balance = totalFinanced;
  let accumulatedInterest = 0;

  for (let m = 1; m <= loanTermMonths && balance > 0; m++) {
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, monthlyPayment - interest);
    balance = Math.max(0, balance - principal);
    accumulatedInterest += interest;

    amortizationSchedule.push({
      period: m,
      payment: principal + interest,
      principalPaid: principal,
      interestPaid: interest,
      remainingBalance: Math.round(balance * 100) / 100,
      totalInterestPaid: Math.round(accumulatedInterest * 100) / 100,
    });
  }

  return {
    monthlyPayment,
    totalFinanced,
    netTradeIn,
    salesTaxAmount,
    totalInterest,
    totalCostOfVehicle,
    amortizationSchedule,
  };
}

// -------------------------------------------------------------
// 11. PERSONAL LOAN & APR ENGINE
// -------------------------------------------------------------
export function calculatePersonalLoan(inputs: PersonalLoanInputs): PersonalLoanResults {
  const loanAmount = sanitizeNumber(inputs.loanAmount, 0, 0);
  const interestRate = sanitizeNumber(inputs.interestRate, 0, 0);
  const loanTermMonths = Math.max(1, sanitizeNumber(inputs.loanTermMonths, 36, 1));
  const originationFeePct = sanitizeNumber(inputs.originationFeePct, 0, 0);

  const originationFeeAmount = (originationFeePct / 100) * loanAmount;
  const netDisbursedAmount = Math.max(0, loanAmount - originationFeeAmount);

  const monthlyRate = interestRate > 0 ? (interestRate / 100) / 12 : 0;
  let monthlyPayment = 0;
  if (loanAmount > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / loanTermMonths;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    }
  }

  const totalRepayment = monthlyPayment * loanTermMonths;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);
  const totalFinanceCharge = totalInterest + originationFeeAmount;
  const effectiveAPR = netDisbursedAmount > 0 && loanTermMonths > 0
    ? (2 * 12 * totalFinanceCharge) / (netDisbursedAmount * (loanTermMonths + 1)) * 100
    : interestRate;

  const amortizationSchedule: AmortizationRow[] = [];
  let balance = loanAmount;
  let accumulatedInterest = 0;

  for (let m = 1; m <= loanTermMonths && balance > 0; m++) {
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, monthlyPayment - interest);
    balance = Math.max(0, balance - principal);
    accumulatedInterest += interest;

    amortizationSchedule.push({
      period: m,
      payment: principal + interest,
      principalPaid: principal,
      interestPaid: interest,
      remainingBalance: Math.round(balance * 100) / 100,
      totalInterestPaid: Math.round(accumulatedInterest * 100) / 100,
    });
  }

  return {
    monthlyPayment,
    originationFeeAmount,
    netDisbursedAmount,
    effectiveAPR,
    totalInterest,
    totalRepayment,
    amortizationSchedule,
  };
}

// -------------------------------------------------------------
// 12. SAVINGS GOAL & TARGET ENGINE
// -------------------------------------------------------------
export function calculateSavingsGoal(inputs: SavingsGoalInputs): SavingsGoalResults {
  const targetAmount = sanitizeNumber(inputs.targetAmount, 0, 0);
  const currentSavings = sanitizeNumber(inputs.currentSavings, 0, 0);
  const timeframeMonths = Math.max(1, sanitizeNumber(inputs.timeframeMonths, 12, 1));
  const annualReturnRate = sanitizeNumber(inputs.annualReturnRate, 0, 0);
  const monthlyRate = annualReturnRate > 0 ? (annualReturnRate / 100) / 12 : 0;

  const progressPercentage = targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0;
  const lumpSumNeededToday = monthlyRate > 0
    ? targetAmount / Math.pow(1 + monthlyRate, timeframeMonths)
    : targetAmount;

  let requiredMonthlyDeposit = 0;
  if (monthlyRate === 0) {
    requiredMonthlyDeposit = Math.max(0, (targetAmount - currentSavings) / timeframeMonths);
  } else {
    const futureValueOfInitial = currentSavings * Math.pow(1 + monthlyRate, timeframeMonths);
    const shortfall = Math.max(0, targetAmount - futureValueOfInitial);
    const annuityFactor = (Math.pow(1 + monthlyRate, timeframeMonths) - 1) / monthlyRate;
    requiredMonthlyDeposit = shortfall / annuityFactor;
  }

  const monthlySchedule: Array<{ month: number; deposit: number; interest: number; balance: number }> = [];
  let balance = currentSavings;
  let totalDeposited = currentSavings;

  for (let m = 1; m <= timeframeMonths; m++) {
    const interest = balance * monthlyRate;
    balance += requiredMonthlyDeposit + interest;
    totalDeposited += requiredMonthlyDeposit;

    monthlySchedule.push({
      month: m,
      deposit: Math.round(requiredMonthlyDeposit * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  const interestEarned = Math.max(0, balance - totalDeposited);

  return {
    requiredMonthlyDeposit,
    totalDeposited,
    interestEarned,
    lumpSumNeededToday,
    progressPercentage,
    monthlySchedule,
  };
}

// -------------------------------------------------------------
// 13. RETIREMENT & NEST EGG ENGINE
// -------------------------------------------------------------
export function calculateRetirement(inputs: RetirementInputs): RetirementResults {
  const currentAge = sanitizeNumber(inputs.currentAge, 30, 0);
  const retirementAge = Math.max(currentAge + 1, sanitizeNumber(inputs.retirementAge, 65, 1));
  const lifeExpectancy = Math.max(retirementAge + 1, sanitizeNumber(inputs.lifeExpectancy, 85, 1));
  const currentNestEgg = sanitizeNumber(inputs.currentNestEgg, 0, 0);
  const monthlyContribution = sanitizeNumber(inputs.monthlyContribution, 0, 0);
  const preRate = sanitizeNumber(inputs.expectedAnnualReturnPre, 7, 0) / 100;
  const postRate = sanitizeNumber(inputs.expectedAnnualReturnPost, 5, 0) / 100;
  const desiredIncomeMonthly = sanitizeNumber(inputs.desiredMonthlyRetirementIncome, 3000, 0);
  const inflationRate = sanitizeNumber(inputs.inflationRate, 2.5, 0) / 100;
  const pensionOffsetMonthly = sanitizeNumber(inputs.pensionOrSocialSecurityMonthly, 0, 0);

  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const monthsInRetirement = yearsInRetirement * 12;

  const preMonthlyRate = preRate / 12;
  let accumulatedNestEgg = currentNestEgg;
  for (let m = 1; m <= monthsToRetirement; m++) {
    accumulatedNestEgg = (accumulatedNestEgg + monthlyContribution) * (1 + preMonthlyRate);
  }

  const inflationFactor = Math.pow(1 + inflationRate, yearsToRetirement);
  const futureMonthlyDesiredIncome = desiredIncomeMonthly * inflationFactor;
  const netMonthlyDrawNeeded = Math.max(0, futureMonthlyDesiredIncome - pensionOffsetMonthly);

  const postMonthlyRate = postRate / 12;
  let totalRequiredNestEgg = 0;
  if (postMonthlyRate === 0) {
    totalRequiredNestEgg = netMonthlyDrawNeeded * monthsInRetirement;
  } else {
    totalRequiredNestEgg = netMonthlyDrawNeeded * (1 - Math.pow(1 + postMonthlyRate, -monthsInRetirement)) / postMonthlyRate;
  }

  const totalFundingSurplusOrDeficit = accumulatedNestEgg - totalRequiredNestEgg;
  const isOnTrack = totalFundingSurplusOrDeficit >= 0;

  let requiredMonthlySavings = monthlyContribution;
  if (!isOnTrack && monthsToRetirement > 0) {
    const fvInitial = currentNestEgg * Math.pow(1 + preMonthlyRate, monthsToRetirement);
    const deficitToFund = Math.max(0, totalRequiredNestEgg - fvInitial);
    const annuityFactor = preMonthlyRate > 0
      ? (Math.pow(1 + preMonthlyRate, monthsToRetirement) - 1) / preMonthlyRate
      : monthsToRetirement;
    requiredMonthlySavings = annuityFactor > 0 ? deficitToFund / annuityFactor : 0;
  }

  const monthlyFundingGap = Math.max(0, requiredMonthlySavings - monthlyContribution);

  const timeline: Array<{ age: number; year: number; balance: number; contributions: number; drawdowns: number }> = [];
  let currentBalance = currentNestEgg;
  let totalContrib = 0;
  let totalDraw = 0;

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    const yearIndex = age - currentAge;
    if (age < retirementAge) {
      if (yearIndex > 0) {
        for (let m = 1; m <= 12; m++) {
          currentBalance = (currentBalance + monthlyContribution) * (1 + preMonthlyRate);
          totalContrib += monthlyContribution;
        }
      }
      timeline.push({
        age,
        year: yearIndex,
        balance: Math.round(currentBalance),
        contributions: Math.round(totalContrib),
        drawdowns: 0,
      });
    } else {
      if (yearIndex > 0) {
        for (let m = 1; m <= 12; m++) {
          currentBalance = Math.max(0, (currentBalance - netMonthlyDrawNeeded) * (1 + postMonthlyRate));
          totalDraw += netMonthlyDrawNeeded;
        }
      }
      timeline.push({
        age,
        year: yearIndex,
        balance: Math.round(currentBalance),
        contributions: Math.round(totalContrib),
        drawdowns: Math.round(totalDraw),
      });
    }
  }

  return {
    nestEggAtRetirement: accumulatedNestEgg,
    totalRequiredNestEgg,
    monthlyFundingGap,
    totalFundingSurplusOrDeficit,
    isOnTrack,
    requiredMonthlySavings,
    yearsInRetirement,
    timeline,
  };
}

// -------------------------------------------------------------
// 14. MULTI-DEBT PAYOFF ENGINE (AVALANCHE VS SNOWBALL)
// -------------------------------------------------------------
export function calculateMultiDebtPayoff(inputs: MultiDebtPayoffInputs): MultiDebtPayoffResults {
  const extraMonthlyPayment = sanitizeNumber(inputs.extraMonthlyPayment, 0, 0);
  const debts = inputs.debts || [];

  const simulateStrategy = (strategy: 'snowball' | 'avalanche' | 'minimum-only'): DebtPayoffPlanSummary => {
    if (debts.length === 0) {
      return {
        strategy,
        totalMonths: 0,
        debtFreeDateStr: 'Immediately',
        totalInterestPaid: 0,
        totalPaid: 0,
        payoffOrder: [],
      };
    }

    type SimDebt = { id: string; name: string; balance: number; rate: number; minPayment: number; paidOffMonth?: number };
    const simDebts: SimDebt[] = debts.map(d => ({
      id: d.id,
      name: d.name,
      balance: sanitizeNumber(d.balance, 0, 0),
      rate: sanitizeNumber(d.interestRate, 0, 0),
      minPayment: sanitizeNumber(d.minimumPayment, 0, 0),
    })).filter(d => d.balance > 0);

    let month = 0;
    let totalInterestPaid = 0;
    let totalPaid = 0;
    const payoffOrder: string[] = [];
    const maxMonths = 600;

    while (simDebts.some(d => d.balance > 0.01) && month < maxMonths) {
      month++;
      let extraBudget = strategy === 'minimum-only' ? 0 : extraMonthlyPayment;

      for (const d of simDebts) {
        if (d.balance > 0) {
          const monthlyInterest = d.balance * (d.rate / 100 / 12);
          d.balance += monthlyInterest;
          totalInterestPaid += monthlyInterest;

          const payment = Math.min(d.balance, d.minPayment);
          d.balance -= payment;
          totalPaid += payment;

          if (d.balance <= 0.01 && !d.paidOffMonth) {
            d.balance = 0;
            d.paidOffMonth = month;
            payoffOrder.push(d.name);
          }
        } else if (strategy !== 'minimum-only') {
          extraBudget += d.minPayment;
        }
      }

      if (extraBudget > 0) {
        const activeDebts = simDebts.filter(d => d.balance > 0);
        if (strategy === 'snowball') {
          activeDebts.sort((a, b) => a.balance - b.balance);
        } else if (strategy === 'avalanche') {
          activeDebts.sort((a, b) => b.rate - a.rate);
        }

        for (const target of activeDebts) {
          if (extraBudget <= 0) break;
          const pay = Math.min(target.balance, extraBudget);
          target.balance -= pay;
          totalPaid += pay;
          extraBudget -= pay;

          if (target.balance <= 0.01 && !target.paidOffMonth) {
            target.balance = 0;
            target.paidOffMonth = month;
            payoffOrder.push(target.name);
          }
        }
      }
    }

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + month);
    const debtFreeDateStr = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      strategy,
      totalMonths: month,
      debtFreeDateStr,
      totalInterestPaid,
      totalPaid,
      payoffOrder,
    };
  };

  const avalanche = simulateStrategy('avalanche');
  const snowball = simulateStrategy('snowball');
  const minimumOnly = simulateStrategy('minimum-only');

  const interestSavedAvalancheVsMinimum = Math.max(0, minimumOnly.totalInterestPaid - avalanche.totalInterestPaid);
  const monthsSavedAvalancheVsMinimum = Math.max(0, minimumOnly.totalMonths - avalanche.totalMonths);
  const interestSavedSnowballVsMinimum = Math.max(0, minimumOnly.totalInterestPaid - snowball.totalInterestPaid);
  const monthsSavedSnowballVsMinimum = Math.max(0, minimumOnly.totalMonths - snowball.totalMonths);

  const scheduleByMonth: Array<{ month: number; remainingTotalBalance: number; paymentsByDebt: Record<string, number> }> = [];
  let remainingTotal = debts.reduce((s, d) => s + sanitizeNumber(d.balance, 0, 0), 0);
  const avgMonthlyReduction = (avalanche.totalPaid / Math.max(1, avalanche.totalMonths));

  for (let m = 1; m <= Math.min(60, avalanche.totalMonths); m++) {
    remainingTotal = Math.max(0, remainingTotal - (avgMonthlyReduction * 0.85));
    scheduleByMonth.push({
      month: m,
      remainingTotalBalance: Math.round(remainingTotal),
      paymentsByDebt: {},
    });
  }

  return {
    avalanche,
    snowball,
    minimumOnly,
    interestSavedAvalancheVsMinimum,
    monthsSavedAvalancheVsMinimum,
    interestSavedSnowballVsMinimum,
    monthsSavedSnowballVsMinimum,
    scheduleByMonth,
  };
}

// -------------------------------------------------------------
// 15. DEBT-TO-INCOME (DTI) DIAGNOSTIC ENGINE
// -------------------------------------------------------------
export function calculateDTI(inputs: DTIInputs): DTIResults {
  const grossMonthlyIncome = sanitizeNumber(inputs.grossMonthlyIncome, 0, 0);
  const housing = sanitizeNumber(inputs.monthlyMortgageOrRent, 0, 0) +
    sanitizeNumber(inputs.propertyTaxMonthly, 0, 0) +
    sanitizeNumber(inputs.homeInsuranceMonthly, 0, 0);
  const nonHousing = sanitizeNumber(inputs.autoLoanMonthly, 0, 0) +
    sanitizeNumber(inputs.studentLoanMonthly, 0, 0) +
    sanitizeNumber(inputs.creditCardMinMonthly, 0, 0) +
    sanitizeNumber(inputs.otherDebtMonthly, 0, 0);
  const totalMonthlyDebt = housing + nonHousing;

  const frontEndDTI = grossMonthlyIncome > 0 ? (housing / grossMonthlyIncome) * 100 : 0;
  const backEndDTI = grossMonthlyIncome > 0 ? (totalMonthlyDebt / grossMonthlyIncome) * 100 : 0;
  const maximumRecommendedTotalDebt = grossMonthlyIncome * 0.36;

  let status: 'healthy' | 'moderate' | 'high' = 'healthy';
  const recommendations: string[] = [];

  if (backEndDTI <= 36) {
    status = 'healthy';
    recommendations.push('Your debt-to-income ratio is in the prime tier for most prime lending and mortgage approvals.');
    recommendations.push('Maintain an emergency fund of 3-6 months to protect your debt servicing capability.');
  } else if (backEndDTI <= 43) {
    status = 'moderate';
    recommendations.push('Your debt burden is manageable but approaching conventional mortgage underwriting limits (43%).');
    recommendations.push('Focus on accelerating non-housing debt payoffs before taking on additional obligations.');
  } else {
    status = 'high';
    recommendations.push('Your debt-to-income exceeds 43%, which may limit access to favorable credit terms or mortgage eligibility.');
    recommendations.push('Consider aggressive debt restructuring, consolidating high-rate debt, or increasing income.');
  }

  if (frontEndDTI > 28) {
    recommendations.push(`Housing expenses represent ${frontEndDTI.toFixed(1)}% of income, exceeding the standard 28% front-end guideline.`);
  }

  return {
    frontEndDTI,
    backEndDTI,
    totalHousingExpenses: housing,
    totalNonHousingDebt: nonHousing,
    totalMonthlyDebt,
    maximumRecommendedTotalDebt,
    status,
    recommendations,
  };
}

// -------------------------------------------------------------
// 16. NET WORTH & ALLOCATION ENGINE
// -------------------------------------------------------------
export function calculateNetWorth(inputs: NetWorthInputs): NetWorthResults {
  const a = inputs.assets;
  const l = inputs.liabilities;

  const cashAndSavings = sanitizeNumber(a.cashAndSavings, 0, 0);
  const realEstate = sanitizeNumber(a.realEstate, 0, 0);
  const retirementAccounts = sanitizeNumber(a.retirementAccounts, 0, 0);
  const taxableInvestments = sanitizeNumber(a.taxableInvestments, 0, 0);
  const vehiclesAndValuables = sanitizeNumber(a.vehiclesAndValuables, 0, 0);
  const businessEquity = sanitizeNumber(a.businessEquity, 0, 0);

  const totalAssets = cashAndSavings + realEstate + retirementAccounts + taxableInvestments + vehiclesAndValuables + businessEquity;

  const mortgages = sanitizeNumber(l.mortgages, 0, 0);
  const autoLoans = sanitizeNumber(l.autoLoans, 0, 0);
  const studentLoans = sanitizeNumber(l.studentLoans, 0, 0);
  const creditCards = sanitizeNumber(l.creditCards, 0, 0);
  const personalLoans = sanitizeNumber(l.personalLoans, 0, 0);
  const otherLiabilities = sanitizeNumber(l.otherLiabilities, 0, 0);

  const totalLiabilities = mortgages + autoLoans + studentLoans + creditCards + personalLoans + otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidAssets = cashAndSavings;
  const liquidRatio = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;

  const assetDistribution = [
    { category: 'Cash & Liquid Savings', amount: cashAndSavings, percentage: totalAssets > 0 ? (cashAndSavings / totalAssets) * 100 : 0, color: '#10b981' },
    { category: 'Real Estate Equity', amount: realEstate, percentage: totalAssets > 0 ? (realEstate / totalAssets) * 100 : 0, color: '#3b82f6' },
    { category: 'Retirement Accounts', amount: retirementAccounts, percentage: totalAssets > 0 ? (retirementAccounts / totalAssets) * 100 : 0, color: '#8b5cf6' },
    { category: 'Taxable Investments', amount: taxableInvestments, percentage: totalAssets > 0 ? (taxableInvestments / totalAssets) * 100 : 0, color: '#06b6d4' },
    { category: 'Vehicles & Valuables', amount: vehiclesAndValuables, percentage: totalAssets > 0 ? (vehiclesAndValuables / totalAssets) * 100 : 0, color: '#f59e0b' },
    { category: 'Business Equity', amount: businessEquity, percentage: totalAssets > 0 ? (businessEquity / totalAssets) * 100 : 0, color: '#ec4899' },
  ].filter(item => item.amount > 0);

  const liabilityDistribution = [
    { category: 'Mortgages', amount: mortgages, percentage: totalLiabilities > 0 ? (mortgages / totalLiabilities) * 100 : 0, color: '#ef4444' },
    { category: 'Auto Loans', amount: autoLoans, percentage: totalLiabilities > 0 ? (autoLoans / totalLiabilities) * 100 : 0, color: '#f97316' },
    { category: 'Student Loans', amount: studentLoans, percentage: totalLiabilities > 0 ? (studentLoans / totalLiabilities) * 100 : 0, color: '#eab308' },
    { category: 'Credit Cards', amount: creditCards, percentage: totalLiabilities > 0 ? (creditCards / totalLiabilities) * 100 : 0, color: '#dc2626' },
    { category: 'Personal Loans', amount: personalLoans, percentage: totalLiabilities > 0 ? (personalLoans / totalLiabilities) * 100 : 0, color: '#b91c1c' },
    { category: 'Other Liabilities', amount: otherLiabilities, percentage: totalLiabilities > 0 ? (otherLiabilities / totalLiabilities) * 100 : 0, color: '#64748b' },
  ].filter(item => item.amount > 0);

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    debtToAssetRatio,
    liquidAssets,
    liquidRatio,
    assetDistribution,
    liabilityDistribution,
  };
}

// -------------------------------------------------------------
// 17. FINANCIAL GOALS ALLOCATION ENGINE
// -------------------------------------------------------------
export function calculateFinancialGoals(inputs: FinancialGoalInputs): FinancialGoalsResults {
  const monthlySavingsBudget = sanitizeNumber(inputs.monthlySavingsBudget, 0, 0);
  const goals = inputs.goals || [];

  let totalTargetAmount = 0;
  let totalCurrentAmount = 0;
  let totalRequiredMonthly = 0;

  const now = new Date();

  const goalResults = goals.map(goal => {
    const target = sanitizeNumber(goal.targetAmount, 0, 0);
    const current = sanitizeNumber(goal.currentAmount, 0, 0);
    totalTargetAmount += target;
    totalCurrentAmount += current;

    let monthsRemaining = 12;
    if (goal.targetDate) {
      const parts = goal.targetDate.split('-');
      if (parts.length >= 2) {
        const targetYear = parseInt(parts[0], 10);
        const targetMonth = parseInt(parts[1], 10);
        monthsRemaining = Math.max(1, (targetYear - now.getFullYear()) * 12 + (targetMonth - (now.getMonth() + 1)));
      }
    }

    const needed = Math.max(0, target - current);
    const requiredMonthlySavings = needed / monthsRemaining;
    totalRequiredMonthly += requiredMonthlySavings;

    return {
      goal,
      monthsRemaining,
      requiredMonthlySavings,
      shortfallOrSurplus: 0,
      isAchievableWithBudget: true,
      projectedCompletionDate: goal.targetDate,
      allocatedMonthlySavings: 0,
    };
  });

  const weights: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const totalWeight = goalResults.reduce((sum, g) => sum + (weights[g.goal.priority] || 2), 0);

  for (const item of goalResults) {
    const itemWeight = weights[item.goal.priority] || 2;
    const allocated = totalWeight > 0 ? (monthlySavingsBudget * itemWeight) / totalWeight : 0;
    item.allocatedMonthlySavings = allocated;
    item.shortfallOrSurplus = allocated - item.requiredMonthlySavings;
    item.isAchievableWithBudget = allocated >= item.requiredMonthlySavings;
  }

  const overallProgressPct = totalTargetAmount > 0 ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100) : 0;
  const budgetSurplusDeficit = monthlySavingsBudget - totalRequiredMonthly;

  return {
    goals: goalResults,
    totalTargetAmount,
    totalCurrentAmount,
    totalRequiredMonthly,
    overallProgressPct,
    budgetSurplusDeficit,
  };
}

// -------------------------------------------------------------
// 18. SCENARIO COMPARISON ENGINE
// -------------------------------------------------------------
export function compareScenarios(inputs: ScenarioComparisonInputs): ScenarioComparisonResults {
  const scenarios = inputs.scenarios || [];

  if (scenarios.length === 0) {
    return {
      scenarios: [],
      lowestCostScenarioId: '',
      highestEndingValueScenarioId: '',
      deltaSummary: [],
    };
  }

  const evaluated = scenarios.map(s => {
    const upfront = sanitizeNumber(s.upfrontCost, 0, 0);
    const monthly = sanitizeNumber(s.monthlyOngoingCost, 0, 0);
    const years = Math.max(1, sanitizeNumber(s.termYears, 5, 1));
    const totalCost = upfront + (monthly * years * 12);
    const rate = sanitizeNumber(s.annualGrowthRate, 0, 0) / 100;
    
    let endingValue = sanitizeNumber(s.projectedEndingNetValue, 0, 0);
    if (endingValue === 0 && rate > 0) {
      endingValue = upfront * Math.pow(1 + rate, years);
    }

    return {
      ...s,
      totalCostOverTerm: totalCost,
      projectedEndingNetValue: endingValue,
    };
  });

  let lowestCostScenarioId = evaluated[0]?.id || '';
  let minCost = evaluated[0]?.totalCostOverTerm ?? Infinity;

  let highestEndingValueScenarioId = evaluated[0]?.id || '';
  let maxValue = evaluated[0]?.projectedEndingNetValue ?? -Infinity;

  for (const s of evaluated) {
    if (s.totalCostOverTerm < minCost) {
      minCost = s.totalCostOverTerm;
      lowestCostScenarioId = s.id;
    }
    if (s.projectedEndingNetValue > maxValue) {
      maxValue = s.projectedEndingNetValue;
      highestEndingValueScenarioId = s.id;
    }
  }

  const deltaSummary = [
    {
      metric: 'Total Cost Over Term',
      scenarioValues: Object.fromEntries(evaluated.map(s => [s.id, s.totalCostOverTerm])),
      difference: evaluated.length > 1 ? Math.abs(evaluated[0].totalCostOverTerm - evaluated[1].totalCostOverTerm) : 0,
    },
    {
      metric: 'Monthly Ongoing Expense',
      scenarioValues: Object.fromEntries(evaluated.map(s => [s.id, s.monthlyOngoingCost])),
      difference: evaluated.length > 1 ? Math.abs(evaluated[0].monthlyOngoingCost - evaluated[1].monthlyOngoingCost) : 0,
    },
    {
      metric: 'Projected Ending Net Value',
      scenarioValues: Object.fromEntries(evaluated.map(s => [s.id, s.projectedEndingNetValue])),
      difference: evaluated.length > 1 ? Math.abs(evaluated[0].projectedEndingNetValue - evaluated[1].projectedEndingNetValue) : 0,
    },
  ];

  return {
    scenarios: evaluated,
    lowestCostScenarioId,
    highestEndingValueScenarioId,
    deltaSummary,
  };
}

