import { CalculatorId } from './calculators';

export type PageView = 'home' | 'calculators' | 'about' | 'login' | 'admin' | 'admin-login' | 'saved' | 'user' | 'dashboard' | 'scenarios' | 'goals';

export interface NavigationState {
  currentPage: PageView;
  activeCalculatorId?: CalculatorId | null;
}
