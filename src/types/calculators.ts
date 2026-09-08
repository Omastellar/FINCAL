export type PaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly';

export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

export interface AmortizationRow {
  period: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  totalInterestPaid: number;
}

export interface AmortizationYearSummary {
  year: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface GrowthPoint {
  year: number;
  principalInvested: number;
  totalInterest: number;
  totalBalance: number;
  realPurchasingPower?: number;
}

export interface LoanPrepaymentInputs {
  extraPayment: number;
  lumpSumAmount: number;
  lumpSumYear: number;
}

export interface LoanPrepaymentResults {
  acceleratedTotalRepayment: number;
  acceleratedTotalInterest: number;
  acceleratedPeriods: number;
  interestSaved: number;
  periodsSaved: number;
  yearsSaved: number;
  amortizationSchedule: AmortizationRow[];
  annualSchedule: AmortizationYearSummary[];
}

// 1. Loan Calculator
export interface LoanInputs {
  loanAmount: number;
  interestRate: number; // annual percentage, e.g. 7.5
  loanTermYears: number;
  paymentFrequency: PaymentFrequency;
}

export interface LoanResults {
  periodicPayment: number;
  totalRepayment: number;
  totalInterest: number;
  monthlyEquivalentPayment: number;
  principalRatio: number; // 0 to 100
  interestRatio: number; // 0 to 100
  amortizationSchedule: AmortizationRow[];
  annualSchedule: AmortizationYearSummary[];
}

// 2. Savings Calculator
export interface SavingsInputs {
  initialDeposit: number;
  monthlyContribution: number;
  interestRate: number; // annual percentage
  savingsPeriodYears: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually';
}

export interface SavingsResults {
  totalContributions: number;
  interestEarned: number;
  finalBalance: number;
  growthTimeline: GrowthPoint[];
}

// 3. Compound Interest Calculator
export interface CompoundInterestInputs {
  principal: number;
  interestRate: number;
  additionalContribution: number;
  contributionFrequency: 'monthly' | 'annually';
  investmentPeriodYears: number;
  compoundingFrequency: CompoundingFrequency;
}

export interface CompoundInterestResults {
  futureValue: number;
  totalContributions: number;
  interestEarned: number;
  principal: number;
  growthTimeline: GrowthPoint[];
}

// 4. Investment Calculator
export interface InvestmentInputs {
  initialInvestment: number;
  monthlyContribution: number;
  expectedAnnualReturn: number;
  investmentDurationYears: number;
}

export interface InvestmentResults {
  totalInvested: number;
  estimatedGrowth: number;
  futureInvestmentValue: number;
  growthTimeline: GrowthPoint[];
}

// 5. Debt Payoff Calculator
export interface DebtPayoffInputs {
  currentDebt: number;
  interestRate: number;
  monthlyPayment: number;
  additionalMonthlyPayment: number;
}

export interface DebtTimelinePoint {
  month: number;
  standardBalance: number;
  acceleratedBalance: number;
}

export interface DebtPayoffResults {
  standardPayoffMonths: number;
  acceleratedPayoffMonths: number;
  standardTotalInterest: number;
  acceleratedTotalInterest: number;
  standardTotalRepayment: number;
  acceleratedTotalRepayment: number;
  interestSaved: number;
  monthsSaved: number;
  timeline: DebtTimelinePoint[];
  isValidPayment: boolean;
  minMonthlyInterest: number;
}

// 6. Budget Calculator
export interface BudgetExpenses {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  debtPayments: number;
  entertainment: number;
  otherExpenses: number;
}

export interface BudgetInputs {
  salary: number;
  otherIncome: number;
  expenses: BudgetExpenses;
}

export interface ExpenseCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface BudgetResults {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  savingsRate: number; // percentage
  expenseBreakdown: ExpenseCategoryBreakdown[];
  rule50_30_20: {
    needs: { actual: number; target: number; percentage: number };
    wants: { actual: number; target: number; percentage: number };
    savings: { actual: number; target: number; percentage: number };
  };
}

export type CalculatorId = 
  | 'loan'
  | 'savings'
  | 'compound-interest'
  | 'investment'
  | 'debt-payoff'
  | 'budget';

export interface CalculatorMeta {
  id: CalculatorId;
  title: string;
  shortDescription: string;
  category: 'Borrowing' | 'Growing' | 'Planning';
  badge?: string;
}
