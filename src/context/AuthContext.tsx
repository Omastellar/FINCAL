import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  AuthCredentials,
  RegisterData,
  SavedCalculation,
  SystemAuditLog,
  PlatformSettings,
} from '../types/auth';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLogin: (role: UserRole) => void;
  savedCalculations: SavedCalculation[];
  saveCalculation: (calc: Omit<SavedCalculation, 'id' | 'userId' | 'timestamp'>) => boolean;
  deleteCalculation: (id: string) => void;
  clearSavedCalculations: () => void;
  auditLogs: SystemAuditLog[];
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'fincal_auth_user';
export const USERS_LIST_KEY = 'fincal_registered_users';
const CALCULATIONS_KEY = 'fincal_saved_calculations';
const AUDIT_KEY = 'fincal_audit_logs';
const SETTINGS_KEY = 'fincal_platform_settings';

// Built-in Demo Users
export const DEMO_ADMIN: User = {
  id: 'usr_admin_001',
  name: 'Chief Administrator',
  email: 'admin@fincal.app',
  role: 'admin',
  title: 'Lead Fintech Architect',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

export const DEMO_USER: User = {
  id: 'usr_demo_002',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  role: 'user',
  title: 'Portfolio Investor',
  createdAt: '2026-01-15T08:30:00.000Z',
  lastLogin: new Date().toISOString(),
};

const DEFAULT_SETTINGS: PlatformSettings = {
  defaultCurrency: 'NGN',
  allowGuestCalculations: true,
  maintenanceMode: false,
  maxSavedCalculationsPerUser: 50,
  benchmarkInterestRate: 14.5,
  defaultInflationRate: 18.0,
};

const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log_init_001',
    action: 'System Engine Initialized',
    performedBy: 'System Core',
    role: 'admin',
    timestamp: new Date().toISOString(),
    details: 'Precision financial computation suite initialized successfully.',
    status: 'success',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current user session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_SESSION_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  // Saved calculations
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const stored = localStorage.getItem(CALCULATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(AUDIT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Save session when user changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Save calculations when updated
  useEffect(() => {
    try {
      localStorage.setItem(CALCULATIONS_KEY, JSON.stringify(savedCalculations));
    } catch {
      // ignore
    }
  }, [savedCalculations]);

  // Save audit logs
  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(platformSettings));
    } catch {
      // ignore
    }
  }, [platformSettings]);

  const addAuditLog = (
    action: string,
    performedBy: string,
    role: UserRole,
    details: string,
    status: 'success' | 'warning' | 'info' = 'info'
  ) => {
    const newLog: SystemAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      role,
      timestamp: new Date().toISOString(),
      details,
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const login = async (credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> => {
    const { email, password, role } = credentials;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please provide both email address and password.' };
    }

    // Check Demo Admin
    if (cleanEmail === DEMO_ADMIN.email.toLowerCase() || (cleanEmail === 'admin' && password === 'Admin2026!')) {
      if (password !== 'Admin2026!' && password !== 'admin123' && password !== 'Admin123!') {
        return { success: false, error: 'Incorrect password for Administrator account.' };
      }
      const adminUser: User = { ...DEMO_ADMIN, lastLogin: new Date().toISOString() };
      setUser(adminUser);
      addAuditLog('Admin Authentication', adminUser.name, 'admin', 'Administrator signed into session.', 'success');
      return { success: true };
    }

    // Check Demo User
    if (cleanEmail === DEMO_USER.email.toLowerCase() || (cleanEmail === 'user' && password === 'User2026!')) {
      if (password !== 'User2026!' && password !== 'user123' && password !== 'User123!') {
        return { success: false, error: 'Incorrect password for User account.' };
      }
      const regularUser: User = { ...DEMO_USER, lastLogin: new Date().toISOString() };
      setUser(regularUser);
      addAuditLog('User Authentication', regularUser.name, 'user', 'Standard user signed into session.', 'success');
      return { success: true };
    }

    // Check custom registered users
    try {
      const registered = localStorage.getItem(USERS_LIST_KEY);
      if (registered) {
        const usersList: Array<User & { passwordHash?: string }> = JSON.parse(registered);
        const match = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
        if (match) {
          if (match.passwordHash && match.passwordHash !== password) {
            return { success: false, error: 'Incorrect password.' };
          }
          const loggedInUser: User = {
            id: match.id,
            name: match.name,
            email: match.email,
            role: match.role,
            title: match.title,
            createdAt: match.createdAt,
            lastLogin: new Date().toISOString(),
          };
          setUser(loggedInUser);
          addAuditLog('User Authentication', loggedInUser.name, loggedInUser.role, `${loggedInUser.role} logged in successfully.`, 'success');
          return { success: true };
        }
      }
    } catch {
      // ignore
    }

    // Allow user to log in if valid email and password length >= 6
    if (cleanEmail.includes('@') && password.length >= 6) {
      const chosenRole: UserRole = role || (cleanEmail.includes('admin') ? 'admin' : 'user');
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        role: chosenRole,
        title: chosenRole === 'admin' ? 'System Administrator' : 'Verified Member',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      setUser(newUser);
      addAuditLog('New Session Created', newUser.name, newUser.role, `Authenticated as ${newUser.role}.`, 'info');
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials. Password must be at least 6 characters.' };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const { name, email, password, role = 'user' } = data;
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'A valid email address is required.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role,
      title: role === 'admin' ? 'Platform Administrator' : 'Financial Planner',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem(USERS_LIST_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.push({ ...newUser, passwordHash: password });
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    setUser(newUser);
    addAuditLog('User Registered', newUser.name, newUser.role, `New ${newUser.role} account created successfully.`, 'success');
    return { success: true };
  };

  const resetPassword = async (
    targetEmail: string,
    newPasswordValue: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!newPasswordValue || newPasswordValue.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    // Check demo admin
    if (cleanEmail === DEMO_ADMIN.email.toLowerCase()) {
      addAuditLog(
        'Password Reset',
        DEMO_ADMIN.name,
        'admin',
        'Administrator password updated via recovery request.',
        'warning'
      );
      return { success: true };
    }

    // Check demo user
    if (cleanEmail === DEMO_USER.email.toLowerCase()) {
      addAuditLog(
        'Password Reset',
        DEMO_USER.name,
        'user',
        'Standard user password updated via recovery request.',
        'info'
      );
      return { success: true };
    }

    // Check custom registered users in localStorage
    try {
      const existing = localStorage.getItem(USERS_LIST_KEY);
      if (existing) {
        const list: Array<User & { passwordHash?: string }> = JSON.parse(existing);
        const index = list.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (index !== -1) {
          list[index].passwordHash = newPasswordValue;
          localStorage.setItem(USERS_LIST_KEY, JSON.stringify(list));
          addAuditLog(
            'Password Reset',
            list[index].name,
            list[index].role,
            `Password updated for ${cleanEmail}.`,
            'info'
          );
          return { success: true };
        }
      }
    } catch {
      // ignore
    }

    addAuditLog(
      'Password Reset',
      cleanEmail.split('@')[0],
      'user',
      `Password reset completed for ${cleanEmail}.`,
      'info'
    );
    return { success: true };
  };

  const logout = () => {
    if (user) {
      addAuditLog('User Sign Out', user.name, user.role, 'Session terminated cleanly.', 'info');
    }
    setUser(null);
  };

  const quickLogin = (roleToLogin: UserRole) => {
    if (roleToLogin === 'admin') {
      const admin = { ...DEMO_ADMIN, lastLogin: new Date().toISOString() };
      setUser(admin);
      addAuditLog('Quick Demo Login', admin.name, 'admin', 'Instant Administrator demo session initiated.', 'success');
    } else {
      const demoUsr = { ...DEMO_USER, lastLogin: new Date().toISOString() };
      setUser(demoUsr);
      addAuditLog('Quick Demo Login', demoUsr.name, 'user', 'Instant User demo session initiated.', 'success');
    }
  };

  const saveCalculation = (calc: Omit<SavedCalculation, 'id' | 'userId' | 'timestamp'>): boolean => {
    // Non-registered users can calculate freely, but data won't be saved until they register
    if (!user) {
      return false;
    }

    const newCalculation: SavedCalculation = {
      ...calc,
      id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      timestamp: new Date().toISOString(),
    };
    setSavedCalculations((prev) => [newCalculation, ...prev]);
    addAuditLog(
      'Calculation Saved',
      user.name,
      user.role,
      `Saved ${calc.title} result: ${calc.summaryResult}`,
      'info'
    );
    return true;
  };

  const deleteCalculation = (id: string) => {
    setSavedCalculations((prev) => prev.filter((c) => c.id !== id));
  };

  const clearSavedCalculations = () => {
    setSavedCalculations([]);
  };

  const updatePlatformSettings = (newSettings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      addAuditLog('Settings Updated', user?.name || 'Admin', 'admin', 'Platform parameters reconfigured.', 'warning');
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        resetPassword,
        logout,
        quickLogin,
        savedCalculations,
        saveCalculation,
        deleteCalculation,
        clearSavedCalculations,
        auditLogs,
        platformSettings,
        updatePlatformSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
