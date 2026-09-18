import { describe, it, expect } from 'vitest';
import {
  calculateLoanPayment,
  calculateLoanWithPrepayment,
  calculateRealPurchasingPower,
  calculateSavingsGrowth,
  calculateCompoundInterest,
  calculateInvestment,
  calculateDebtPayoff,
  calculateBudget,
  sanitizeNumber,
} from '../financialMath';
import { formatCurrency, formatDurationMonths } from '../formatters';

describe('Sanitize Number Utility', () => {
  it('handles standard numbers, strings, and fallbacks cleanly', () => {
    expect(sanitizeNumber(100)).toBe(100);
    expect(sanitizeNumber('250.5')).toBe(250.5);
    expect(sanitizeNumber('', 10)).toBe(10);
    expect(sanitizeNumber(null, 5)).toBe(5);
    expect(sanitizeNumber(-20, 0, 0)).toBe(0);
    expect(sanitizeNumber('invalid', 42)).toBe(42);
  });
});

describe('Module 1: Loan Calculator & Amortization Engine', () => {
  it('[TC-LOAN-001] calculates standard 1-year monthly loan repayments and schedule', () => {
    const result = calculateLoanPayment(1_000_000, 12, 1, 'monthly');
    expect(result.periodicPayment).toBeCloseTo(88848.79, 0);
    expect(result.totalRepayment).toBeCloseTo(1066185.47, 0);
    expect(result.totalInterest).toBeCloseTo(66185.47, 0);
    expect(result.amortizationSchedule.length).toBe(12);
    expect(result.amortizationSchedule[11].remainingBalance).toBe(0);
  });

  it('[TC-LOAN-002] handles 0% interest loan without division by zero', () => {
    const result = calculateLoanPayment(120_000, 0, 1, 'monthly');
    expect(result.periodicPayment).toBe(10_000);
    expect(result.totalRepayment).toBe(120_000);
    expect(result.totalInterest).toBe(0);
    expect(result.amortizationSchedule.length).toBe(12);
    expect(result.amortizationSchedule[11].remainingBalance).toBe(0);
  });

  it('[TC-LOAN-003] generates 26 periods for bi-weekly repayment schedules', () => {
    const result = calculateLoanPayment(500_000, 10, 1, 'bi-weekly');
    expect(result.amortizationSchedule.length).toBe(26);
    expect(result.periodicPayment).toBeCloseTo(20245.26, 0);
    expect(result.amortizationSchedule[25].remainingBalance).toBe(0);
  });

  it('[TC-LOAN-004] generates 52 periods for weekly repayment schedules', () => {
    const result = calculateLoanPayment(500_000, 10, 1, 'weekly');
    expect(result.amortizationSchedule.length).toBe(52);
    expect(result.periodicPayment).toBeCloseTo(10113.40, 0);
    expect(result.amortizationSchedule[51].remainingBalance).toBe(0);
  });

  it('[TC-LOAN-005] handles zero principal edge case gracefully', () => {
    const result = calculateLoanPayment(0, 10, 5, 'monthly');
    expect(result.periodicPayment).toBe(0);
    expect(result.totalRepayment).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.amortizationSchedule.length).toBe(0);
  });
});

describe('Module 2: Loan Prepayment & Lump-Sum Simulator', () => {
  it('[TC-PREPAY-001] calculates savings and term reduction with extra monthly payments', () => {
    const standard = calculateLoanPayment(5_000_000, 15, 5, 'monthly');
    const accelerated = calculateLoanWithPrepayment(5_000_000, 15, 5, 'monthly', 50_000, 0, 1);

    expect(accelerated.acceleratedPeriods).toBeLessThan(standard.amortizationSchedule.length);
    expect(accelerated.interestSaved).toBeGreaterThan(0);
    expect(accelerated.periodsSaved).toBeGreaterThan(0);
    expect(accelerated.acceleratedTotalInterest).toBeLessThan(standard.totalInterest);
  });

  it('[TC-PREPAY-002] calculates savings from a one-time lump-sum prepayment in Year 1', () => {
    const standard = calculateLoanPayment(5_000_000, 15, 5, 'monthly');
    const accelerated = calculateLoanWithPrepayment(5_000_000, 15, 5, 'monthly', 0, 1_000_000, 1);

    expect(accelerated.acceleratedPeriods).toBeLessThan(standard.amortizationSchedule.length);
    expect(accelerated.interestSaved).toBeGreaterThan(100_000);
  });

  it('[TC-PREPAY-003] combines extra monthly payment and lump-sum prepayment', () => {
    const standard = calculateLoanPayment(5_000_000, 15, 5, 'monthly');
    const accelerated = calculateLoanWithPrepayment(5_000_000, 15, 5, 'monthly', 25_000, 500_000, 1);

    expect(accelerated.yearsSaved).toBeGreaterThan(1.0);
    expect(accelerated.interestSaved).toBeGreaterThan(300_000);
  });
});

describe('Module 3: Savings & Compounding Growth Engine', () => {
  it('[TC-SAVE-001] calculates 2-year savings with monthly contributions and interest', () => {
    const result = calculateSavingsGrowth(100_000, 10_000, 10, 2, 'monthly');
    expect(result.totalContributions).toBe(340_000);
    expect(result.finalBalance).toBeGreaterThan(375_000);
    expect(result.interestEarned).toBe(result.finalBalance - result.totalContributions);
    expect(result.growthTimeline.length).toBe(3); // Year 0, 1, 2
  });

  it('[TC-SAVE-002] handles 0% interest rate with exact principal sum', () => {
    const result = calculateSavingsGrowth(50_000, 5_000, 0, 1, 'monthly');
    expect(result.totalContributions).toBe(110_000);
    expect(result.finalBalance).toBe(110_000);
    expect(result.interestEarned).toBe(0);
  });

  it('[TC-SAVE-003] projects 5-year high-yield savings growth', () => {
    const result = calculateSavingsGrowth(200_000, 50_000, 9, 5, 'monthly');
    expect(result.totalContributions).toBe(3_200_000);
    expect(result.finalBalance).toBeGreaterThan(4_000_000);
    expect(result.interestEarned).toBeGreaterThan(800_000);
  });
});

describe('Module 4: Inflation Discounting Engine', () => {
  it('[TC-INFL-001] discounts nominal value at 10% annual inflation over 1 year', () => {
    const realVal = calculateRealPurchasingPower(1_000_000, 10, 1);
    expect(realVal).toBeCloseTo(909090.91, 1);
  });

  it('[TC-INFL-002] returns exact nominal value when inflation is 0%', () => {
    expect(calculateRealPurchasingPower(500_000, 0, 5)).toBe(500_000);
  });

  it('[TC-INFL-003] computes real purchasing power points in savings timeline', () => {
    const result = calculateSavingsGrowth(100_000, 10_000, 10, 2, 'monthly', 5);
    const lastPoint = result.growthTimeline[result.growthTimeline.length - 1];
    expect(lastPoint.realPurchasingPower).toBeDefined();
    expect(lastPoint.realPurchasingPower!).toBeLessThan(lastPoint.totalBalance);
  });
});

describe('Module 5: Compound Interest Multi-Frequency Engine', () => {
  it('[TC-COMP-001] calculates compound interest with monthly contributions over 3 years', () => {
    const result = calculateCompoundInterest(100_000, 8, 5_000, 'monthly', 3, 'monthly');
    expect(result.principal).toBe(100_000);
    expect(result.totalContributions).toBe(180_000);
    expect(result.futureValue).toBeGreaterThan(280_000);
    expect(result.interestEarned).toBeGreaterThan(20_000);
  });

  it('[TC-COMP-002] handles 0% interest compounding correctly', () => {
    const result = calculateCompoundInterest(200_000, 0, 10_000, 'monthly', 2, 'annually');
    expect(result.principal).toBe(200_000);
    expect(result.totalContributions).toBe(240_000);
    expect(result.futureValue).toBe(440_000);
    expect(result.interestEarned).toBe(0);
  });

  it('[TC-COMP-003] verifies daily compounding yields higher future value than annual', () => {
    const daily = calculateCompoundInterest(1_000_000, 12, 0, 'monthly', 5, 'daily');
    const annual = calculateCompoundInterest(1_000_000, 12, 0, 'monthly', 5, 'annually');
    expect(daily.futureValue).toBeGreaterThan(annual.futureValue);
  });
});

describe('Module 6: Investment Calculator Engine', () => {
  it('[TC-INV-001] projects 5-year equity index investment portfolio value', () => {
    const result = calculateInvestment(500_000, 20_000, 12, 5);
    const expectedInvested = 500_000 + 20_000 * 60; // 1,700,000
    expect(result.totalInvested).toBe(expectedInvested);
    expect(result.futureInvestmentValue).toBeGreaterThan(expectedInvested);
    expect(result.estimatedGrowth).toBe(result.futureInvestmentValue - expectedInvested);
  });

  it('[TC-INV-002] handles 0% expected return gracefully', () => {
    const result = calculateInvestment(100_000, 10_000, 0, 1);
    expect(result.totalInvested).toBe(220_000);
    expect(result.futureInvestmentValue).toBe(220_000);
    expect(result.estimatedGrowth).toBe(0);
  });
});

describe('Module 7: Accelerated Debt Payoff Engine', () => {
  it('[TC-DEBT-001] calculates accelerated payoff time and interest savings', () => {
    const result = calculateDebtPayoff(1_000_000, 18, 50_000, 20_000);
    expect(result.isValidPayment).toBe(true);
    expect(result.acceleratedPayoffMonths).toBeLessThan(result.standardPayoffMonths);
    expect(result.acceleratedTotalInterest).toBeLessThan(result.standardTotalInterest);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  it('[TC-DEBT-002] alerts when monthly payment is below monthly interest (negative amortization)', () => {
    // ₦1,000,000 at 24% APR has monthly interest of ₦20,000. Payment of ₦10,000 is invalid.
    const result = calculateDebtPayoff(1_000_000, 24, 10_000, 0);
    expect(result.isValidPayment).toBe(false);
    expect(result.minMonthlyInterest).toBeGreaterThanOrEqual(20_000);
  });

  it('[TC-DEBT-003] handles zero debt balance gracefully', () => {
    const result = calculateDebtPayoff(0, 15, 20_000, 5_000);
    expect(result.isValidPayment).toBe(false);
    expect(result.standardPayoffMonths).toBe(0);
  });
});

describe('Module 8: Budget Calculator & 50/30/20 Benchmark', () => {
  it('[TC-BUDG-001] calculates surplus, savings rate, and 7 categories for healthy budget', () => {
    const result = calculateBudget({
      salary: 500_000,
      otherIncome: 50_000,
      expenses: {
        housing: 150_000,
        food: 80_000,
        transportation: 40_000,
        utilities: 30_000,
        debtPayments: 20_000,
        entertainment: 30_000,
        otherExpenses: 20_000,
      },
    });

    expect(result.totalIncome).toBe(550_000);
    expect(result.totalExpenses).toBe(370_000);
    expect(result.remainingBalance).toBe(180_000);
    expect(result.savingsRate).toBeCloseTo((180_000 / 550_000) * 100, 1);
    expect(result.expenseBreakdown.length).toBe(7);
    expect(result.rule50_30_20.needs.percentage).toBeLessThanOrEqual(60);
  });

  it('[TC-BUDG-002] handles deficit budget correctly without negative savings rate', () => {
    const result = calculateBudget({
      salary: 200_000,
      otherIncome: 0,
      expenses: {
        housing: 150_000,
        food: 80_000,
        transportation: 40_000,
        utilities: 0,
        debtPayments: 0,
        entertainment: 0,
        otherExpenses: 0,
      },
    });

    expect(result.totalIncome).toBe(200_000);
    expect(result.totalExpenses).toBe(270_000);
    expect(result.remainingBalance).toBe(-70_000);
    expect(result.savingsRate).toBe(0);
  });

  it('[TC-BUDG-003] handles exact break-even budget with zero surplus', () => {
    const result = calculateBudget({
      salary: 300_000,
      otherIncome: 0,
      expenses: {
        housing: 150_000,
        food: 100_000,
        transportation: 50_000,
        utilities: 0,
        debtPayments: 0,
        entertainment: 0,
        otherExpenses: 0,
      },
    });

    expect(result.totalIncome).toBe(300_000);
    expect(result.totalExpenses).toBe(300_000);
    expect(result.remainingBalance).toBe(0);
    expect(result.savingsRate).toBe(0);
  });
});

describe('Module 9: Multi-Currency & Locale Engine', () => {
  it('[TC-CURR-001] formats default NGN currency with ₦ symbol and commas', () => {
    const formatted = formatCurrency(250000);
    expect(formatted).toContain('₦');
    expect(formatted).toContain('250,000.00');
  });

  it('[TC-CURR-002] formats USD currency with $ symbol', () => {
    expect(formatCurrency(1500, 'USD')).toBe('$1,500.00');
  });

  it('[TC-CURR-003] formats GBP currency with £ symbol', () => {
    expect(formatCurrency(1500, 'GBP')).toBe('£1,500.00');
  });

  it('[TC-CURR-004] formats EUR currency with € symbol', () => {
    expect(formatCurrency(1500, 'EUR')).toBe('€1,500.00');
  });

  it('[TC-CURR-005] formats compact numbers with K, M, and B abbreviations', () => {
    expect(formatCurrency(2500000, 'NGN', { compact: true })).toBe('₦2.5M');
    expect(formatCurrency(1800000000, 'USD', { compact: true })).toBe('$1.8B');
    expect(formatCurrency(15000, 'EUR', { compact: true })).toBe('€15.0K');
  });

  it('formats duration in readable years and months', () => {
    expect(formatDurationMonths(12)).toBe('1 year');
    expect(formatDurationMonths(26)).toBe('2 yrs 2 mos');
    expect(formatDurationMonths(5)).toBe('5 months');
  });
});
