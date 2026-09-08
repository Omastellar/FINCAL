import { CurrencyCode, CURRENCIES } from '../types/currency';

export interface FormatCurrencyOptions {
  currency?: CurrencyCode;
  decimals?: number;
  compact?: boolean;
}

/**
 * Formats a numeric amount according to the given currency code (defaults to NGN).
 * Handles negative numbers, 0, large figures, and decimals cleanly.
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'NGN',
  options: { decimals?: number; compact?: boolean } = {}
): string {
  const { decimals = 2, compact = false } = options;
  const config = CURRENCIES[currencyCode] || CURRENCIES.NGN;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact && absAmount >= 1_000_000_000) {
    return `${isNegative ? '-' : ''}${config.symbol}${(absAmount / 1_000_000_000).toFixed(1)}B`;
  }
  if (compact && absAmount >= 1_000_000) {
    return `${isNegative ? '-' : ''}${config.symbol}${(absAmount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && absAmount >= 1_000) {
    return `${isNegative ? '-' : ''}${config.symbol}${(absAmount / 1_000).toFixed(1)}K`;
  }

  const formattedNum = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${isNegative ? '-' : ''}${config.symbol}${formattedNum}`;
}

/**
 * Format currency without symbol (e.g. for input fields or raw tables)
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a percentage value (e.g. 7.5% or 12.0%)
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Human-readable format for months (e.g., 2 years 4 months)
 */
export function formatDurationMonths(totalMonths: number): string {
  if (totalMonths <= 0) return '0 months';
  const years = Math.floor(totalMonths / 12);
  const months = Math.round(totalMonths % 12);

  if (years === 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  if (months === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  return `${years} yr${years === 1 ? '' : 's'} ${months} mo${months === 1 ? '' : 's'}`;
}
