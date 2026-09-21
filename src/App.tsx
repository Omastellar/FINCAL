import React, { useState, useEffect } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { SavedCalculationsPage } from './pages/SavedCalculationsPage';
import { UserPage } from './pages/UserPage';
import { DashboardPage } from './pages/DashboardPage';
import { PageView } from './types/navigation';
import { CalculatorId } from './types/calculators';
import { initOrUpdateVisitorSession } from './utils/telemetry';

export const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      if (search.get('calc')) return 'calculators';
      const page = search.get('page') as PageView;
      if (page && ['home', 'dashboard', 'calculators', 'about', 'login', 'admin', 'admin-login', 'saved', 'user', 'scenarios', 'goals'].includes(page)) {
        return page;
      }
    } catch {
      // ignore
    }
    return 'home';
  });

  const [selectedCalcId, setSelectedCalcId] = useState<CalculatorId | null>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const calc = search.get('calc') as CalculatorId;
      if (calc) return calc;
    } catch {
      // ignore
    }
    return null;
  });

  // Track visitor telemetry for registered and unregistered guest users
  useEffect(() => {
    try {
      const calcNameMap: Record<string, string> = {
        loan: 'Loan Calculator',
        mortgage: 'Mortgage & PITI Calculator',
        'home-affordability': 'Home Affordability Calculator',
        'auto-loan': 'Auto Loan & Trade-In',
        'personal-loan': 'Personal Loan & APR',
        savings: 'Savings Growth',
        'savings-goal': 'Savings Goal Planner',
        'compound-interest': 'Compound Interest',
        investment: 'Investment Returns',
        retirement: 'Retirement & Nest Egg',
        'debt-payoff': 'Debt Payoff',
        'multi-debt-payoff': 'Multi-Debt Payoff Planner',
        dti: 'Debt-to-Income Diagnostic',
        'net-worth': 'Net Worth Calculator',
        'financial-goals': 'Financial Goals Planner',
        scenarios: 'Scenario Comparison Tool',
        budget: 'Budget 50/30/20',
        'currency-converter': 'Currency Converter',
      };
      const activeName = selectedCalcId
        ? calcNameMap[selectedCalcId] || selectedCalcId
        : currentPage === 'calculators'
        ? 'Calculators Hub'
        : currentPage;
      initOrUpdateVisitorSession(user, activeName);
    } catch {
      // ignore
    }
  }, [user, currentPage, selectedCalcId]);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fincal_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return false;
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fincal_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNavigate = (page: PageView, calcId?: CalculatorId) => {
    setCurrentPage(page);
    if (calcId) {
      setSelectedCalcId(calcId);
    } else if (page === 'calculators') {
      setSelectedCalcId(null);
    }
    try {
      const url = new URL(window.location.href);
      if (calcId) {
        url.searchParams.set('calc', calcId);
      } else {
        url.searchParams.delete('calc');
      }
      url.searchParams.set('page', page);
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'calculators':
        return (
          <CalculatorsPage
            key={selectedCalcId || 'none'}
            initialCalculatorId={selectedCalcId}
            onNavigate={handleNavigate}
            onSelectCalculator={(id) => {
              setSelectedCalcId(id);
              try {
                const url = new URL(window.location.href);
                url.searchParams.set('calc', id);
                window.history.pushState({}, '', url.toString());
              } catch {
                // ignore
              }
            }}
          />
        );
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'scenarios':
        return (
          <CalculatorsPage
            key="scenarios"
            initialCalculatorId="scenarios"
            onNavigate={handleNavigate}
          />
        );
      case 'goals':
        return (
          <CalculatorsPage
            key="financial-goals"
            initialCalculatorId="financial-goals"
            onNavigate={handleNavigate}
          />
        );
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} initialRole="user" />;
      case 'admin-login':
        return <LoginPage onNavigate={handleNavigate} initialRole="admin" />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      case 'saved':
        return <SavedCalculationsPage onNavigate={handleNavigate} />;
      case 'user':
        return <UserPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const isAuthPage = currentPage === 'login' || currentPage === 'admin-login';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      {/* Collapsible Sidebar - only rendered outside of auth/login pages */}
      {!isAuthPage && (
        <Sidebar
          currentPage={currentPage}
          activeCalcId={selectedCalcId}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Column with Dynamic Left Margin Offset */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isAuthPage ? 'ml-0' : isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <Navbar
          currentPage={currentPage}
          activeCalcId={selectedCalcId}
          onNavigate={handleNavigate}
          onToggleSidebarMobile={() => setMobileSidebarOpen((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={toggleSidebarCollapse}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {renderPage()}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
