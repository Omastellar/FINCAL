import { CalculatorMeta, CalculatorId } from '../types/calculators';

export const CALCULATORS_LIST: CalculatorMeta[] = [
  {
    id: 'loan',
    title: 'Loan Calculator',
    shortDescription: 'Calculate periodic payments, total interest, and explore detailed amortization schedules.',
    category: 'Borrowing',
    badge: 'Popular',
  },
  {
    id: 'savings',
    title: 'Savings Calculator',
    shortDescription: 'Project your savings balance over time with regular contributions and compound interest.',
    category: 'Growing',
    badge: 'Essential',
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest Calculator',
    shortDescription: 'Harness the power of compounding to simulate wealth accumulation across various frequencies.',
    category: 'Growing',
    badge: 'High Impact',
  },
  {
    id: 'investment',
    title: 'Investment Calculator',
    shortDescription: 'Estimate potential portfolio growth based on initial capital, monthly additions, and expected returns.',
    category: 'Growing',
    badge: 'Projections',
  },
  {
    id: 'debt-payoff',
    title: 'Debt Payoff Calculator',
    shortDescription: 'Discover how extra monthly payments reduce debt faster and save massive amounts on interest.',
    category: 'Borrowing',
    badge: 'Strategy',
  },
  {
    id: 'budget',
    title: 'Budget Calculator',
    shortDescription: 'Organize income and expenses, calculate your savings rate, and benchmark against the 50/30/20 rule.',
    category: 'Planning',
    badge: 'Daily Finance',
  },
  {
    id: 'currency-converter',
    title: 'Currency Converter',
    shortDescription: 'Convert between global and African currencies with spot cross-rates, transfer spread fees, and multi-currency comparison matrix.',
    category: 'Planning',
    badge: 'Real-Time FX',
  },
];
