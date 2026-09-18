export type CurrencyCode =
  | 'NGN'
  | 'USD'
  | 'GBP'
  | 'EUR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'GHS'
  | 'KES'
  | 'ZAR'
  | 'CNY'
  | 'INR'
  | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  flag?: string;
  rateToUSD: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira (NGN)',
    locale: 'en-NG',
    flag: '🇳🇬',
    rateToUSD: 1540.0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    locale: 'en-US',
    flag: '🇺🇸',
    rateToUSD: 1.0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    locale: 'en-GB',
    flag: '🇬🇧',
    rateToUSD: 0.79,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    locale: 'de-DE',
    flag: '🇪🇺',
    rateToUSD: 0.92,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CAD)',
    locale: 'en-CA',
    flag: '🇨🇦',
    rateToUSD: 1.36,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (AUD)',
    locale: 'en-AU',
    flag: '🇦🇺',
    rateToUSD: 1.52,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen (JPY)',
    locale: 'ja-JP',
    flag: '🇯🇵',
    rateToUSD: 155.5,
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi (GHS)',
    locale: 'en-GH',
    flag: '🇬🇭',
    rateToUSD: 15.8,
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling (KES)',
    locale: 'en-KE',
    flag: '🇰🇪',
    rateToUSD: 129.5,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand (ZAR)',
    locale: 'en-ZA',
    flag: '🇿🇦',
    rateToUSD: 18.25,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan (CNY)',
    locale: 'zh-CN',
    flag: '🇨🇳',
    rateToUSD: 7.24,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (INR)',
    locale: 'en-IN',
    flag: '🇮🇳',
    rateToUSD: 83.5,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham (AED)',
    locale: 'ar-AE',
    flag: '🇦🇪',
    rateToUSD: 3.67,
  },
};
