import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, CurrencyConfig, CURRENCIES } from '../types/currency';
import { formatCurrency, FormatCurrencyOptions } from '../utils/formatters';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  format: (amount: number, options?: { decimals?: number; compact?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'finance_calc_currency';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) return saved;
    } catch {
      // ignore
    }
    return 'NGN'; // Default to Nigerian Naira as requested
  });

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // ignore
      }
    }
  };

  const currencyConfig = CURRENCIES[currency];

  const format = (amount: number, options?: { decimals?: number; compact?: boolean }) => {
    return formatCurrency(amount, currency, options);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencyConfig, format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
