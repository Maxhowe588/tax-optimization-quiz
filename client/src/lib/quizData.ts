// Quiz data definitions for the Canadian Tax Optimization Quiz — Advanced Version
// Design: Nordic Fintech — warm, trust-building, Scandinavian-inspired
// Structure: 4 progressive layers — Basic Info, Financial Snapshot, Detailed Breakdown, Advanced Optimization

export type QuestionType = 'input' | 'currency' | 'percentage' | 'select' | 'radio' | 'multi-select' | 'yes-no';

export interface ConditionalRule {
  questionId: string;
  value: string | string[];
  negate?: boolean; // if true, show when value does NOT match
}

export interface QuizQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  conditionalOn?: ConditionalRule;
  validation?: { min?: number; max?: number };
}

export interface QuizSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  layer: 1 | 2 | 3 | 4;
  layerLabel: string;
  questions: QuizQuestion[];
  conditionalOn?: ConditionalRule;
}

export const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
];

export const quizSections: QuizSection[] = [
  // ═══════════════════════════════════════════════
  // LAYER 1: BASIC INFO
  // ═══════════════════════════════════════════════
  {
    id: 'basic',
    title: 'Basic Information',
    subtitle: "Let's start with some basics about you",
    icon: 'User',
    layer: 1,
    layerLabel: 'Basic Info',
    questions: [
      { id: 'age', label: 'How old are you?', type: 'input', placeholder: 'Enter your age', validation: { min: 16, max: 120 } },
      { id: 'province', label: 'Which province or territory do you live in?', type: 'select', options: PROVINCES },
      { id: 'residency', label: 'What is your residency status?', type: 'radio', options: ['Full-year resident', 'Part-year resident', 'Non-resident'] },
      { id: 'maritalStatus', label: 'What is your marital status?', type: 'radio', options: ['Single', 'Married / common-law'] },
      { id: 'hasChildren', label: 'Do you have children?', type: 'yes-no' },
      { id: 'hasDependents', label: 'Do you have dependents?', type: 'yes-no' },
    ],
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    subtitle: 'Tell us about how you earn your income',
    icon: 'Briefcase',
    layer: 1,
    layerLabel: 'Basic Info',
    questions: [
      { id: 'employmentStatus', label: 'What is your employment status?', type: 'radio', options: ['Employee', 'Self-employed', 'Business owner', 'Contractor', 'Student / unemployed'] },
      { id: 'annualIncome', label: 'What is your annual gross income?', type: 'currency', placeholder: 'e.g. $85,000', validation: { min: 0, max: 10000000 } },
      { id: 'bonusIncome', label: 'Do you receive bonus income?', type: 'yes-no' },
      { id: 'bonusAmount', label: 'How much bonus income do you receive annually?', type: 'currency', placeholder: 'e.g. $10,000', conditionalOn: { questionId: 'bonusIncome', value: 'Yes' } },
      { id: 'incomeSources', label: 'What are your income sources?', type: 'multi-select', options: ['Salary', 'Business income', 'Dividends', 'Capital gains', 'Rental income'], helpText: 'Select all that apply' },
      { id: 'incomeIncrease', label: 'Do you expect your income to increase next year?', type: 'yes-no' },
      { id: 'incomeDecrease', label: 'Do you expect your income to decrease in the future?', type: 'yes-no' },
    ],
  },

  // ═══════════════════════════════════════════════
  // LAYER 2: FINANCIAL SNAPSHOT
  // ═══════════════════════════════════════════════
  {
    id: 'cashFlow',
    title: 'Cash Flow',
    subtitle: 'Your monthly income and spending',
    icon: 'Wallet',
    layer: 2,
    layerLabel: 'Financial Snapshot',
    questions: [
      { id: 'monthlyAfterTax', label: 'What is your monthly after-tax income?', type: 'currency', placeholder: 'e.g. $5,200', validation: { min: 0, max: 1000000 } },
      { id: 'monthlyExpenses', label: 'What are your total monthly expenses?', type: 'currency', placeholder: 'e.g. $3,500', helpText: 'Include rent, food, transport, subscriptions, etc.', validation: { min: 0, max: 1000000 } },
    ],
  },
  {
    id: 'cashHoldings',
    title: 'Cash Holdings',
    subtitle: 'How much cash do you have on hand?',
    icon: 'Banknote',
    layer: 2,
    layerLabel: 'Financial Snapshot',
    questions: [
      { id: 'chequingBalance', label: 'Chequing account balance', type: 'currency', placeholder: 'e.g. $3,000', validation: { min: 0, max: 100000000 } },
      { id: 'savingsBalance', label: 'Savings account balance', type: 'currency', placeholder: 'e.g. $15,000', validation: { min: 0, max: 100000000 } },
    ],
  },
  {
    id: 'accounts',
    title: 'Registered Accounts',
    subtitle: 'Your tax-sheltered accounts',
    icon: 'PiggyBank',
    layer: 2,
    layerLabel: 'Financial Snapshot',
    questions: [
      { id: 'hasTFSA', label: 'Do you have a TFSA?', type: 'yes-no' },
      { id: 'tfsaBalance', label: 'What is your current TFSA balance?', type: 'currency', placeholder: 'e.g. $45,000', conditionalOn: { questionId: 'hasTFSA', value: 'Yes' }, validation: { min: 0, max: 100000000 } },
      { id: 'tfsaMaxed', label: 'Is your TFSA contribution room maxed out?', type: 'yes-no', conditionalOn: { questionId: 'hasTFSA', value: 'Yes' } },
      { id: 'hasRRSP', label: 'Do you have an RRSP?', type: 'yes-no' },
      { id: 'rrspBalance', label: 'What is your current RRSP balance?', type: 'currency', placeholder: 'e.g. $60,000', conditionalOn: { questionId: 'hasRRSP', value: 'Yes' }, validation: { min: 0, max: 100000000 } },
      { id: 'rrspMaxed', label: 'Is your RRSP contribution room maxed out?', type: 'yes-no', conditionalOn: { questionId: 'hasRRSP', value: 'Yes' } },
      { id: 'hasFHSA', label: 'Do you have an FHSA?', type: 'yes-no' },
      { id: 'fhsaBalance', label: 'What is your FHSA balance?', type: 'currency', placeholder: 'e.g. $8,000', conditionalOn: { questionId: 'hasFHSA', value: 'Yes' }, validation: { min: 0, max: 40000 } },
      { id: 'hasRESP', label: 'Do you have an RESP?', type: 'yes-no' },
      { id: 'taxableBalance', label: 'Taxable investment account balance', type: 'currency', placeholder: 'e.g. $25,000', validation: { min: 0, max: 100000000 } },
    ],
  },

  // ═══════════════════════════════════════════════
  // LAYER 3: DETAILED BREAKDOWN
  // ═══════════════════════════════════════════════
  {
    id: 'investments',
    title: 'Investment Breakdown',
    subtitle: 'How your investments are allocated',
    icon: 'TrendingUp',
    layer: 3,
    layerLabel: 'Detailed Breakdown',
    questions: [
      { id: 'pctStocks', label: 'Percentage in stocks', type: 'percentage', placeholder: 'e.g. 40', helpText: 'All percentages should roughly add up to 100%', validation: { min: 0, max: 100 } },
      { id: 'pctDividends', label: 'Percentage in dividend stocks', type: 'percentage', placeholder: 'e.g. 20', validation: { min: 0, max: 100 } },
      { id: 'pctBonds', label: 'Percentage in bonds', type: 'percentage', placeholder: 'e.g. 25', validation: { min: 0, max: 100 } },
      { id: 'pctCrypto', label: 'Percentage in crypto', type: 'percentage', placeholder: 'e.g. 15', validation: { min: 0, max: 100 } },
      { id: 'growthInTFSA', label: 'Are your highest-growth investments held in your TFSA?', type: 'yes-no' },
      { id: 'investorType', label: 'Are you an active or passive investor?', type: 'radio', options: ['Active', 'Passive'] },
    ],
  },
  {
    id: 'debt',
    title: 'Debt',
    subtitle: 'Outstanding debts and interest rates',
    icon: 'CreditCard',
    layer: 3,
    layerLabel: 'Detailed Breakdown',
    questions: [
      { id: 'creditCardBalance', label: 'Credit card balance', type: 'currency', placeholder: 'e.g. $3,500', validation: { min: 0, max: 10000000 } },
      { id: 'creditCardRate', label: 'Credit card interest rate (%)', type: 'percentage', placeholder: 'e.g. 19.99', conditionalOn: { questionId: 'creditCardBalance', value: '0', negate: true }, validation: { min: 0, max: 100 } },
      { id: 'studentLoanBalance', label: 'Student loan balance', type: 'currency', placeholder: 'e.g. $20,000', validation: { min: 0, max: 10000000 } },
      { id: 'studentLoanRate', label: 'Student loan interest rate (%)', type: 'percentage', placeholder: 'e.g. 5.5', conditionalOn: { questionId: 'studentLoanBalance', value: '0', negate: true }, validation: { min: 0, max: 100 } },
      { id: 'mortgageBalance', label: 'Mortgage balance', type: 'currency', placeholder: 'e.g. $350,000', validation: { min: 0, max: 100000000 } },
      { id: 'mortgageRate', label: 'Mortgage interest rate (%)', type: 'percentage', placeholder: 'e.g. 4.5', conditionalOn: { questionId: 'mortgageBalance', value: '0', negate: true }, validation: { min: 0, max: 100 } },
    ],
  },
  {
    id: 'housing',
    title: 'Housing',
    subtitle: 'Your living situation',
    icon: 'Home',
    layer: 3,
    layerLabel: 'Detailed Breakdown',
    questions: [
      { id: 'ownHome', label: 'Do you own a home?', type: 'yes-no' },
      { id: 'homeValue', label: 'Estimated home value', type: 'currency', placeholder: 'e.g. $550,000', conditionalOn: { questionId: 'ownHome', value: 'Yes' }, validation: { min: 0, max: 100000000 } },
      { id: 'primaryResidence', label: 'Is it your primary residence?', type: 'yes-no', conditionalOn: { questionId: 'ownHome', value: 'Yes' } },
      { id: 'ownRental', label: 'Do you own a rental property?', type: 'yes-no' },
      { id: 'rentalValue', label: 'Estimated rental property value', type: 'currency', placeholder: 'e.g. $400,000', conditionalOn: { questionId: 'ownRental', value: 'Yes' }, validation: { min: 0, max: 100000000 } },
      { id: 'planBuyHome', label: 'Are you planning to buy a home in the next 5 years?', type: 'yes-no' },
    ],
  },
  {
    id: 'expenses',
    title: 'Deductible Expenses',
    subtitle: 'Expenses that can reduce your tax bill',
    icon: 'Receipt',
    layer: 3,
    layerLabel: 'Detailed Breakdown',
    questions: [
      { id: 'workFromHome', label: 'Do you work from home?', type: 'yes-no' },
      { id: 'payWorkExpenses', label: 'Do you pay for work-related expenses out of pocket?', type: 'yes-no' },
      { id: 'movedForWork', label: 'Did you move for work or school this year?', type: 'yes-no' },
      { id: 'paidChildcare', label: 'Did you pay for childcare?', type: 'yes-no', conditionalOn: { questionId: 'hasChildren', value: 'Yes' } },
      { id: 'childcareAmount', label: 'How much did you spend on childcare?', type: 'currency', placeholder: 'e.g. $12,000', conditionalOn: { questionId: 'paidChildcare', value: 'Yes' }, validation: { min: 0, max: 100000 } },
    ],
  },

  // ═══════════════════════════════════════════════
  // LAYER 4: ADVANCED OPTIMIZATION
  // ═══════════════════════════════════════════════
  {
    id: 'selfEmployed',
    title: 'Self-Employment',
    subtitle: 'Additional deductions for business owners',
    icon: 'Building2',
    layer: 4,
    layerLabel: 'Advanced Optimization',
    conditionalOn: { questionId: 'employmentStatus', value: ['Self-employed', 'Business owner', 'Contractor'] },
    questions: [
      { id: 'vehicleForWork', label: 'Do you use a vehicle for work?', type: 'yes-no' },
      { id: 'businessTravel', label: 'Do you have business travel or meal expenses?', type: 'yes-no' },
      { id: 'toolsSoftware', label: 'Do you pay for tools or software for your business?', type: 'yes-no' },
      { id: 'payFamilyMembers', label: 'Do you pay family members for work in your business?', type: 'yes-no' },
    ],
  },
  {
    id: 'family',
    title: 'Family & Partner',
    subtitle: 'Income splitting and family tax strategies',
    icon: 'Users',
    layer: 4,
    layerLabel: 'Advanced Optimization',
    conditionalOn: { questionId: 'maritalStatus', value: 'Married / common-law' },
    questions: [
      { id: 'partnerIncome', label: "What is your partner's annual gross income?", type: 'currency', placeholder: 'e.g. $45,000', validation: { min: 0, max: 10000000 } },
      { id: 'shareIncomeWithPartner', label: 'Do you share income or assets with your partner?', type: 'yes-no' },
    ],
  },
  {
    id: 'taxCredits',
    title: 'Tax Credits',
    subtitle: 'Credits that can lower what you owe',
    icon: 'BadgePercent',
    layer: 4,
    layerLabel: 'Advanced Optimization',
    questions: [
      { id: 'charitableDonations', label: 'Did you make charitable donations this year?', type: 'yes-no' },
      { id: 'donationAmount', label: 'How much did you donate?', type: 'currency', placeholder: 'e.g. $2,000', conditionalOn: { questionId: 'charitableDonations', value: 'Yes' }, validation: { min: 0, max: 10000000 } },
      { id: 'medicalExpenses', label: 'Did you have significant medical expenses?', type: 'yes-no' },
      { id: 'medicalAmount', label: 'How much in medical expenses?', type: 'currency', placeholder: 'e.g. $3,500', conditionalOn: { questionId: 'medicalExpenses', value: 'Yes' }, validation: { min: 0, max: 10000000 } },
      { id: 'supportDependent', label: 'Do you support an elderly or disabled dependent?', type: 'yes-no' },
    ],
  },
  {
    id: 'investmentActivity',
    title: 'Investment Activity',
    subtitle: 'Your investment activity this year',
    icon: 'BarChart3',
    layer: 4,
    layerLabel: 'Advanced Optimization',
    questions: [
      { id: 'soldInvestments', label: 'Did you sell any investments this year?', type: 'yes-no' },
      { id: 'capitalGainsAmount', label: 'Total capital gains realized', type: 'currency', placeholder: 'e.g. $5,000', conditionalOn: { questionId: 'soldInvestments', value: 'Yes' }, validation: { min: 0, max: 100000000 } },
      { id: 'holdAtLoss', label: 'Do you currently hold investments at a loss?', type: 'yes-no' },
      { id: 'unrealizedLoss', label: 'Estimated unrealized loss amount', type: 'currency', placeholder: 'e.g. $3,000', conditionalOn: { questionId: 'holdAtLoss', value: 'Yes' }, validation: { min: 0, max: 100000000 } },
      { id: 'planToSell', label: 'Do you plan to sell investments soon?', type: 'yes-no' },
    ],
  },
  {
    id: 'timing',
    title: 'Timing & Goals',
    subtitle: 'Your preferences and financial goals',
    icon: 'Target',
    layer: 4,
    layerLabel: 'Advanced Optimization',
    questions: [
      { id: 'rrspTiming', label: 'When do you typically contribute to your RRSP?', type: 'radio', options: ['Before tax season', 'After tax season'], conditionalOn: { questionId: 'hasRRSP', value: 'Yes' } },
      { id: 'taxPreference', label: 'What is your preference?', type: 'radio', options: ['Reduce taxes now', 'Reduce taxes long-term'] },
      { id: 'hasPension', label: 'Do you have a pension?', type: 'yes-no' },
      { id: 'retirementIncome', label: 'What do you expect your retirement income to be compared to now?', type: 'radio', options: ['Lower', 'Similar', 'Higher'] },
      { id: 'primaryGoal', label: 'What is your primary financial goal?', type: 'radio', options: ['Reduce taxes now', 'Build wealth', 'Save for a home', 'Retire early'] },
    ],
  },
];

export type QuizAnswers = Record<string, string | string[]>;
