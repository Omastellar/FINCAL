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
  calculateCurrencyConversion,
  getCurrencyExchangeRate,
  sanitizeNumber,
  calculateMortgage,
  calculateHomeAffordability,
  calculateAutoLoan,
  calculatePersonalLoan,
  calculateSavingsGoal,
  calculateRetirement,
  calculateMultiDebtPayoff,
  calculateDTI,
  calculateNetWorth,
  calculateFinancialGoals,
  compareScenarios,
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

describe('Module 10: Currency Converter & FX Valuation Engine', () => {
  it('[TC-FX-001] converts USD to NGN at baseline exchange rate', () => {
    const result = calculateCurrencyConversion({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'NGN',
      transferFeePct: 0,
    });
    expect(result.fromAmount).toBe(1000);
    expect(result.exchangeRate).toBe(1540.0);
    expect(result.grossConvertedAmount).toBe(1_540_000);
    expect(result.netConvertedAmount).toBe(1_540_000);
    expect(result.feeAmount).toBe(0);
  });

  it('[TC-FX-002] calculates cross rates between EUR and GBP accurately', () => {
    const expectedRate = 0.79 / 0.92;
    const result = calculateCurrencyConversion({
      amount: 500,
      fromCurrency: 'EUR',
      toCurrency: 'GBP',
      transferFeePct: 0,
    });
    expect(result.exchangeRate).toBeCloseTo(expectedRate, 4);
    expect(result.grossConvertedAmount).toBeCloseTo(500 * expectedRate, 2);
  });

  it('[TC-FX-003] verifies inverse rate reciprocity holds', () => {
    const directRate = getCurrencyExchangeRate('USD', 'CAD');
    const inverseRate = getCurrencyExchangeRate('CAD', 'USD');
    expect(directRate * inverseRate).toBeCloseTo(1, 5);
  });

  it('[TC-FX-004] deducts bank transfer spread fee correctly', () => {
    const result = calculateCurrencyConversion({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'NGN',
      transferFeePct: 2.0,
    });
    expect(result.grossConvertedAmount).toBe(1_540_000);
    expect(result.feeAmount).toBe(30_800);
    expect(result.netConvertedAmount).toBe(1_509_200);
  });

  it('[TC-FX-005] supports custom spot rate overrides', () => {
    const result = calculateCurrencyConversion({
      amount: 100,
      fromCurrency: 'USD',
      toCurrency: 'NGN',
      transferFeePct: 0,
      customRate: 1600.0,
    });
    expect(result.exchangeRate).toBe(1600.0);
    expect(result.grossConvertedAmount).toBe(160_000);
  });

  it('[TC-FX-006] generates complete multi-currency valuation matrix', () => {
    const result = calculateCurrencyConversion({
      amount: 100,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      transferFeePct: 0,
    });
    expect(result.matrix.length).toBeGreaterThanOrEqual(10);
    const ngnRow = result.matrix.find((r) => r.code === 'NGN');
    expect(ngnRow).toBeDefined();
    expect(ngnRow?.amount).toBe(154_000);
  });
});

describe('Module 14: Mortgage & PITI Engine', () => {
  it('[TC-MTG-001] calculates monthly PITI payment with PMI and taxes', () => {
    const result = calculateMortgage({
      homePrice: 500_000,
      downPayment: 50_000, // 10% down -> PMI required
      downPaymentIsPercent: false,
      interestRate: 6.5,
      loanTermYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1200,
      hoaMonthly: 150,
      pmiRate: 0.8,
      closingCostsPct: 2.5,
      extraMonthlyPayment: 200,
    });

    expect(result.loanAmount).toBe(450_000);
    expect(result.downPaymentPercent).toBe(10);
    expect(result.principalAndInterest).toBeGreaterThan(2800);
    expect(result.monthlyPropertyTax).toBe(500);
    expect(result.monthlyHomeInsurance).toBe(100);
    expect(result.monthlyHOA).toBe(150);
    expect(result.monthlyPMI).toBeGreaterThan(0);
    expect(result.totalMonthlyPITI).toBeGreaterThan(3500);
    expect(result.upfrontClosingCosts).toBe(11_250);
    expect(result.totalCashNeededToClose).toBe(61_250);
    expect(result.interestSaved).toBeGreaterThan(50_000);
    expect(result.payoffMonthsSaved).toBeGreaterThan(30);
  });
});

describe('Module 15: Home Affordability Engine', () => {
  it('[TC-AFF-001] calculates purchase ceiling based on 28/36 DTI limits', () => {
    const result = calculateHomeAffordability({
      annualGrossIncome: 120_000,
      monthlyDebts: 600,
      downPaymentSaved: 60_000,
      interestRate: 6.5,
      loanTermYears: 30,
      propertyTaxRate: 1.2,
      homeInsuranceAnnual: 1200,
      targetFrontEndDti: 28,
      targetBackEndDti: 36,
    });

    expect(result.maxHomePurchasePrice).toBeGreaterThan(250_000);
    expect(result.maxLoanAmount).toBeGreaterThan(200_000);
    expect(result.conservativePrice).toBeLessThanOrEqual(result.moderatePrice);
    expect(result.moderatePrice).toBeLessThanOrEqual(result.aggressivePrice);
  });
});

describe('Module 16: Auto Loan & Trade-In Engine', () => {
  it('[TC-AUTO-001] calculates payment factoring in trade-in and fees', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 35_000,
      downPayment: 5_000,
      tradeInValue: 8_000,
      tradeInBalanceOwed: 2_000, // +6,000 net equity
      salesTaxPct: 7.0,
      dealerFees: 500,
      cashRebate: 1_000,
      interestRate: 5.5,
      loanTermMonths: 60,
    });

    expect(result.netTradeIn).toBe(6_000);
    expect(result.totalFinanced).toBeLessThan(30_000);
    expect(result.monthlyPayment).toBeGreaterThan(400);
    expect(result.amortizationSchedule.length).toBe(60);
  });
});

describe('Module 17: Personal Loan & APR Engine', () => {
  it('[TC-PERS-001] calculates effective APR factoring upfront origination fees', () => {
    const result = calculatePersonalLoan({
      loanAmount: 20_000,
      interestRate: 10.0,
      loanTermMonths: 36,
      originationFeePct: 3.0,
    });

    expect(result.originationFeeAmount).toBe(600);
    expect(result.netDisbursedAmount).toBe(19_400);
    expect(result.monthlyPayment).toBeGreaterThan(600);
    expect(result.effectiveAPR).toBeGreaterThan(10.0);
  });
});

describe('Module 18: Savings Goal & Target Engine', () => {
  it('[TC-GOAL-001] determines required monthly savings to reach future target', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50_000,
      currentSavings: 10_000,
      timeframeMonths: 24,
      annualReturnRate: 6.0,
    });

    expect(result.progressPercentage).toBe(20);
    expect(result.requiredMonthlyDeposit).toBeGreaterThan(1400);
    expect(result.requiredMonthlyDeposit).toBeLessThan(1700);
    expect(result.lumpSumNeededToday).toBeLessThan(50_000);
    expect(result.monthlySchedule.length).toBe(24);
  });
});

describe('Module 19: Retirement & Nest Egg Engine', () => {
  it('[TC-RET-001] projects nest egg and funding gap', () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentNestEgg: 25_000,
      monthlyContribution: 500,
      expectedAnnualReturnPre: 7.0,
      expectedAnnualReturnPost: 4.5,
      desiredMonthlyRetirementIncome: 4_000,
      inflationRate: 2.5,
      pensionOrSocialSecurityMonthly: 1_200,
    });

    expect(result.nestEggAtRetirement).toBeGreaterThan(500_000);
    expect(result.yearsInRetirement).toBe(20);
    expect(result.timeline.length).toBe(56);
  });
});

describe('Module 20: Multi-Debt Payoff Engine', () => {
  it('[TC-DEBT-001] compares Avalanche vs Snowball vs Minimum', () => {
    const debts = [
      { id: '1', name: 'Credit Card', balance: 5_000, interestRate: 22.0, minimumPayment: 150 },
      { id: '2', name: 'Car Loan', balance: 12_000, interestRate: 6.5, minimumPayment: 250 },
      { id: '3', name: 'Personal Loan', balance: 8_000, interestRate: 14.0, minimumPayment: 200 },
    ];

    const result = calculateMultiDebtPayoff({
      debts,
      extraMonthlyPayment: 300,
    });

    expect(result.avalanche.totalInterestPaid).toBeLessThanOrEqual(result.snowball.totalInterestPaid);
    expect(result.snowball.totalInterestPaid).toBeLessThan(result.minimumOnly.totalInterestPaid);
    expect(result.avalanche.totalMonths).toBeLessThan(result.minimumOnly.totalMonths);
    expect(result.interestSavedAvalancheVsMinimum).toBeGreaterThan(0);
  });
});

describe('Module 21: Debt-to-Income Diagnostic Engine', () => {
  it('[TC-DTI-001] evaluates front-end and back-end ratios and assigns health status', () => {
    const result = calculateDTI({
      grossMonthlyIncome: 8_000,
      monthlyMortgageOrRent: 2_000,
      propertyTaxMonthly: 200,
      homeInsuranceMonthly: 80,
      autoLoanMonthly: 400,
      studentLoanMonthly: 250,
      creditCardMinMonthly: 120,
      otherDebtMonthly: 0,
    });

    expect(result.frontEndDTI).toBeCloseTo(28.5, 1);
    expect(result.backEndDTI).toBeCloseTo(38.1, 1);
    expect(result.status).toBe('moderate');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});

describe('Module 22: Net Worth & Allocation Engine', () => {
  it('[TC-NW-001] calculates total net worth and asset allocation breakdown', () => {
    const result = calculateNetWorth({
      assets: {
        cashAndSavings: 25_000,
        realEstate: 400_000,
        retirementAccounts: 120_000,
        taxableInvestments: 45_000,
        vehiclesAndValuables: 30_000,
        businessEquity: 0,
      },
      liabilities: {
        mortgages: 280_000,
        autoLoans: 15_000,
        studentLoans: 20_000,
        creditCards: 3_000,
        personalLoans: 0,
        otherLiabilities: 0,
      },
    });

    expect(result.totalAssets).toBe(620_000);
    expect(result.totalLiabilities).toBe(318_000);
    expect(result.netWorth).toBe(302_000);
    expect(result.debtToAssetRatio).toBeCloseTo(51.29, 1);
    expect(result.liquidAssets).toBe(25_000);
    expect(result.assetDistribution.length).toBe(5);
  });
});

describe('Module 23: Financial Goals & Scenario Comparison', () => {
  it('[TC-GOALS-001] prioritizes goals and calculates surplus or shortfall against monthly budget', () => {
    const result = calculateFinancialGoals({
      monthlySavingsBudget: 1_200,
      goals: [
        { id: '1', title: 'Emergency Fund', category: 'Emergency', targetAmount: 15_000, currentAmount: 6_000, targetDate: '2027-12', priority: 'high' },
        { id: '2', title: 'Vacation', category: 'Travel', targetAmount: 4_000, currentAmount: 1_000, targetDate: '2027-06', priority: 'low' },
      ],
    });

    expect(result.totalTargetAmount).toBe(19_000);
    expect(result.totalCurrentAmount).toBe(7_000);
    expect(result.goals.length).toBe(2);
    expect(result.overallProgressPct).toBeCloseTo(36.8, 1);
  });

  it('[TC-SCEN-001] compares side-by-side financial options', () => {
    const result = compareScenarios({
      comparisonTitle: '15-Year vs 30-Year Mortgage',
      horizonYears: 15,
      scenarios: [
        { id: '15yr', name: '15-Year Fixed', category: 'Mortgage Term', upfrontCost: 10_000, monthlyOngoingCost: 2_600, termYears: 15, projectedEndingNetValue: 400_000, totalCostOverTerm: 478_000 },
        { id: '30yr', name: '30-Year Fixed', category: 'Mortgage Term', upfrontCost: 10_000, monthlyOngoingCost: 1_850, termYears: 15, projectedEndingNetValue: 250_000, totalCostOverTerm: 343_000 },
      ],
    });

    expect(result.lowestCostScenarioId).toBe('30yr');
    expect(result.highestEndingValueScenarioId).toBe('15yr');
    expect(result.deltaSummary.length).toBe(3);
  });
});


