# Revision TODO

## Phase 2: Quiz Data Rewrite
- [ ] Replace range-based income questions with exact dollar inputs (formatted currency)
- [ ] Add Cash Flow section: monthly after-tax income, monthly expenses
- [ ] Add Cash Holdings section: chequing balance, savings balance
- [ ] Add Investment balances: TFSA, RRSP, FHSA, taxable account
- [ ] Add Investment breakdown: % stocks, % dividends, % bonds, % crypto
- [ ] Add Debt section: credit card balance+rate, student loans+rate, mortgage balance+rate
- [ ] Implement strict conditional logic (no RRSP → skip RRSP timing, no children → skip childcare, etc.)
- [ ] Structure quiz in 4 progressive layers: Basic Info, Financial Snapshot, Detailed Breakdown, Advanced Optimization

## Phase 3: Calculation Engine Rewrite
- [ ] Implement marginal tax rate brackets (<$50k→20%, $50k-$100k→30%, $100k-$150k→38%, $150k+→45%)
- [ ] Calculate net worth (assets - liabilities)
- [ ] Calculate cash flow analysis (income vs expenses, savings rate)
- [ ] Calculate estimated annual tax paid and effective tax rate
- [ ] Calculate optimized tax scenario
- [ ] Calculate missed opportunities in dollar terms (unused RRSP room, TFSA growth, poor asset location, missed deductions)
- [ ] Calculate Tax Efficiency Score (0-100)
- [ ] Build reallocation engine (suggest moves from savings→TFSA, allocate to RRSP, keep emergency fund)
- [ ] Each strategy: estimated $/year savings with "See the Math" data

## Phase 4: UI Components Update
- [ ] Add currency input component with formatting ($12,500)
- [ ] Add percentage input component
- [ ] Update QuestionCard for new input types (currency, percentage)
- [ ] Update QuizContext for new data structure
- [ ] Update conditional question visibility

## Phase 5: Results Dashboard
- [ ] Section 1: Net Worth Breakdown with pie chart (cash vs investments vs property) and bar chart (assets vs debt)
- [ ] Section 2: Cash Flow Analysis with monthly inflow vs outflow chart
- [ ] Section 3: Tax Analysis with current vs optimized tax chart
- [ ] Section 4: Missed Opportunities headline with calculated $ amount
- [ ] Section 5: Tax Efficiency Score (0-100) with visual gauge
- [ ] Section 6: Strategy Recommendations (Top 3, Additional, Advanced) with $/year savings
- [ ] Section 7: "See the Math" toggles showing inputs, assumed tax rate, formula
- [ ] Add disclaimer: "Estimates based on an assumed marginal tax rate of X%"
