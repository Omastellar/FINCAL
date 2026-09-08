import { AmortizationRow } from '../types/calculators';
import { CurrencyCode, CURRENCIES } from '../types/currency';

/**
 * Exports an amortization schedule as a downloadable CSV file.
 */
export function exportAmortizationCSV(
  schedule: AmortizationRow[],
  loanAmount: number,
  interestRate: number,
  currencyCode: CurrencyCode = 'NGN'
): void {
  const symbol = CURRENCIES[currencyCode]?.symbol || '₦';
  const headers = ['Period', `Payment (${symbol})`, `Principal (${symbol})`, `Interest (${symbol})`, `Remaining Balance (${symbol})`, `Total Interest Paid (${symbol})`];
  
  const rows = schedule.map((row) => [
    row.period,
    row.payment.toFixed(2),
    row.principalPaid.toFixed(2),
    row.interestPaid.toFixed(2),
    row.remainingBalance.toFixed(2),
    row.totalInterestPaid.toFixed(2),
  ]);

  const csvContent = [
    `Finance Calculator - Amortization Schedule`,
    `Loan Amount: ${symbol}${loanAmount.toLocaleString()}, Interest Rate: ${interestRate}%`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `amortization-schedule-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
