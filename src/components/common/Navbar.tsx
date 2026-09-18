import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Menu,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  LogIn,
  LogOut,
  Bookmark,
  Calculator,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENCIES, CurrencyCode } from '../../types/currency';
import { PageView } from '../../types/navigation';
import { CalculatorId } from '../../types/calculators';
import { CALCULATORS_LIST } from '../../data/calculatorMetadata';

interface NavbarProps {
  currentPage: PageView;
  activeCalcId?: CalculatorId | null;
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
  onToggleSidebarMobile: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  activeCalcId = null,
  onNavigate,
  onToggleSidebarMobile,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
}) => {
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currencyOptions: CurrencyCode[] = ['NGN', 'USD', 'GBP', 'EUR'];

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home':
        return 'Home';
      case 'calculators': {
        const match = activeCalcId ? CALCULATORS_LIST.find((c) => c.id === activeCalcId) : null;
        return match ? match.title : 'Calculators';
      }
      case 'about':
        return 'About FINCAL';
      case 'login':
        return 'Authentication';
      case 'admin':
        return 'Administrative Portal';
      case 'saved':
        return 'My Calculations';
      default:
        return 'Finance Calculator';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggles & Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={onToggleSidebarMobile}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle Shortcut */}
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              className="hidden md:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-emerald-500" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumbs / Page Context */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span
                onClick={() => onNavigate('home')}
                className="font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
              >
                FINCAL
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              {currentPage === 'calculators' && activeCalcId && (
                <>
                  <span
                    onClick={() => onNavigate('calculators')}
                    className="font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors hidden sm:inline"
                  >
                    Calculators
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </>
              )}

              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-[280px]">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: Currency Switcher, Theme Switcher & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-emerald-500 transition-colors shadow-2xs"
                title="Change active currency"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  {CURRENCIES[currency]?.symbol || '₦'}
                </span>
                <span>{currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-40">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Select Currency
                    </div>
                    {currencyOptions.map((code) => {
                      const cfg = CURRENCIES[code];
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setCurrency(code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                            currency === code
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-bold">{cfg.symbol}</span>
                            <span>{code}</span>
                          </span>
                          {code === 'NGN' && (
                            <span className="text-[10px] text-emerald-500 font-medium">Default</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Dropdown or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    user.role === 'admin'
                      ? 'border-purple-300 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:border-purple-500'
                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                      user.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
                    }`}
                  >
                    {user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden sm:inline font-bold max-w-[90px] truncate">{user.name}</span>
                  <span
                    className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                      user.role === 'admin'
                        ? 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    }`}
                  >
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-40">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      </div>

                      <div className="py-1">
                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              onNavigate('admin');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 font-medium"
                          >
                            <ShieldCheck className="w-4 h-4" /> Admin Console
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onNavigate('saved');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Bookmark className="w-4 h-4 text-emerald-500" /> My Calculations
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('calculators');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Calculator className="w-4 h-4 text-slate-400" /> Open Calculators
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            onNavigate('login');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
