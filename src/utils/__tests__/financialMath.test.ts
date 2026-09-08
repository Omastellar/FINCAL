import { describe, it, expect } from 'vitest';
import {
  calculateLoanPayment,
  calculateSavingsGrowth,
  calculateCompoundInterest,
  calculateInvestment,
  calculateDebtPayoff,
  calculateBudget,
  sanitizeNumber,
} from '../financialMath';
import { formatCurrency, formatDurationMonths } from '../formatters';

describe('Sanitize Number Utility', () => {
  it('handles standard numbers, strings, and fallbacks', () => {
    expect(sanitizeNumber(100)).toBe(100);
    expect(sanitizeNumber('250.5')).toBe(250.5);
    expect(sanitizeNumber('', 10)).toBe(10);
    expect(sanitizeNumber(null, 5)).toBe(5);
    expect(sanitizeNumber(-20, 0, 0)).toBe(0);
    expect(sanitizeNumber('invalid', 42)).toBe(42);
  });
});

describe('1. Loan Calculator', () => {
  it('calculates standard loan payments correctly', () => {
    // ₦1,000,000 at 12% for 1 year monthly
    const result = calculateLoanPayment(1_000_000, 12, 1, 'monthly');
    // Standard PMT = 1,000,000 * (0.01 * 1.01^12) / (1.01^12 - 1) ≈ 88,848.79
    expect(result.periodicPayment).toBeGreaterThan(88840);
    expect(result.periodicPayment).toBeLessThan(88860);
    expect(result.totalRepayment).toBeGreaterThan(1_000_000);
    expect(result.totalInterest).toBeGreaterThan(60000);
    expect(result.amortizationSchedule.length).toBe(12);
    // Ending balance should be 0
    expect(result.amortizationSchedule[11].remainingBalance).toBe(0);
  });

  it('handles 0% interest correctly without division by zero', () => {
    const result = calculateLoanPayment(120_000, 0, 1, 'monthly');
    expect(result.periodicPayment).toBe(10_000);
    expect(result.totalRepayment).toBe(120_000);
    expect(result.totalInterest).toBe(0);
    expect(result.amortizationSchedule.length).toBe(12);
    expect(result.amortizationSchedule[11].remainingBalance).toBe(0);
  });

  it('handles bi-weekly and weekly frequencies', () => {
    const biWeekly = calculateLoanPayment(500_000, 10, 1, 'bi-weekly');
    expect(biWeekly.amortizationSchedule.length).toBe(26);

    const weekly = calculateLoanPayment(500_000, 10, 1, 'weekly');
    expect(weekly.amortizationSchedule.length).toBe(52);
  });

  it('handles zero principal gracefully', () => {
    const result = calculateLoanPayment(0, 10, 1, 'monthly');
    expect(result.periodicPayment).toBe(0);
    expect(result.totalRepayment).toBe(0);
    expect(result.amortizationSchedule.length).toBe(0);
  });
});

describe('2. Savings Calculator', () => {
  it('calculates savings growth with initial and monthly deposits', () => {
    const result = calculateSavingsGrowth(100_000, 10_000, 10, 2, 'monthly');
    // Total contributions = 100k + (10k * 24) = 340,000
    expect(result.totalContributions).toBe(340_000);
    expect(result.finalBalance).toBeGreaterThan(340_000);
    expect(result.interestEarned).toBe(result.finalBalance - result.totalContributions);
    expect(result.growthTimeline.length).toBe(3); // Year 0, 1, 2
  });

  it('handles 0% interest correctly', () => {
    const result = calculateSavingsGrowth(50_000, 5_000, 0, 1, 'monthly');
    expect(result.totalContributions).toBe(110_000);
    expect(result.finalBalance).toBe(110_000);
    expect(result.interestEarned).toBe(0);
  });
});

describe('3. Compound Interest Calculator', () => {
  it('calculates compound interest correctly with monthly contributions', () => {
    const result = calculateCompoundInterest(100_000, 8, 5_000, 'monthly', 3, 'monthly');
    expect(result.principal).toBe(100_000);
    expect(result.totalContributions).toBe(180_000); // 5,000 * 36
    expect(result.futureValue).toBeGreaterThan(280_000);
    expect(result.interestEarned).toBeGreaterThan(20_000);
  });

  it('handles 0% interest correctly', () => {
    const result = calculateCompoundInterest(200_000, 0, 10_000, 'monthly', 2, 'annually');
    expect(result.principal).toBe(200_000);
    expect(result.totalContributions).toBe(240_000);
    expect(result.futureValue).toBe(440_000);
    expect(result.interestEarned).toBe(0);
  });
});

describe('4. Investment Calculator', () => {
  it('calculates investment returns and projects timeline', () => {
    const result = calculateInvestment(500_000, 20_000, 12, 5);
    const expectedInvested = 500_000 + 20_000 * 60; // 1,700,000
    expect(result.totalInvested).toBe(expectedInvested);
    expect(result.futureInvestmentValue).toBeGreaterThan(expectedInvested);
    expect(result.estimatedGrowth).toBe(result.futureInvestmentValue - expectedInvested);
  });

  it('handles 0% return gracefully', () => {
    const result = calculateInvestment(100_000, 10_000, 0, 1);
    expect(result.totalInvested).toBe(220_000);
    expect(result.futureInvestmentValue).toBe(220_000);
    expect(result.estimatedGrowth).toBe(0);
  });
});

describe('5. Debt Payoff Calculator', () => {
  it('calculates payoff time and interest savings with accelerated payments', () => {
    // Debt: ₦1,000,000 at 18%, paying ₦50,000/mo, extra ₦20,000/mo
    const result = calculateDebtPayoff(1_000_000, 18, 50_000, 20_000);
    expect(result.isValidPayment).toBe(true);
    expect(result.acceleratedPayoffMonths).toBeLessThan(result.standardPayoffMonths);
    expect(result.acceleratedTotalInterest).toBeLessThan(result.standardTotalInterest);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  it('detects when monthly payment is less than monthly interest', () => {
    // ₦1,000,000 at 24% annual interest has monthly interest of ₦20,000.
    // A payment of ₦10,000 will never pay off the debt.
    const result = calculateDebtPayoff(1_000_000, 24, 10_000, 0);
    expect(result.isValidPayment).toBe(false);
    expect(result.minMonthlyInterest).toBeGreaterThanOrEqual(20_000);
  });
});

describe('6. Budget Calculator', () => {
  it('calculates total income, expenses, remaining balance and savings rate', () => {
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
  });

  it('handles negative surplus (deficit) cleanly', () => {
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
});

describe('Formatters & Currencies', () => {
  it('formats NGN by default with ₦ symbol and commas', () => {
    expect(formatCurrency(250000)).toContain('₦');
    expect(formatCurrency(250000)).toContain('250,000.00');
  });

  it('formats USD, GBP, and EUR correctly', () => {
    expect(formatCurrency(1500, 'USD')).toContain('$');
    expect(formatCurrency(1500, 'GBP')).toContain('£');
    expect(formatCurrency(1500, 'EUR')).toContain('€');
  });

  it('formats compact numbers', () => {
    expect(formatCurrency(2500000, 'NGN', { compact: true })).toBe('₦2.5M');
    expect(formatCurrency(1800000000, 'USD', { compact: true })).toBe('$1.8B');
  });

  it('formats duration months', () => {
    expect(formatDurationMonths(12)).toBe('1 year');
    expect(formatDurationMonths(26)).toBe('2 yrs 2 mos');
    expect(formatDurationMonths(5)).toBe('5 months');
  });
});
