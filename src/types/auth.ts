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

export type VisitorType = 'registered' | 'unregistered';

export interface VisitorSession {
  id: string;
  type: VisitorType;
  userId?: string;
  userName?: string;
  userEmail?: string;
  device: string;
  browser: string;
  location: string;
  startedAt: string;
  lastActive: string;
  pagesViewed: number;
  calculationsRun: number;
  lastToolUsed: string;
  status: 'online' | 'active' | 'idle';
}

export interface AppTelemetrySummary {
  totalVisitors: number;
  registeredCount: number;
  unregisteredCount: number;
  activeNowCount: number;
  totalCalculationsRun: number;
  registeredCalculationsRun: number;
  unregisteredCalculationsRun: number;
  calculatorPopularity: Record<string, { registered: number; unregistered: number; total: number }>;
  recentSessions: VisitorSession[];
}

export interface JoinedMemberRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  joinedAt: string;
  lastActive: string;
  status: 'Active' | 'Verified' | 'Pending';
  device?: string;
  calculationsRun?: number;
}

export interface MemberGrowthSummary {
  totalJoined: number;
  joinedToday: number;
  joinedThisWeek: number;
  joinedThisMonth: number;
  standardMembersCount: number;
  adminMembersCount: number;
  monthlyBreakdown: Record<string, number>;
  members: JoinedMemberRecord[];
}


