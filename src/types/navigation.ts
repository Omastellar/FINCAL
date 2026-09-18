import { CalculatorId } from './calculators';

export type PageView = 'home' | 'calculators' | 'about' | 'login' | 'admin' | 'saved';

export interface NavigationState {
  currentPage: PageView;
  activeCalculatorId?: CalculatorId | null;
}
