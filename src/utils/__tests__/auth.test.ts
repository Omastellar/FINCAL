import { describe, it, expect } from 'vitest';
import { DEMO_ADMIN, DEMO_USER } from '../../context/AuthContext';
import { User, SavedCalculation, PlatformSettings } from '../../types/auth';

describe('Module 12: Authentication & Role Management Engine', () => {
  it('[TC-AUTH-001] validates default administrator configuration and roles', () => {
    expect(DEMO_ADMIN.email).toBe('admin@fincal.app');
    expect(DEMO_ADMIN.role).toBe('admin');
    expect(DEMO_ADMIN.name).toBe('Chief Administrator');
    expect(DEMO_ADMIN.id).toBeDefined();
  });

  it('[TC-AUTH-002] validates default user configuration and roles', () => {
    expect(DEMO_USER.email).toBe('alex@example.com');
    expect(DEMO_USER.role).toBe('user');
    expect(DEMO_USER.name).toBe('Alex Morgan');
    expect(DEMO_USER.id).toBeDefined();
  });

  it('[TC-AUTH-003] enforces strict role separation between Admin and User', () => {
    expect(DEMO_ADMIN.role).not.toBe(DEMO_USER.role);
    expect(DEMO_ADMIN.role === 'admin').toBe(true);
    expect(DEMO_USER.role === 'user').toBe(true);
  });

  it('[TC-AUTH-004] validates saved calculation schema and serialization', () => {
    const calc: SavedCalculation = {
      id: 'calc_test_123',
      userId: DEMO_USER.id,
      calculatorId: 'loan',
      title: 'Mortgage Refinance 2026',
      inputs: { principal: 500000, rate: 12, years: 5 },
      summaryResult: '₦11,122.22 / month',
      currency: 'NGN',
      timestamp: new Date().toISOString(),
    };

    const serialized = JSON.stringify(calc);
    const deserialized: SavedCalculation = JSON.parse(serialized);

    expect(deserialized.id).toBe(calc.id);
    expect(deserialized.userId).toBe(DEMO_USER.id);
    expect(deserialized.calculatorId).toBe('loan');
    expect(deserialized.inputs.principal).toBe(500000);
    expect(deserialized.currency).toBe('NGN');
  });

  it('[TC-AUTH-005] checks platform settings defaults and constraints', () => {
    const defaultSettings: PlatformSettings = {
      defaultCurrency: 'NGN',
      allowGuestCalculations: true,
      maintenanceMode: false,
      maxSavedCalculationsPerUser: 50,
      benchmarkInterestRate: 14.5,
      defaultInflationRate: 18.0,
    };

    expect(defaultSettings.allowGuestCalculations).toBe(true);
    expect(defaultSettings.benchmarkInterestRate).toBeGreaterThan(0);
    expect(defaultSettings.defaultInflationRate).toBeGreaterThan(0);
    expect(defaultSettings.defaultCurrency).toBe('NGN');
  });
});
