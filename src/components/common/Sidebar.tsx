import React, { useState } from 'react';
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  Home,
  CreditCard,
  ArrowRightLeft,
  PiggyBank,
  Zap,
  BarChart3,
  Flame,
  Wallet,
  Bookmark,
  ShieldCheck,
  Info,
  LogIn,
  LogOut,
  ChevronDown,
  User as UserIcon,
  LayoutDashboard,
  X,
  Lock,
  Users,
  Crown,
  Compass,
  Car,
  Target,
  UserCheck,
  Activity,
  Landmark,
  Columns3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageView } from '../../types/navigation';
import { CalculatorId } from '../../types/calculators';
import { getTelemetrySummary } from '../../utils/telemetry';

interface SidebarProps {
  currentPage: PageView;
  activeCalcId?: CalculatorId | null;
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  activeCalcId = null,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout, savedCalculations } = useAuth();
  const [calculatorsSubmenuOpen, setCalculatorsSubmenuOpen] = useState(true);
  const telemetry = getTelemetrySummary();

  const handleNavClick = (page: PageView, calcId?: CalculatorId) => {
    onNavigate(page, calcId);
    onCloseMobile();
  };

  const calculatorSubItems: Array<{ id: CalculatorId; label: string; icon: React.ReactNode; suite: string }> = [
    // Loan Suite
    { id: 'mortgage', label: 'Mortgage & PITI', icon: <Home className="w-3.5 h-3.5 text-emerald-500" />, suite: 'Loans' },
    { id: 'home-affordability', label: 'Home Affordability', icon: <Compass className="w-3.5 h-3.5 text-emerald-500" />, suite: 'Loans' },
    { id: 'auto-loan', label: 'Auto Loan & Trade-In', icon: <Car className="w-3.5 h-3.5 text-emerald-500" />, suite: 'Loans' },
    { id: 'personal-loan', label: 'Personal Loan & APR', icon: <CreditCard className="w-3.5 h-3.5 text-emerald-500" />, suite: 'Loans' },
    { id: 'loan', label: 'General Loan', icon: <CreditCard className="w-3.5 h-3.5 text-emerald-500" />, suite: 'Loans' },

    // Savings & Investments
    { id: 'savings-goal', label: 'Savings Goal Planner', icon: <Target className="w-3.5 h-3.5 text-blue-500" />, suite: 'Savings' },
    { id: 'retirement', label: 'Retirement & Nest Egg', icon: <UserCheck className="w-3.5 h-3.5 text-blue-500" />, suite: 'Savings' },
    { id: 'compound-interest', label: 'Compound Interest', icon: <Zap className="w-3.5 h-3.5 text-blue-500" />, suite: 'Savings' },
    { id: 'investment', label: 'Investment Portfolio', icon: <BarChart3 className="w-3.5 h-3.5 text-blue-500" />, suite: 'Savings' },
    { id: 'savings', label: 'Savings Growth', icon: <PiggyBank className="w-3.5 h-3.5 text-blue-500" />, suite: 'Savings' },

    // Budget & Debt
    { id: 'budget', label: '14-Category Budget', icon: <Wallet className="w-3.5 h-3.5 text-purple-500" />, suite: 'Budget' },
    { id: 'multi-debt-payoff', label: 'Multi-Debt Payoff', icon: <Flame className="w-3.5 h-3.5 text-purple-500" />, suite: 'Budget' },
    { id: 'dti', label: 'DTI Diagnostic', icon: <Activity className="w-3.5 h-3.5 text-purple-500" />, suite: 'Budget' },
    { id: 'net-worth', label: 'Net Worth & Assets', icon: <Landmark className="w-3.5 h-3.5 text-purple-500" />, suite: 'Budget' },
    { id: 'debt-payoff', label: 'Single-Debt Payoff', icon: <Flame className="w-3.5 h-3.5 text-purple-500" />, suite: 'Budget' },

    // Planning & Decisions
    { id: 'financial-goals', label: 'Financial Goals', icon: <Target className="w-3.5 h-3.5 text-amber-500" />, suite: 'Decisions' },
    { id: 'scenarios', label: 'Scenario Comparison', icon: <Columns3 className="w-3.5 h-3.5 text-amber-500" />, suite: 'Decisions' },
    { id: 'currency-converter', label: 'Multi-Currency Matrix', icon: <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />, suite: 'Decisions' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header / FINCAL Logo */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800">
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden group"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>

            {/* Logo Text (hidden when collapsed on desktop) */}
            <div
              className={`transition-opacity duration-200 ${
                isCollapsed ? 'md:hidden opacity-0' : 'opacity-100'
              }`}
            >
              <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                FIN<span className="text-emerald-500">CAL</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Planning Platform
              </div>
            </div>
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1.5 scrollbar-thin">
          {/* Home Link */}
          <div className="relative group">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <Home className={`w-5 h-5 shrink-0 ${currentPage === 'home' ? 'text-emerald-500' : ''}`} />
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Home</span>
            </button>
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Home
              </div>
            )}
          </div>

          {/* Central Financial Dashboard */}
          <div className="relative group">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0 ${currentPage === 'dashboard' ? 'text-emerald-500' : ''}`} />
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Financial Dashboard</span>
            </button>
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Financial Dashboard
              </div>
            )}
          </div>

          {/* Section Divider / Label */}
          <div
            className={`pt-3 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            <span>The 4 Planning Suites</span>
          </div>

          {/* Calculators Hub Item */}
          <div className="relative group">
            <div
              onClick={() => {
                handleNavClick('calculators');
                if (!isCollapsed) {
                  setCalculatorsSubmenuOpen(true);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'calculators' && !activeCalcId
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Calculator className={`w-5 h-5 shrink-0 ${currentPage === 'calculators' ? 'text-emerald-500' : ''}`} />
                <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                  All 18 Engines
                </span>
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    18
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalculatorsSubmenuOpen(!calculatorsSubmenuOpen);
                    }}
                    className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors"
                    title="Toggle submenu"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        calculatorsSubmenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                All 18 Engines
              </div>
            )}
          </div>

          {/* Calculator Submenu Items */}
          {(!isCollapsed || mobileOpen) && calculatorsSubmenuOpen && (
            <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800/80 ml-5 my-1 max-h-72 overflow-y-auto">
              {calculatorSubItems.map((sub) => {
                const isActive = currentPage === 'calculators' && activeCalcId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavClick('calculators', sub.id);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="shrink-0">{sub.icon}</span>
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Decision Support Shortcuts */}
          <div
            className={`pt-3 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            Decisions & Workspace
          </div>

          {/* Scenario Comparison Shortcut */}
          <div className="relative group">
            <button
              onClick={() => handleNavClick('scenarios')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentPage === 'scenarios' || (currentPage === 'calculators' && activeCalcId === 'scenarios')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <Columns3 className="w-5 h-5 shrink-0 text-amber-500" />
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Scenario Modeling</span>
            </button>
          </div>

          {/* Financial Goals Shortcut */}
          <div className="relative group">
            <button
              onClick={() => handleNavClick('goals')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentPage === 'goals' || (currentPage === 'calculators' && activeCalcId === 'financial-goals')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <Target className="w-5 h-5 shrink-0 text-purple-500" />
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Financial Goals</span>
            </button>
          </div>

          {/* Saved Calculations (for logged in user) */}
          {isAuthenticated && (
            <div className="relative group">
              <button
                onClick={() => handleNavClick('saved')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'saved'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'md:justify-center' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className={`w-5 h-5 shrink-0 ${currentPage === 'saved' ? 'text-emerald-500' : ''}`} />
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                    My Saved Models
                  </span>
                </div>
                {!isCollapsed && savedCalculations.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {savedCalculations.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Super Administrator Portal */}
          {isAdmin && (
            <div className="relative group">
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentPage === 'admin'
                    ? isSuperAdmin
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                    : isSuperAdmin
                    ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                } ${isCollapsed ? 'md:justify-center' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {isSuperAdmin ? (
                    <Crown className="w-5 h-5 shrink-0 text-amber-500" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 shrink-0 text-purple-500" />
                  )}
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                    {isSuperAdmin ? 'Super Admin' : 'Admin Portal'}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* About Platform */}
          <div className="relative group">
            <button
              onClick={() => handleNavClick('about')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentPage === 'about'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <Info className={`w-5 h-5 shrink-0 ${currentPage === 'about' ? 'text-emerald-500' : ''}`} />
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                About FINCAL
              </span>
            </button>
          </div>
        </div>

        {/* Footer / Account / Session Area */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 text-xs ${
                  isCollapsed ? 'md:justify-center' : ''
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold uppercase shrink-0">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                {!isCollapsed && (
                  <div className="truncate flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {user?.name || user?.email}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {user?.role} Access
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${
                  isCollapsed ? 'md:justify-center' : ''
                }`}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('login')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs ${
                isCollapsed ? 'md:justify-center' : ''
              }`}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : ''}>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
