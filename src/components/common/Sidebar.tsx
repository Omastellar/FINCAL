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

interface NavItem {
  id: PageView;
  label: string;
  icon: React.ReactNode;
  calcId?: CalculatorId;
  badge?: string | number;
  adminOnly?: boolean;
  authRequired?: boolean;
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

  const calculatorSubItems: Array<{ id: CalculatorId; label: string; icon: React.ReactNode }> = [
    { id: 'loan', label: 'Loan & Amortization', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'currency-converter', label: 'Currency Converter', icon: <ArrowRightLeft className="w-4 h-4 text-teal-400" /> },
    { id: 'savings', label: 'Savings Growth', icon: <PiggyBank className="w-4 h-4" /> },
    { id: 'compound-interest', label: 'Compound Interest', icon: <Zap className="w-4 h-4" /> },
    { id: 'investment', label: 'Investment Returns', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'debt-payoff', label: 'Debt Payoff', icon: <Flame className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget 50/30/20', icon: <Wallet className="w-4 h-4" /> },
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
          // Desktop Width
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          // Mobile Off-canvas
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header / Logo */}
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
                Finance<span className="text-emerald-500">Calc</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Precision Suite
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
          {/* Main: Home */}
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

            {/* Collapsed Tooltip */}
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Home
              </div>
            )}
          </div>

          {/* Section Divider / Label */}
          <div
            className={`pt-3 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            <span>Calculators</span>
          </div>

          {/* Calculators Hub */}
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
                  All Calculators
                </span>
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    7
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

            {/* Collapsed Tooltip */}
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Calculators (7)
              </div>
            )}
          </div>

          {/* Calculator Submenu Items */}
          {(!isCollapsed || mobileOpen) && calculatorsSubmenuOpen && (
            <div className="pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800/80 ml-5 my-1">
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
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

          {/* Section Divider */}
          <div
            className={`pt-3 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            Workspace & Tools
          </div>

          {/* User Dashboard (for authenticated standard users) */}
          {isAuthenticated && !isAdmin && (
            <div className="relative group">
              <button
                onClick={() => handleNavClick('user')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'user'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'md:justify-center' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-5 h-5 shrink-0 ${currentPage === 'user' ? 'text-emerald-500' : ''}`} />
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                    User Dashboard
                  </span>
                </div>
              </button>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  User Dashboard
                </div>
              )}
            </div>
          )}

          {/* My Saved Calculations (for logged in user) */}
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
                    My Calculations
                  </span>
                </div>
                {!isCollapsed && savedCalculations.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {savedCalculations.length}
                  </span>
                )}
              </button>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  My Calculations ({savedCalculations.length})
                </div>
              )}
            </div>
          )}

          {/* Administrator / Super Administrator Portal */}
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
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                  )}
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                    {isSuperAdmin ? 'Super Admin Portal' : 'Admin Portal'}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {telemetry.totalVisitors} Users
                    </span>
                    {isSuperAdmin ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        Super
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        Admin
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {isSuperAdmin ? 'Super Admin Portal' : 'Admin Portal'} ({telemetry.totalVisitors} Users)
                </div>
              )}
            </div>
          )}

          {/* About */}
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
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>About FINCAL</span>
            </button>

            {/* Collapsed Tooltip */}
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                About
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer: User Status & Session Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {isAuthenticated && user ? (
            <div className="relative group">
              <div
                className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 ${
                  isCollapsed ? 'md:justify-center' : ''
                }`}
              >
                {/* User Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xs ${
                    user.role === 'superadmin' ? 'bg-amber-500' : user.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
                  }`}
                >
                  {user.role === 'superadmin' ? (
                    <Crown className="w-4 h-4 text-white" />
                  ) : user.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Expanded Details */}
                <div
                  onClick={() => handleNavClick((user.role === 'admin' || user.role === 'superadmin') ? 'admin' : 'user')}
                  className={`flex-1 min-w-0 cursor-pointer ${isCollapsed ? 'md:hidden' : ''}`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate hover:text-emerald-500 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {user.role === 'superadmin' ? 'Super Admin' : user.role}
                  </div>
                </div>

                {/* Sign Out Action Button */}
                <button
                  type="button"
                  onClick={logout}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors ${
                    isCollapsed ? 'md:hidden' : ''
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 bottom-2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {user.name} ({user.role === 'superadmin' ? 'Super Admin' : user.role})
                </div>
              )}
            </div>
          ) : (
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 ${
                  isCollapsed ? 'md:justify-center md:px-2' : 'justify-center'
                }`}
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                  Sign In
                </span>
              </button>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-3 bottom-2 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Sign In
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
