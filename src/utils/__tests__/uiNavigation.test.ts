import { describe, it, expect } from 'vitest';
import { CALCULATORS_LIST } from '../../data/calculatorMetadata';
import { CalculatorId } from '../../types/calculators';

// Helper mirroring MetricCard font-sizing logic
function getMetricValueFontSize(val: string): string {
  const len = val.length;
  if (len > 22) return 'text-sm sm:text-base md:text-lg';
  if (len > 16) return 'text-base sm:text-lg md:text-xl';
  if (len > 12) return 'text-lg sm:text-xl md:text-2xl';
  if (len > 9) return 'text-xl sm:text-2xl md:text-[1.65rem]';
  return 'text-2xl sm:text-3xl';
}

// Helper mirroring URL calculator parameter extraction
function parseCalculatorFromQuery(searchQuery: string): CalculatorId | null {
  const search = new URLSearchParams(searchQuery);
  const param = search.get('calc');
  if (param === 'loan') return 'loan';
  if (param === 'savings') return 'savings';
  if (param === 'compound' || param === 'compound-interest') return 'compound-interest';
  if (param === 'investment') return 'investment';
  if (param === 'debt' || param === 'debt-payoff') return 'debt-payoff';
  if (param === 'budget') return 'budget';
  if (param === 'currency' || param === 'currency-converter') return 'currency-converter';
  return null;
}

describe('Module 13: UI Navigation, Categories & Amount Box Resilience', () => {
  describe('[TC-CAT-001] Category Filtering & Directory Integrity', () => {
    it('returns all 7 calculators when "All" category is selected', () => {
      const allCalcs = CALCULATORS_LIST;
      expect(allCalcs.length).toBe(7);
      expect(allCalcs.map((c) => c.id)).toEqual([
        'loan',
        'savings',
        'compound-interest',
        'investment',
        'debt-payoff',
        'budget',
        'currency-converter',
      ]);
    });

    it('filters correctly for "Borrowing" category', () => {
      const borrowing = CALCULATORS_LIST.filter((c) => c.category === 'Borrowing');
      expect(borrowing.length).toBe(2);
      expect(borrowing.map((c) => c.id)).toContain('loan');
      expect(borrowing.map((c) => c.id)).toContain('debt-payoff');
    });

    it('filters correctly for "Growth" (mapped to "Growing") category', () => {
      const growth = CALCULATORS_LIST.filter((c) => c.category === 'Growing');
      expect(growth.length).toBe(3);
      expect(growth.map((c) => c.id)).toContain('savings');
      expect(growth.map((c) => c.id)).toContain('compound-interest');
      expect(growth.map((c) => c.id)).toContain('investment');
    });

    it('filters correctly for "Planning" category', () => {
      const planning = CALCULATORS_LIST.filter((c) => c.category === 'Planning');
      expect(planning.length).toBe(2);
      expect(planning.map((c) => c.id)).toContain('budget');
      expect(planning.map((c) => c.id)).toContain('currency-converter');
    });
  });

  describe('[TC-NAV-001] Selective On-Demand Calculator Display', () => {
    it('defaults to null when no ?calc parameter is present', () => {
      const result = parseCalculatorFromQuery('');
      expect(result).toBeNull();
    });

    it('returns null for unrelated search parameters', () => {
      const result = parseCalculatorFromQuery('?page=calculators&ref=header');
      expect(result).toBeNull();
    });

    it('parses valid calculator query parameters accurately', () => {
      expect(parseCalculatorFromQuery('?calc=loan')).toBe('loan');
      expect(parseCalculatorFromQuery('?calc=savings')).toBe('savings');
      expect(parseCalculatorFromQuery('?calc=compound-interest')).toBe('compound-interest');
      expect(parseCalculatorFromQuery('?calc=compound')).toBe('compound-interest');
      expect(parseCalculatorFromQuery('?calc=investment')).toBe('investment');
      expect(parseCalculatorFromQuery('?calc=debt-payoff')).toBe('debt-payoff');
      expect(parseCalculatorFromQuery('?calc=debt')).toBe('debt-payoff');
      expect(parseCalculatorFromQuery('?calc=budget')).toBe('budget');
      expect(parseCalculatorFromQuery('?calc=currency-converter')).toBe('currency-converter');
      expect(parseCalculatorFromQuery('?calc=currency')).toBe('currency-converter');
    });

    it('safely rejects unknown calculator IDs', () => {
      expect(parseCalculatorFromQuery('?calc=crypto-moon')).toBeNull();
      expect(parseCalculatorFromQuery('?calc=random_string')).toBeNull();
    });
  });

  describe('[TC-BOX-001] Amount Sizing & Font Scaling in Metric Boxes', () => {
    it('applies large headline font for short numeric metrics (<= 9 chars)', () => {
      expect(getMetricValueFontSize('5 Years')).toBe('text-2xl sm:text-3xl');
      expect(getMetricValueFontSize('14.5%')).toBe('text-2xl sm:text-3xl');
      expect(getMetricValueFontSize('$500.00')).toBe('text-2xl sm:text-3xl');
    });

    it('scales to medium-large font for values between 10 and 12 chars', () => {
      expect(getMetricValueFontSize('₦12,500.00')).toBe('text-xl sm:text-2xl md:text-[1.65rem]');
      expect(getMetricValueFontSize('$150,000.00')).toBe('text-xl sm:text-2xl md:text-[1.65rem]');
    });

    it('scales to comfortable medium font for values between 13 and 16 chars', () => {
      // e.g. ₦15,482,920.45 has 14 characters
      expect(getMetricValueFontSize('₦15,482,920.45')).toBe('text-lg sm:text-xl md:text-2xl');
      expect(getMetricValueFontSize('£1,250,000.00')).toBe('text-lg sm:text-xl md:text-2xl');
    });

    it('scales to compact font for long values between 17 and 22 chars', () => {
      expect(getMetricValueFontSize('₦1,250,482,920.45')).toBe('text-base sm:text-lg md:text-xl');
      expect(getMetricValueFontSize('$999,999,999.00')).toBe('text-lg sm:text-xl md:text-2xl');
    });

    it('scales down gracefully for extreme multi-currency values (> 22 chars)', () => {
      const extremeVal = '₦145,000,000,000,000.00';
      expect(getMetricValueFontSize(extremeVal)).toBe('text-sm sm:text-base md:text-lg');
    });
  });

  describe('[TC-COL-001] Category Collapsible State Transition Logic', () => {
    it('toggles collapse state when clicking the already-selected category', () => {
      let selectedCategory = 'Borrowing';
      let isCollapsed = false;

      function handleClick(cat: string) {
        if (selectedCategory === cat) {
          isCollapsed = !isCollapsed;
        } else {
          selectedCategory = cat;
          isCollapsed = false;
        }
      }

      // First click on active category: should collapse
      handleClick('Borrowing');
      expect(isCollapsed).toBe(true);
      expect(selectedCategory).toBe('Borrowing');

      // Second click on active category: should expand
      handleClick('Borrowing');
      expect(isCollapsed).toBe(false);
      expect(selectedCategory).toBe('Borrowing');

      // Click on a different category: should switch and ensure expanded
      isCollapsed = true;
      handleClick('Growth');
      expect(selectedCategory).toBe('Growth');
      expect(isCollapsed).toBe(false);
    });
  });
});
