import React, { useState } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { SavedCalculationsPage } from './pages/SavedCalculationsPage';
import { PageView } from './types/navigation';
import { CalculatorId } from './types/calculators';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      if (search.get('calc')) return 'calculators';
      const page = search.get('page') as PageView;
      if (page && ['home', 'calculators', 'about', 'login', 'admin', 'saved'].includes(page)) {
        return page;
      }
    } catch {
      // ignore
    }
    return 'home';
  });
  const [selectedCalcId, setSelectedCalcId] = useState<CalculatorId>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const calc = search.get('calc') as CalculatorId;
      if (calc) return calc;
    } catch {
      // ignore
    }
    return 'loan';
  });

  const handleNavigate = (page: PageView, calcId?: CalculatorId) => {
    setCurrentPage(page);
    if (calcId) {
      setSelectedCalcId(calcId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'calculators':
        return <CalculatorsPage initialCalculatorId={selectedCalcId} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      case 'saved':
        return <SavedCalculationsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      {/* Header / Navbar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
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
