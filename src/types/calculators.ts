export type PaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly';

export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

export interface AmortizationRow {
  period: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  totalInterestPaid: number;
  dateStr?: string;
  extraPaymentPaid?: number;
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

export interface CalculationFormulaStep {
  name: string;
  formula: string;
  substituted: string;
  result: string;
  explanation: string;
}

export interface ExplainableResultData {
  title: string;
  summary: string;
  keyFigures: Array<{ label: string; value: string; hint?: string; highlight?: boolean }>;
  assumptions: Array<{ label: string; value: string; notes?: string }>;
  methodology: string;
  formulaSteps: CalculationFormulaStep[];
  disclaimers: string[];
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
  healthcare?: number;
  insurance?: number;
  diningOut?: number;
  clothing?: number;
  travel?: number;
  personalCare?: number;
  savingsContributions?: number;
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

// 7. Currency Conversion Calculator
export interface CurrencyConversionInputs {
  amount: number;
  fromCurrency: import('./currency').CurrencyCode;
  toCurrency: import('./currency').CurrencyCode;
  transferFeePct: number;
  customRate?: number;
}

export interface CurrencyMatrixItem {
  code: import('./currency').CurrencyCode;
  name: string;
  symbol: string;
  flag?: string;
  rate: number;
  amount: number;
}

export interface CurrencyConversionResults {
  fromAmount: number;
  fromCurrency: import('./currency').CurrencyCode;
  toCurrency: import('./currency').CurrencyCode;
  exchangeRate: number;
  inverseRate: number;
  grossConvertedAmount: number;
  feeAmount: number;
  netConvertedAmount: number;
  feePct: number;
  matrix: CurrencyMatrixItem[];
}

// 8. Mortgage Calculator
export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  downPaymentIsPercent: boolean;
  interestRate: number;
  loanTermYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaMonthly: number;
  pmiRate: number; // annual percentage if LTV > 80%
  closingCostsPct: number;
  extraMonthlyPayment: number;
}

export interface MortgageResults {
  principalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  totalMonthlyPITI: number;
  loanAmount: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  upfrontClosingCosts: number;
  totalCashNeededToClose: number;
  totalInterestStandard: number;
  totalRepaymentStandard: number;
  totalInterestWithExtra: number;
  interestSaved: number;
  payoffMonthsSaved: number;
  pmiDropMonth: number;
  amortizationSchedule: AmortizationRow[];
}

// 9. Home Affordability Calculator
export interface HomeAffordabilityInputs {
  annualGrossIncome: number;
  monthlyDebts: number;
  downPaymentSaved: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  homeInsuranceAnnual: number;
  targetFrontEndDti: number; // typically 28%
  targetBackEndDti: number; // typically 36%
}

export interface HomeAffordabilityResults {
  maxHomePurchasePrice: number;
  maxLoanAmount: number;
  maxMonthlyPayment: number;
  limitingFactor: 'front-end' | 'back-end' | 'down-payment';
  conservativePrice: number;
  moderatePrice: number;
  aggressivePrice: number;
  breakdown: {
    principalAndInterest: number;
    taxes: number;
    insurance: number;
    totalHousingPayment: number;
  };
}

// 10. Auto Loan Calculator
export interface AutoLoanInputs {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  tradeInBalanceOwed: number;
  salesTaxPct: number;
  dealerFees: number;
  cashRebate: number;
  interestRate: number;
  loanTermMonths: number;
}

export interface AutoLoanResults {
  monthlyPayment: number;
  totalFinanced: number;
  netTradeIn: number;
  salesTaxAmount: number;
  totalInterest: number;
  totalCostOfVehicle: number;
  amortizationSchedule: AmortizationRow[];
}

// 11. Personal Loan Calculator
export interface PersonalLoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTermMonths: number;
  originationFeePct: number;
}

export interface PersonalLoanResults {
  monthlyPayment: number;
  originationFeeAmount: number;
  netDisbursedAmount: number;
  effectiveAPR: number;
  totalInterest: number;
  totalRepayment: number;
  amortizationSchedule: AmortizationRow[];
}

// 12. Savings Goal Calculator
export interface SavingsGoalInputs {
  targetAmount: number;
  currentSavings: number;
  timeframeMonths: number;
  annualReturnRate: number;
}

export interface SavingsGoalResults {
  requiredMonthlyDeposit: number;
  totalDeposited: number;
  interestEarned: number;
  lumpSumNeededToday: number;
  progressPercentage: number;
  monthlySchedule: Array<{
    month: number;
    deposit: number;
    interest: number;
    balance: number;
  }>;
}

// 13. Retirement Calculator
export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentNestEgg: number;
  monthlyContribution: number;
  expectedAnnualReturnPre: number;
  expectedAnnualReturnPost: number;
  desiredMonthlyRetirementIncome: number;
  inflationRate: number;
  pensionOrSocialSecurityMonthly: number;
}

export interface RetirementResults {
  nestEggAtRetirement: number;
  totalRequiredNestEgg: number;
  monthlyFundingGap: number;
  totalFundingSurplusOrDeficit: number;
  isOnTrack: boolean;
  requiredMonthlySavings: number;
  yearsInRetirement: number;
  timeline: Array<{
    age: number;
    year: number;
    balance: number;
    contributions: number;
    drawdowns: number;
  }>;
}

// 14. Multi-Debt Payoff Planner
export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface MultiDebtPayoffInputs {
  debts: DebtItem[];
  extraMonthlyPayment: number;
}

export interface DebtPayoffPlanSummary {
  strategy: 'snowball' | 'avalanche' | 'minimum-only';
  totalMonths: number;
  debtFreeDateStr: string;
  totalInterestPaid: number;
  totalPaid: number;
  payoffOrder: string[];
}

export interface MultiDebtPayoffResults {
  avalanche: DebtPayoffPlanSummary;
  snowball: DebtPayoffPlanSummary;
  minimumOnly: DebtPayoffPlanSummary;
  interestSavedAvalancheVsMinimum: number;
  monthsSavedAvalancheVsMinimum: number;
  interestSavedSnowballVsMinimum: number;
  monthsSavedSnowballVsMinimum: number;
  scheduleByMonth: Array<{
    month: number;
    remainingTotalBalance: number;
    paymentsByDebt: Record<string, number>;
  }>;
}

// 15. Debt-to-Income (DTI) Diagnostic
export interface DTIInputs {
  grossMonthlyIncome: number;
  monthlyMortgageOrRent: number;
  propertyTaxMonthly?: number;
  homeInsuranceMonthly?: number;
  autoLoanMonthly: number;
  studentLoanMonthly: number;
  creditCardMinMonthly: number;
  otherDebtMonthly: number;
}

export interface DTIResults {
  frontEndDTI: number;
  backEndDTI: number;
  totalHousingExpenses: number;
  totalNonHousingDebt: number;
  totalMonthlyDebt: number;
  maximumRecommendedTotalDebt: number;
  status: 'healthy' | 'moderate' | 'high';
  recommendations: string[];
}

// 16. Net Worth Calculator
export interface AssetBreakdown {
  cashAndSavings: number;
  realEstate: number;
  retirementAccounts: number;
  taxableInvestments: number;
  vehiclesAndValuables: number;
  businessEquity: number;
}

export interface LiabilityBreakdown {
  mortgages: number;
  autoLoans: number;
  studentLoans: number;
  creditCards: number;
  personalLoans: number;
  otherLiabilities: number;
}

export interface NetWorthInputs {
  assets: AssetBreakdown;
  liabilities: LiabilityBreakdown;
}

export interface NetWorthResults {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtToAssetRatio: number;
  liquidAssets: number;
  liquidRatio: number;
  assetDistribution: Array<{ category: string; amount: number; percentage: number; color: string }>;
  liabilityDistribution: Array<{ category: string; amount: number; percentage: number; color: string }>;
}

// 17. Financial Goals Planner
export interface FinancialGoalItem {
  id: string;
  title: string;
  category: 'Emergency' | 'Home' | 'Education' | 'Travel' | 'Retirement' | 'Business' | 'Other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM
  priority: 'low' | 'medium' | 'high';
}

export interface FinancialGoalInputs {
  goals: FinancialGoalItem[];
  monthlySavingsBudget: number;
}

export interface FinancialGoalResultItem {
  goal: FinancialGoalItem;
  monthsRemaining: number;
  requiredMonthlySavings: number;
  shortfallOrSurplus: number;
  isAchievableWithBudget: boolean;
  projectedCompletionDate: string;
  allocatedMonthlySavings: number;
}

export interface FinancialGoalsResults {
  goals: FinancialGoalResultItem[];
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRequiredMonthly: number;
  overallProgressPct: number;
  budgetSurplusDeficit: number;
}

// 18. Scenario Comparison Tool
export interface ScenarioOption {
  id: string;
  name: string;
  category: 'Mortgage Term' | 'Debt Strategy' | 'Buy vs Rent' | 'Investment Allocation' | 'Custom';
  upfrontCost: number;
  monthlyOngoingCost: number;
  annualGrowthRate?: number;
  termYears: number;
  projectedEndingNetValue: number;
  totalCostOverTerm: number;
  notes?: string;
}

export interface ScenarioComparisonInputs {
  comparisonTitle: string;
  horizonYears: number;
  scenarios: ScenarioOption[];
}

export interface ScenarioComparisonResults {
  scenarios: ScenarioOption[];
  lowestCostScenarioId: string;
  highestEndingValueScenarioId: string;
  deltaSummary: Array<{
    metric: string;
    scenarioValues: Record<string, number>;
    difference: number;
  }>;
}

export type CalculatorSuite = 'Loans' | 'Savings & Investments' | 'Budget & Debt' | 'Planning & Decisions';

export type CalculatorId = 
  | 'loan'
  | 'mortgage'
  | 'home-affordability'
  | 'auto-loan'
  | 'personal-loan'
  | 'savings'
  | 'savings-goal'
  | 'compound-interest'
  | 'investment'
  | 'retirement'
  | 'budget'
  | 'debt-payoff'
  | 'multi-debt-payoff'
  | 'dti'
  | 'net-worth'
  | 'financial-goals'
  | 'scenarios'
  | 'currency-converter';

export interface CalculatorMeta {
  id: CalculatorId;
  title: string;
  shortDescription: string;
  category: CalculatorSuite | 'Borrowing' | 'Growing' | 'Planning';
  suite: CalculatorSuite;
  badge?: string;
  icon?: string;
}
