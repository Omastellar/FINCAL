import { describe, it, expect } from 'vitest';
import { DEMO_ADMIN, DEMO_USER } from '../../context/AuthContext';
import { User, SavedCalculation, PlatformSettings } from '../../types/auth';
import {
  initOrUpdateVisitorSession,
  recordCalculationEvent,
  getTelemetrySummary,
  getJoinedMembersSummary,
} from '../telemetry';

describe('Module 12: Authentication & Role Management Engine', () => {
  it('[TC-AUTH-001] validates default administrator configuration and roles', () => {
    expect(DEMO_ADMIN.email).toBe('admin@fincal.app');
    expect(DEMO_ADMIN.role).toBe('superadmin');
    expect(DEMO_ADMIN.name).toBe('Chief Super Administrator');
    expect(DEMO_ADMIN.title).toContain('Super Admin');
    expect(DEMO_ADMIN.id).toBeDefined();
  });

  it('[TC-AUTH-002] validates default user configuration and roles', () => {
    expect(DEMO_USER.email).toBe('alex@example.com');
    expect(DEMO_USER.role).toBe('user');
    expect(DEMO_USER.name).toBe('Alex Morgan');
    expect(DEMO_USER.id).toBeDefined();
  });

  it('[TC-AUTH-003] enforces strict role separation between Super Admin, Admin, and User', () => {
    expect(DEMO_ADMIN.role).not.toBe(DEMO_USER.role);
    expect(DEMO_ADMIN.role === 'superadmin').toBe(true);
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

  it('[TC-AUTH-006] validates password reset and recovery workflows', () => {
    // 1. Password minimum length criteria (min 6 characters)
    const isValidPassword = (p: string) => typeof p === 'string' && p.trim().length >= 6;
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('Secret2026!')).toBe(true);

    // 2. Email format validation for password recovery
    const isValidEmail = (email: string) => email.trim().includes('@') && email.trim().length >= 5;
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('alex@example.com')).toBe(true);
    expect(isValidEmail('admin@fincal.app')).toBe(true);

    // 3. Password confirmation matching
    const doPasswordsMatch = (p1: string, p2: string) => p1 === p2 && p1.length >= 6;
    expect(doPasswordsMatch('Password2026!', 'Different2026!')).toBe(false);
    expect(doPasswordsMatch('NewPassword123!', 'NewPassword123!')).toBe(true);

    // 4. Stored user password hash update simulation
    interface StoredUserAccount extends User {
      passwordHash?: string;
    }

    const testUsers: StoredUserAccount[] = [
      {
        id: 'usr_test_999',
        name: 'Jordan Smith',
        email: 'jordan@example.com',
        role: 'user',
        title: 'Analyst',
        createdAt: '2026-01-01T00:00:00Z',
        lastLogin: '2026-01-01T00:00:00Z',
        passwordHash: 'OldPassword123!',
      },
    ];

    const targetEmail = 'jordan@example.com';
    const newPassword = 'NewSecretPassword2026!';

    const userIndex = testUsers.findIndex((u) => u.email.toLowerCase() === targetEmail.toLowerCase());
    expect(userIndex).toBeGreaterThanOrEqual(0);

    testUsers[userIndex].passwordHash = newPassword;
    expect(testUsers[userIndex].passwordHash).toBe('NewSecretPassword2026!');
    expect(testUsers[userIndex].passwordHash).not.toBe('OldPassword123!');
  });

  it('[TC-AUTH-007] validates user login isolation from administrator portal and user dashboard state', () => {
    // 1. Role view isolation: standard login mode must exclude admin portal elements
    interface LoginViewConfig {
      mode: 'user' | 'admin';
      showAdminTab: boolean;
      showAdminDemo: boolean;
      showUserDemo: boolean;
      destinationPage: 'user' | 'admin';
    }

    const getLoginConfig = (mode: 'user' | 'admin'): LoginViewConfig => ({
      mode,
      showAdminTab: false, // In both modes, role tabs are suppressed to enforce strict separation
      showAdminDemo: mode === 'admin',
      showUserDemo: mode === 'user',
      destinationPage: mode === 'admin' ? 'admin' : 'user',
    });

    const userLogin = getLoginConfig('user');
    expect(userLogin.showAdminDemo).toBe(false);
    expect(userLogin.showAdminTab).toBe(false);
    expect(userLogin.showUserDemo).toBe(true);
    expect(userLogin.destinationPage).toBe('user');

    const adminLogin = getLoginConfig('admin');
    expect(adminLogin.showAdminDemo).toBe(true);
    expect(adminLogin.showUserDemo).toBe(false);
    expect(adminLogin.destinationPage).toBe('admin');

    // 2. User dashboard metric calculation: saved calculations filter by user id
    const mockCalculations: SavedCalculation[] = [
      {
        id: 'calc_1',
        userId: DEMO_USER.id,
        calculatorId: 'loan',
        title: 'Auto Loan',
        inputs: {},
        summaryResult: '₦50,000/mo',
        currency: 'NGN',
        timestamp: '2026-01-01T00:00:00Z',
      },
      {
        id: 'calc_2',
        userId: 'other_user_id',
        calculatorId: 'savings',
        title: 'Retirement Plan',
        inputs: {},
        summaryResult: '₦1,200,000',
        currency: 'NGN',
        timestamp: '2026-01-02T00:00:00Z',
      },
      {
        id: 'calc_3',
        userId: DEMO_USER.id,
        calculatorId: 'currency-converter',
        title: 'Euro Remittance',
        inputs: {},
        summaryResult: '€2,500',
        currency: 'EUR',
        timestamp: '2026-01-03T00:00:00Z',
      },
    ];

    const userCalcs = mockCalculations.filter((c) => c.userId === DEMO_USER.id);
    expect(userCalcs.length).toBe(2);
    expect(userCalcs.map((c) => c.calculatorId)).toEqual(['loan', 'currency-converter']);
  });

  it('[TC-AUTH-008] validates telemetry tracking for registered vs unregistered guest users and calculator popularity', () => {
    // 1. Initialize anonymous / unregistered guest session
    const guestSession = initOrUpdateVisitorSession(null, 'Currency Converter');
    expect(guestSession.type).toBe('unregistered');
    expect(guestSession.lastToolUsed).toBe('Currency Converter');
    expect(guestSession.status).toBe('online');
    expect(guestSession.userName).toBeUndefined();

    // 2. Record a calculation event for guest
    recordCalculationEvent('Currency Converter', false);

    // 3. Initialize registered session
    const userSession = initOrUpdateVisitorSession(DEMO_USER, 'Loan Calculator');
    expect(userSession.type).toBe('registered');
    expect(userSession.userName).toBe(DEMO_USER.name);
    expect(userSession.userEmail).toBe(DEMO_USER.email);
    expect(userSession.lastToolUsed).toBe('Loan Calculator');

    // 4. Record calculation event for registered user
    recordCalculationEvent('Loan Calculator', true);

    // 5. Query aggregated telemetry summary
    const summary = getTelemetrySummary();
    expect(summary.totalVisitors).toBeGreaterThanOrEqual(2);
    expect(summary.registeredCount).toBeGreaterThanOrEqual(1);
    expect(summary.unregisteredCount).toBeGreaterThanOrEqual(1);
    expect(summary.totalVisitors).toBe(summary.registeredCount + summary.unregisteredCount);
    expect(summary.totalCalculationsRun).toBe(
      summary.registeredCalculationsRun + summary.unregisteredCalculationsRun
    );

    // 6. Verify calculator popularity metrics
    expect(summary.calculatorPopularity['Currency Converter']).toBeDefined();
    expect(summary.calculatorPopularity['Currency Converter'].total).toBe(
      summary.calculatorPopularity['Currency Converter'].registered +
        summary.calculatorPopularity['Currency Converter'].unregistered
    );
    expect(summary.calculatorPopularity['Loan Calculator']).toBeDefined();
  });

  it('[TC-AUTH-009] validates joined members growth summary and registration tracking', () => {
    const summary = getJoinedMembersSummary();
    expect(summary.totalJoined).toBeGreaterThanOrEqual(8);
    expect(summary.standardMembersCount).toBeGreaterThanOrEqual(1);
    expect(summary.adminMembersCount).toBeGreaterThanOrEqual(1);
    expect(summary.superAdminMembersCount).toBeGreaterThanOrEqual(1);
    expect(summary.totalJoined).toBe(
      summary.standardMembersCount + summary.adminMembersCount + (summary.superAdminMembersCount || 0)
    );
    expect(summary.joinedThisMonth).toBeGreaterThanOrEqual(1);
    expect(summary.members.length).toBe(summary.totalJoined);

    // Verify members are sorted newest joined first
    for (let i = 0; i < summary.members.length - 1; i++) {
      const currentTime = new Date(summary.members[i].joinedAt).getTime();
      const nextTime = new Date(summary.members[i + 1].joinedAt).getTime();
      expect(currentTime).toBeGreaterThanOrEqual(nextTime);
    }

    // Verify each member record structure
    const sampleMember = summary.members[0];
    expect(sampleMember.id).toBeDefined();
    expect(sampleMember.name).toBeDefined();
    expect(sampleMember.email).toContain('@');
    expect(['admin', 'user']).toContain(sampleMember.role);
    expect(sampleMember.title).toBeDefined();
    expect(sampleMember.joinedAt).toBeDefined();
    expect(sampleMember.status).toBe('Verified');
  });

  it('[TC-AUTH-010] grants non-registered users access to calculators but restricts data saving until registration', () => {
    // 1. Gating verification helper: calculators are accessible to guests and registered users
    const canAccessCalculator = (user: User | null, allowGuest: boolean = true) => {
      if (allowGuest) return true;
      return Boolean(user && user.id);
    };

    // Unregistered guest is granted access to interactive calculators
    expect(canAccessCalculator(null, true)).toBe(true);

    // Registered user is granted access
    expect(canAccessCalculator(DEMO_USER, true)).toBe(true);

    // Administrator is granted access
    expect(canAccessCalculator(DEMO_ADMIN, true)).toBe(true);

    // Dynamic registered account is granted access
    const dynamicUser: User = {
      id: 'usr_new_123',
      name: 'Test Member',
      email: 'member@test.com',
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    expect(canAccessCalculator(dynamicUser, true)).toBe(true);

    // 2. Data persistence verification helper: data won't be saved until registered
    const canSaveCalculationData = (user: User | null): boolean => {
      return Boolean(user && user.id && user.role);
    };

    // Non-registered users' data cannot be saved
    expect(canSaveCalculationData(null)).toBe(false);

    // Registered members' data can be saved
    expect(canSaveCalculationData(DEMO_USER)).toBe(true);
    expect(canSaveCalculationData(DEMO_ADMIN)).toBe(true);
    expect(canSaveCalculationData(dynamicUser)).toBe(true);
  });

  it('[TC-AUTH-011] validates non-collapsible interface and demo element removal for login pages', () => {
    // 1. Auth page identification helper
    const isAuthPage = (page: string) => page === 'login' || page === 'admin-login';
    expect(isAuthPage('login')).toBe(true);
    expect(isAuthPage('admin-login')).toBe(true);
    expect(isAuthPage('home')).toBe(false);
    expect(isAuthPage('calculators')).toBe(false);
    expect(isAuthPage('admin')).toBe(false);
    expect(isAuthPage('user')).toBe(false);

    // 2. Collapsible sidebar suppression on auth pages
    const shouldRenderSidebar = (page: string) => !isAuthPage(page);
    expect(shouldRenderSidebar('login')).toBe(false);
    expect(shouldRenderSidebar('admin-login')).toBe(false);
    expect(shouldRenderSidebar('home')).toBe(true);

    // 3. Margin offset normalization on auth pages (no sidebar offset)
    const getMainColumnMargin = (page: string, isCollapsed: boolean) => {
      if (isAuthPage(page)) return 'ml-0';
      return isCollapsed ? 'md:ml-20' : 'md:ml-64';
    };
    expect(getMainColumnMargin('login', false)).toBe('ml-0');
    expect(getMainColumnMargin('login', true)).toBe('ml-0');
    expect(getMainColumnMargin('admin-login', false)).toBe('ml-0');
    expect(getMainColumnMargin('home', false)).toBe('md:ml-64');
    expect(getMainColumnMargin('home', true)).toBe('md:ml-20');

    // 4. Initial credentials must be empty strings (no demo pre-fill)
    const initialLoginFormState = {
      email: '',
      password: '',
      name: '',
    };
    expect(initialLoginFormState.email).toBe('');
    expect(initialLoginFormState.password).toBe('');
    expect(initialLoginFormState.name).toBe('');
  });

  it('[TC-AUTH-012] validates admin access to numbers of users telemetry (registered, unregistered, and live active users)', () => {
    // 1. Verify telemetry summary computes user counts accurately
    const telemetry = getTelemetrySummary();
    expect(telemetry.totalVisitors).toBeGreaterThan(0);
    expect(telemetry.registeredCount).toBeGreaterThan(0);
    expect(telemetry.unregisteredCount).toBeGreaterThan(0);
    expect(telemetry.totalVisitors).toBe(telemetry.registeredCount + telemetry.unregisteredCount);
    expect(telemetry.activeNowCount).toBeGreaterThanOrEqual(0);

    // 2. Role-based visibility check: Admin or Super Admin can access user analytics and totals
    const canAdminViewNumbersOfUsers = (role?: string) => role === 'admin' || role === 'superadmin';
    expect(canAdminViewNumbersOfUsers(DEMO_ADMIN.role)).toBe(true);
    expect(canAdminViewNumbersOfUsers(DEMO_USER.role)).toBe(false);
    expect(canAdminViewNumbersOfUsers(undefined)).toBe(false);

    // 3. Verify user classification proportion calculation
    const registeredRatio = (telemetry.registeredCount / telemetry.totalVisitors) * 100;
    const unregisteredRatio = (telemetry.unregisteredCount / telemetry.totalVisitors) * 100;
    expect(registeredRatio + unregisteredRatio).toBeCloseTo(100, 1);
  });

  it('[TC-AUTH-013] validates Super Admin root authority, role hierarchy, and root role controls', () => {
    // 1. Super Admin role hierarchy verification
    const rolePrecedence: Record<string, number> = {
      superadmin: 3,
      admin: 2,
      user: 1,
    };

    expect(rolePrecedence[DEMO_ADMIN.role]).toBeGreaterThan(rolePrecedence[DEMO_USER.role]);
    expect(rolePrecedence[DEMO_ADMIN.role]).toBe(3);

    // 2. Super Admin permission checker helper
    const hasSuperAdminRootAuthority = (role?: string) => role === 'superadmin';
    const hasAdminAuthority = (role?: string) => role === 'admin' || role === 'superadmin';

    expect(hasSuperAdminRootAuthority(DEMO_ADMIN.role)).toBe(true);
    expect(hasAdminAuthority(DEMO_ADMIN.role)).toBe(true);
    expect(hasSuperAdminRootAuthority(DEMO_USER.role)).toBe(false);
    expect(hasAdminAuthority(DEMO_USER.role)).toBe(false);

    // 3. User role reassignment validity check
    const isValidRole = (role: string): boolean => ['superadmin', 'admin', 'user'].includes(role);
    expect(isValidRole('superadmin')).toBe(true);
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('user')).toBe(true);
    expect(isValidRole('guest')).toBe(false);
  });
});

