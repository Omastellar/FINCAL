# FINCAL: Comprehensive Test Cases & Acceptance Criteria Specification

**Document Version:** 2.0  
**Application:** FINCAL (Financial Calculator Precision Suite)  
**Repository:** `Omastellar/FINCAL`  
**Test Suite Status:** 57 / 57 Automated Tests Passing (`npm test`)  
**Production Build:** Clean (`npm run build`)  
**Date:** September 2026  

---

## 1. Executive Summary & Quality Scope

FINCAL is a financial intelligence and computation suite featuring client-side financial engines, dynamic currency conversion, role-based authentication, customizable platform settings, and an ergonomic responsive UI.

This document defines the formal **Acceptance Criteria (AC)** using the industry-standard **Given / When / Then (Gherkin)** format, alongside the complete **Test Cases (TC)** matrix verifying functional accuracy, boundary resilience, UI responsiveness, and data cleanliness.

---

## 2. Mock Data Cleanup Summary

Prior to this quality baseline, several components relied on static, hardcoded dummy records:
1. **User Directory (`AdminPage.tsx`)**: Static mock users array replaced with dynamic retrieval from `localStorage` (`fincal_registered_users`), combining real registered accounts with standard roles.
2. **Audit Logs (`AuthContext.tsx`)**: Hardcoded past date strings replaced with clean, real-time dynamic ISO timestamps upon initialization.
3. **Active Calculator State (`App.tsx` & `CalculatorsPage.tsx`)**: Hardcoded `'loan'` fallback removed. The app now initializes with clean `null` state, loading calculator modules exclusively upon explicit user selection.
4. **Mathematical Engines**: All 11 engines compute deterministically on client-side mathematics without mock API delays or external mock dependencies.

---

## 3. Acceptance Criteria (Gherkin Specifications)

### AC-01: Selective On-Demand Calculator Display
- **Given** a user navigates to the Calculators hub (`/` or `?page=calculators` without `?calc=`)
- **When** the page loads
- **Then** none of the calculators (Loan, Savings, Compound, Investment, Debt Payoff, Budget, Currency) shall render by default
- **And** the category selector (`ALL`, `BORROWING`, `GROWTH`, `PLANNING`) and the 7 calculator cards shall remain fully visible
- **And** an inviting placeholder (`"Choose a Calculator to Get Started"`) shall be displayed below the cards
- **When** the user clicks any calculator from the cards or sidebar
- **Then** that calculator module shall immediately render with full input forms, calculations, and charts.

### AC-02: Collapsible Categories (`ALL`, `BORROWING`, `GROWTH`, `PLANNING`)
- **Given** the user is viewing the Calculators page
- **When** the user clicks the currently active category pill (`All`, `Borrowing`, `Growth`, or `Planning`)
- **Then** the grid of calculator cards for that category shall collapse neatly
- **And** the category pill shall display an indicator chevron down (`ChevronDown`)
- **And** a compact summary bar shall indicate the number of hidden tools with a 1-click `"Show Calculators"` expand action
- **When** the user clicks the category pill again or clicks the header `"Collapse / Expand"` button
- **Then** the calculator card grid shall expand back to its full view.

### AC-03: Amount Box Sizing & Zero-Overflow Guarantee
- **Given** any metric card (`MetricCard`), slider input (`SliderField`), or currency quotation box
- **When** displaying currency amounts in any currency (`NGN`, `USD`, `GBP`, `EUR`) ranging from `₦10.00` to `₦100,000,000,000.00`
- **Then** the text font size shall dynamically scale down as character length increases:
  - `≤ 9` characters: `text-2xl sm:text-3xl`
  - `10-12` characters: `text-xl sm:text-2xl md:text-[1.65rem]`
  - `13-16` characters: `text-lg sm:text-xl md:text-2xl`
  - `17-22` characters: `text-base sm:text-lg md:text-xl`
  - `> 22` characters: `text-sm sm:text-base md:text-lg`
- **And** the amount shall fit inside the box without overflowing borders, getting cut off, being hidden, or overlapping adjacent labels or values.

### AC-04: Slider Field & Input Box Resilience
- **Given** an amount slider input box in any calculator
- **When** a user enters or adjusts an amount up to `100,000,000`
- **Then** the input width (`w-32 sm:w-36`) shall accommodate all digits
- **And** browser spinner arrows shall be eliminated (`[appearance:textfield]`)
- **And** currency prefixes (`₦`, `$`) and suffixes (`%`, `yr`) shall never collide with or overlap numbers.

### AC-05: Loan Repayment & Accelerated Prepayment Engine
- **Given** a loan principal, annual interest rate, term in years, and payment frequency (`monthly`, `bi-weekly`, `weekly`)
- **When** periodic repayments are computed
- **Then** the payment must satisfy \( M = P \frac{r(1+r)^n}{(1+r)^n - 1} \)
- **And** the total repayment must equal \( M \times n \)
- **And** remaining balance at period \( n \) must be `0`
- **When** an extra periodic payment or lump-sum payment is simulated
- **Then** total interest saved and years saved must be calculated accurately.

### AC-06: Savings Growth & Real Purchasing Power Engine
- **Given** initial deposit, monthly contribution, annual rate, duration, and inflation rate
- **When** real purchasing power adjustment is toggled
- **Then** future balance must be discounted by \( \frac{\text{Nominal Balance}}{(1 + i)^t} \).

### AC-07: Compound Interest & Multi-Frequency Engine
- **Given** principal, rate, duration, and compounding frequency (`daily`, `monthly`, `quarterly`, `annually`)
- **When** compound growth is computed
- **Then** balance must satisfy \( A = P \left(1 + \frac{r}{k}\right)^{kt} \).

### AC-08: Investment Portfolio & Return Projections
- **Given** initial capital, ongoing contributions, expected annual ROI, and investment horizon
- **When** future wealth is calculated
- **Then** return breakdown must isolate total principal invested vs total investment return.

### AC-09: Debt Payoff Accelerator
- **Given** current total debt balance, interest rate, and monthly payment
- **When** monthly payment does not cover monthly interest charge
- **Then** a prominent negative amortization warning must display
- **When** additional monthly payments are added
- **Then** total interest saved and accelerated payoff time must be calculated.

### AC-10: 50 / 30 / 20 Budgeting Benchmark
- **Given** income sources and categorized expenses (Needs, Wants, Savings)
- **When** budget totals are calculated
- **Then** actual percentage allocations against 50% Needs, 30% Wants, and 20% Savings must be displayed without text overlapping.

### AC-11: Multi-Currency Spot FX Engine
- **Given** 13 global and African currencies
- **When** an amount is converted between any currency pair
- **Then** net converted amount must reflect direct/cross exchange rates minus any specified transfer spread fee.

### AC-12: Collapsible Desktop & Off-Canvas Mobile Sidebar
- **Given** desktop viewport (`≥ 768px`)
- **When** collapse button is clicked (or `Ctrl+B`)
- **Then** sidebar width shall toggle smoothly between `w-64` (full labels) and `w-20` (icon-only with floating tooltips)
- **And** the state shall persist in `localStorage`.

### AC-13: Authentication & Role Gate
- **Given** an unauthenticated user attempting to access the Administrative Portal (`/admin`)
- **Then** a security lock gate shall prevent access until logged in as an `admin`.

### AC-14: Saved Calculations Library
- **Given** an authenticated user
- **When** calculating any financial plan and clicking `"Save Calculation"`
- **Then** the calculation shall be stored in `localStorage` under `fincal_saved_calculations`
- **And** the user can view, delete, or export their calculations as a formatted JSON document.

---

## 4. Comprehensive Test Cases Matrix

| Test ID | Module / Area | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-LOAN-001** | Loan Engine | Standard 1-yr monthly loan repayment | Monthly: ₦88,848.79, Total Interest: ₦66,185.47, Final Balance: 0 | ✅ Pass (Vitest) |
| **TC-LOAN-002** | Loan Engine | 0% interest loan zero-division prevention | Monthly: ₦10,000.00, Total Interest: ₦0.00, Final Balance: 0 | ✅ Pass (Vitest) |
| **TC-LOAN-003** | Loan Engine | Bi-weekly repayment schedule (26 periods) | 26 periods generated, bi-weekly payment: ₦20,245.26 | ✅ Pass (Vitest) |
| **TC-LOAN-004** | Loan Engine | Weekly repayment schedule (52 periods) | 52 periods generated, weekly payment: ₦10,113.40 | ✅ Pass (Vitest) |
| **TC-LOAN-005** | Loan Engine | Extra monthly principal prepayment | Total interest reduced, duration shortened | ✅ Pass (Vitest) |
| **TC-LOAN-006** | Loan Engine | Lump-sum prepayment in specific year | Lump sum applied to balance, interest saved computed | ✅ Pass (Vitest) |
| **TC-SAV-001** | Savings Engine | Regular savings without ongoing deposits | Simple compounding balance computed accurately | ✅ Pass (Vitest) |
| **TC-SAV-002** | Savings Engine | Regular savings with monthly deposit | Future balance includes deposits plus compounding | ✅ Pass (Vitest) |
| **TC-SAV-003** | Savings Engine | Real purchasing power inflation discount | Nominal balance discounted by inflation rate | ✅ Pass (Vitest) |
| **TC-SAV-004** | Savings Engine | Negative purchasing power warning | Purchasing power correctly identified as lower than principal | ✅ Pass (Vitest) |
| **TC-CMP-001** | Compound Engine | Daily compounding frequency (365/yr) | Accurate compound balance using daily compounding | ✅ Pass (Vitest) |
| **TC-CMP-002** | Compound Engine | Quarterly compounding frequency (4/yr) | Accurate quarterly compounding return | ✅ Pass (Vitest) |
| **TC-CMP-003** | Compound Engine | Annual compounding frequency (1/yr) | Accurate annual compounding return | ✅ Pass (Vitest) |
| **TC-INV-001** | Investment Engine | Standard investment portfolio growth | Principal and return gains isolated and balanced | ✅ Pass (Vitest) |
| **TC-INV-002** | Investment Engine | 0% return portfolio | Future value equals exact sum of contributions | ✅ Pass (Vitest) |
| **TC-DEBT-001** | Debt Payoff | Debt payoff without extra payment | Standard payoff schedule and duration computed | ✅ Pass (Vitest) |
| **TC-DEBT-002** | Debt Payoff | Accelerated debt payoff with extra payment | Months saved > 0, interest saved > 0 | ✅ Pass (Vitest) |
| **TC-DEBT-003** | Debt Payoff | Negative amortization detection | `isNegativeAmortization: true` when payment < monthly interest | ✅ Pass (Vitest) |
| **TC-BUD-001** | Budget Engine | Balanced 50/30/20 budget allocations | Needs = 50%, Wants = 30%, Savings = 20%, Surplus >= 0 | ✅ Pass (Vitest) |
| **TC-BUD-002** | Budget Engine | Budget deficit detection | Negative remaining balance identified and flagged | ✅ Pass (Vitest) |
| **TC-FX-001** | Currency Engine | USD to NGN spot conversion | Converted amount equals amount * spot rate | ✅ Pass (Vitest) |
| **TC-FX-002** | Currency Engine | Inverse cross-rate symmetry | Rate * inverse rate ≈ 1.000 | ✅ Pass (Vitest) |
| **TC-FX-003** | Currency Engine | Transfer spread fee deduction | Net received equals gross converted minus spread fee | ✅ Pass (Vitest) |
| **TC-FX-004** | Currency Engine | Multi-currency comparison matrix | 13 currencies evaluated cleanly without NaN | ✅ Pass (Vitest) |
| **TC-FMT-001** | Formatters | NGN currency format with symbol | Output formatted with `₦` and comma grouping | ✅ Pass (Vitest) |
| **TC-FMT-002** | Formatters | USD currency format with symbol | Output formatted with `$` and decimal places | ✅ Pass (Vitest) |
| **TC-FMT-003** | Formatters | GBP currency format with symbol | Output formatted with `£` and decimal places | ✅ Pass (Vitest) |
| **TC-FMT-004** | Formatters | EUR currency format with symbol | Output formatted with `€` and decimal places | ✅ Pass (Vitest) |
| **TC-FMT-005** | Formatters | Compact currency formatting | `₦2,500,000` -> `₦2.5M`, `1.8B` -> `$1.8B` | ✅ Pass (Vitest) |
| **TC-AUTH-001** | Auth Engine | Administrator profile verification | Admin email, role `'admin'`, and permissions verified | ✅ Pass (Vitest) |
| **TC-AUTH-002** | Auth Engine | Standard user profile verification | User email, role `'user'`, and permissions verified | ✅ Pass (Vitest) |
| **TC-AUTH-003** | Auth Engine | Role separation enforcement | Admin role !== User role | ✅ Pass (Vitest) |
| **TC-AUTH-004** | Auth Engine | Saved calculation serialization | Saved calculation correctly serializes and parses | ✅ Pass (Vitest) |
| **TC-AUTH-005** | Auth Engine | Platform settings constraint check | Default settings hold valid positive numbers | ✅ Pass (Vitest) |
| **TC-CAT-001** | Categories | "All" category returns all 7 tools | Returns 7 calculators in metadata array | ✅ Pass (Vitest) |
| **TC-CAT-002** | Categories | "Borrowing" category filter | Returns Loan and Debt Payoff tools | ✅ Pass (Vitest) |
| **TC-CAT-003** | Categories | "Growth" category filter | Returns Savings, Compound Interest, Investment | ✅ Pass (Vitest) |
| **TC-CAT-004** | Categories | "Planning" category filter | Returns Budget and Currency Converter | ✅ Pass (Vitest) |
| **TC-NAV-001** | Navigation | On-demand display: no default calc | URL without `?calc=` returns null active calculator | ✅ Pass (Vitest) |
| **TC-NAV-002** | Navigation | Valid URL parameter parsing | Parses `?calc=loan`, `?calc=currency-converter`, etc. | ✅ Pass (Vitest) |
| **TC-NAV-003** | Navigation | Unknown query parameter rejection | Discards unknown calculator identifiers safely | ✅ Pass (Vitest) |
| **TC-BOX-001** | Amount Sizing | Dynamic font scaling for short amounts | `<= 9` chars -> `text-2xl sm:text-3xl` | ✅ Pass (Vitest) |
| **TC-BOX-002** | Amount Sizing | Dynamic font scaling for 10-12 char amounts | `10-12` chars -> `text-xl sm:text-2xl md:text-[1.65rem]` | ✅ Pass (Vitest) |
| **TC-BOX-003** | Amount Sizing | Dynamic font scaling for 13-16 char amounts | `13-16` chars -> `text-lg sm:text-xl md:text-2xl` | ✅ Pass (Vitest) |
| **TC-BOX-004** | Amount Sizing | Dynamic font scaling for 17-22 char amounts | `17-22` chars -> `text-base sm:text-lg md:text-xl` | ✅ Pass (Vitest) |
| **TC-BOX-005** | Amount Sizing | Dynamic font scaling for extreme (>22) amounts | `> 22` chars -> `text-sm sm:text-base md:text-lg` | ✅ Pass (Vitest) |
| **TC-COL-001** | Collapsible | Category button click toggles collapse | Clicking active tab collapses, clicking again expands | ✅ Pass (Vitest) |
| **TC-COL-002** | Collapsible | Switching category auto-expands | Clicking different category switches and opens view | ✅ Pass (Vitest) |

---

## 5. Verification Commands

To re-run and verify the test cases and production build:

```bash
# Execute automated test suite (57 tests)
npm test

# Verify production build & TypeScript validation
npm run build
```
