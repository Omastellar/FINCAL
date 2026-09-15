# Finance Calculator 📈

A modern, responsive fintech web application built with **React**, **TypeScript**, and **Tailwind CSS**. Finance Calculator provides mathematically precise financial modeling tools, dynamic data visualization (Recharts), multi-currency formatting (defaulting to **NGN ₦**), seamless dark/light mode, and plain-English financial insights.

![Finance Calculator](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/calculator.svg)

---

## 🌟 Features

### 6 Specialized Financial Calculators
1. **Loan Calculator**
   - Monthly, bi-weekly, and weekly payment calculations
   - Complete amortization schedule (both annual and periodic breakdown)
   - **Prepayment Simulator**: Extra periodic principal payments & one-time lump sums
   - Calculates exact **interest saved** and **years eliminated** from loans
   - Principal vs. Interest donut chart
   - Export amortization schedule to CSV & executive Print/PDF view

2. **Savings Calculator**
   - Project wealth accumulation from starting deposit and monthly additions
   - Compounding frequency options (Monthly, Quarterly, Annually)
   - **Inflation Adjustment Engine**: Toggle real purchasing power vs. nominal future value
   - Interactive cumulative growth area chart with inflation overlay

3. **Compound Interest Calculator**
   - Demonstrates the exponential power of compound interest
   - Support for daily, monthly, quarterly, and annual compounding schedules
   - **Inflation Adjustment**: Real purchasing power discounting
   - Split view of Principal vs. Contributions vs. Interest

4. **Investment Calculator**
   - Capital growth forecasts based on expected annual market returns
   - Real purchasing power inflation adjustments
   - Transparent regulatory disclaimer: projections are estimates and never guaranteed
   - Portfolio growth trajectory visualization

5. **Debt Payoff Calculator**
   - Compare standard debt payoff vs. accelerated extra monthly payment strategies
   - Calculates exact **interest saved** and **time shaved off debt**
   - Comparative debt reduction timeline chart
   - Validation warning if payments fail to cover monthly interest

6. **Budget Calculator**
   - Track multiple income streams (Salary, Other income)
   - Detailed expense allocation (Housing, Food, Transportation, Utilities, Debt, Entertainment, Misc)
   - Monthly surplus/deficit calculation & savings rate
   - 50/30/20 guideline benchmark analyzer with visual progress indicators
   - Expense breakdown donut chart & monthly cash-flow comparison bar chart

### 🔗 Deep-Linking & Shareable URLs
- Share calculation scenarios via URL query parameters
- 1-click **Share Scenario** button with instant clipboard copy and toast notifications
- Print & PDF-ready stylesheets for client-ready reports

### ⚙️ Automated CI/CD
- GitHub Actions pipeline runs Vitest unit tests and builds on every push and PR to `main`

---

## 💱 Multi-Currency Support

- **Default Currency**: **Nigerian Naira (NGN ₦)**
- **Supported Currencies**:
  - 🇳🇬 **NGN** (`₦`) – Nigerian Naira (Default)
  - 🇺🇸 **USD** (`$`) – US Dollar
  - 🇬🇧 **GBP** (`£`) – British Pound
  - 🇪🇺 **EUR** (`€`) – Euro
- Instantly switch currencies anytime from the navigation bar. All figures, charts, and input fields update dynamically.

---

## 🌓 Modern Fintech Dashboard & Design

- **Dark & Light Mode**: Toggle anytime; preferences are persisted in `localStorage`.
- **Hero Section**:
  - Title: *"Make Better Financial Decisions"*
  - Subtitle: *"Simple, accurate calculators to help you understand loans, savings, investments, debt and your everyday finances."*
  - *"Explore Calculators"* primary call to action.
- **Plain-English Financial Insights**: Every calculation produces concise, human-readable explanations summarizing key financial takeaways and recommendations.
- **Fully Responsive**: Optimized for mobile smartphones, tablets, laptops, and ultra-wide desktop monitors.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (with custom brand tokens & dark mode class strategy)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Testing**: Vitest unit test suite verifying mathematical accuracy and edge cases

### Clean Directory Structure
```
finance calculator/
├── src/
│   ├── components/
│   │   ├── charts/       # DonutChart, GrowthAreaChart, ComparisonBarChart
│   │   └── common/       # Navbar, Footer, MetricCard, InputField, SliderField, InsightBanner, Card
│   ├── calculators/      # Loan, Savings, CompoundInterest, Investment, DebtPayoff, Budget
│   ├── context/          # CurrencyContext, ThemeContext
│   ├── data/             # CalculatorMetadata & presets
│   ├── pages/            # HomePage, CalculatorsPage, AboutPage
│   ├── types/            # TypeScript interfaces for calculators & currencies
│   ├── utils/
│   │   ├── financialMath.ts # Pure mathematical functions (separated from UI)
│   │   ├── formatters.ts    # Currency, number, and duration formatting
│   │   ├── exportUtils.ts   # CSV export utilities
│   │   └── __tests__/       # Vitest unit tests (24 tests)
│   ├── App.tsx           # Main application shell & router
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind & base styling
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended, tested on Node v22)
- npm or yarn

### Installation
```bash
# Clone or navigate into the project directory
cd "finance calculator"

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:4000](http://localhost:4000) in your browser (configured on dedicated port `4000` to prevent port collisions).

### Run Automated Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```
The compiled, production-ready assets will be located in the `dist/` folder.

---

## 🔒 Accuracy & Edge Case Handling

- **0% Interest Handling**: Correctly calculates zero-interest loan amortization, savings, and investments without dividing by zero.
- **Negative Amortization Safeguards**: Warns the user immediately if monthly payments are lower than accruing monthly interest charges.
- **Input Sanitization**: Gracefully guards against negative values, non-numeric entries, and extremes.
- **Client-Side Privacy**: 100% of calculations run locally in the browser with no tracking or data transmission.
