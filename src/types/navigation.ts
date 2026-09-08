import { CalculatorId } from './calculators';

export type PageView = 'home' | 'calculators' | 'about';

export interface NavigationState {
  currentPage: PageView;
  activeCalculatorId?: CalculatorId;
}
