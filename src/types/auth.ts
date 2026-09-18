import { CalculatorId } from './calculators';
import { CurrencyCode } from './currency';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface SavedCalculation {
  id: string;
  userId: string;
  calculatorId: CalculatorId;
  title: string;
  inputs: Record<string, any>;
  summaryResult: string;
  currency: CurrencyCode;
  timestamp: string;
}

export interface SystemAuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: UserRole;
  timestamp: string;
  details: string;
  status: 'success' | 'warning' | 'info';
}

export interface PlatformSettings {
  defaultCurrency: CurrencyCode;
  allowGuestCalculations: boolean;
  maintenanceMode: boolean;
  maxSavedCalculationsPerUser: number;
  benchmarkInterestRate: number;
  defaultInflationRate: number;
}
