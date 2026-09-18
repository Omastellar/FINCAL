import { CalculatorId } from './calculators';

export type PageView = 'home' | 'calculators' | 'about' | 'login' | 'admin' | 'admin-login' | 'saved' | 'user';

export interface NavigationState {
  currentPage: PageView;
  activeCalculatorId?: CalculatorId | null;
}
