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
} from '../types/calculators';

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
  const monthlyRate = ratePct > 0 ? (ratePct / 100) / 12 : 0;

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

  const totalExpenses =
    housing +
    food +
    transportation +
    utilities +
    debtPayments +
    entertainment +
    otherExpenses;

  const remainingBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (remainingBalance / totalIncome) * 100) : 0;

  const categories = [
    { category: 'Housing', amount: housing, color: '#3b82f6' },
    { category: 'Food & Groceries', amount: food, color: '#10b981' },
    { category: 'Transportation', amount: transportation, color: '#f59e0b' },
    { category: 'Utilities', amount: utilities, color: '#8b5cf6' },
    { category: 'Debt Payments', amount: debtPayments, color: '#ef4444' },
    { category: 'Entertainment', amount: entertainment, color: '#ec4899' },
    { category: 'Other Expenses', amount: otherExpenses, color: '#64748b' },
  ];

  const expenseBreakdown: ExpenseCategoryBreakdown[] = categories
    .filter((c) => c.amount > 0)
    .map((c) => ({
      ...c,
      percentage: totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0,
    }));

  // 50/30/20 Rule:
  // Needs: Housing, Food, Transportation, Utilities, Debt
  // Wants: Entertainment, Other
  // Savings: Remaining Balance
  const needsTotal = housing + food + transportation + utilities + debtPayments;
  const wantsTotal = entertainment + otherExpenses;
  const savingsTotal = Math.max(0, remainingBalance);

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
