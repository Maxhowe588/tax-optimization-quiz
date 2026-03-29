// Quiz data definitions for the Canadian Tax Optimization Quiz
// Design: Nordic Fintech — warm, trust-building, Scandinavian-inspired

export type QuestionType = 'input' | 'select' | 'radio' | 'multi-select' | 'yes-no';

export interface QuizQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  conditionalOn?: { questionId: string; value: string | string[] };
}

export interface QuizSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  questions: QuizQuestion[];
}

export const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
];

export const quizSections: QuizSection[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    subtitle: 'Let\'s start with some basics about you',
    icon: 'User',
    questions: [
      {
        id: 'age',
        label: 'How old are you?',
        type: 'input',
        placeholder: 'Enter your age',
      },
      {
        id: 'province',
        label: 'Which province or territory do you live in?',
        type: 'select',
        options: PROVINCES,
      },
      {
        id: 'residency',
        label: 'What is your residency status?',
        type: 'radio',
        options: ['Full-year resident', 'Part-year resident', 'Non-resident'],
      },
    ],
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    subtitle: 'Tell us about how you earn your income',
    icon: 'Briefcase',
    questions: [
      {
        id: 'employmentStatus',
        label: 'What is your employment status?',
        type: 'radio',
        options: ['Employee', 'Self-employed', 'Business owner', 'Contractor', 'Student / unemployed'],
      },
      {
        id: 'annualIncome',
        label: 'What is your annual income?',
        type: 'radio',
        options: ['Under $50,000', '$50,000 – $100,000', '$100,000 – $150,000', 'Over $150,000'],
      },
      {
        id: 'bonusIncome',
        label: 'Do you receive bonus income?',
        type: 'yes-no',
      },
      {
        id: 'incomeSources',
        label: 'What are your income sources?',
        type: 'multi-select',
        options: ['Salary', 'Business income', 'Dividends', 'Capital gains', 'Rental income'],
        helpText: 'Select all that apply',
      },
      {
        id: 'incomeIncrease',
        label: 'Do you expect your income to increase next year?',
        type: 'yes-no',
      },
      {
        id: 'incomeDecrease',
        label: 'Do you expect your income to decrease in the future?',
        type: 'yes-no',
      },
    ],
  },
  {
    id: 'savings',
    title: 'Savings & Accounts',
    subtitle: 'Let\'s look at your registered accounts',
    icon: 'PiggyBank',
    questions: [
      {
        id: 'hasTFSA',
        label: 'Do you have a TFSA (Tax-Free Savings Account)?',
        type: 'yes-no',
      },
      {
        id: 'hasRRSP',
        label: 'Do you have an RRSP (Registered Retirement Savings Plan)?',
        type: 'yes-no',
      },
      {
        id: 'hasFHSA',
        label: 'Do you have an FHSA (First Home Savings Account)?',
        type: 'yes-no',
      },
      {
        id: 'hasRESP',
        label: 'Do you have an RESP (Registered Education Savings Plan)?',
        type: 'yes-no',
      },
      {
        id: 'tfsaMaxed',
        label: 'Is your TFSA contribution room maxed out?',
        type: 'yes-no',
      },
      {
        id: 'rrspMaxed',
        label: 'Is your RRSP contribution room maxed out?',
        type: 'yes-no',
      },
      {
        id: 'investmentAccounts',
        label: 'Where are your investments held?',
        type: 'multi-select',
        options: ['TFSA', 'RRSP', 'Taxable account'],
        helpText: 'Select all that apply',
      },
      {
        id: 'investmentTypes',
        label: 'What types of investments do you hold?',
        type: 'multi-select',
        options: ['Growth stocks', 'Dividend stocks', 'ETFs', 'Bonds', 'Crypto'],
        helpText: 'Select all that apply',
      },
      {
        id: 'growthInTFSA',
        label: 'Are your highest-growth investments held in your TFSA?',
        type: 'yes-no',
      },
    ],
  },
  {
    id: 'housing',
    title: 'Housing',
    subtitle: 'Tell us about your living situation',
    icon: 'Home',
    questions: [
      {
        id: 'ownHome',
        label: 'Do you own a home?',
        type: 'yes-no',
      },
      {
        id: 'primaryResidence',
        label: 'Is it your primary residence?',
        type: 'yes-no',
        conditionalOn: { questionId: 'ownHome', value: 'Yes' },
      },
      {
        id: 'ownRental',
        label: 'Do you own a rental property?',
        type: 'yes-no',
      },
      {
        id: 'planBuyHome',
        label: 'Are you planning to buy a home in the next 5 years?',
        type: 'yes-no',
      },
    ],
  },
  {
    id: 'family',
    title: 'Family',
    subtitle: 'Your family situation affects your tax strategy',
    icon: 'Users',
    questions: [
      {
        id: 'maritalStatus',
        label: 'What is your marital status?',
        type: 'radio',
        options: ['Single', 'Married / common-law'],
      },
      {
        id: 'partnerIncome',
        label: 'What is your partner\'s income range?',
        type: 'radio',
        options: ['Under $50,000', '$50,000 – $100,000', 'Over $100,000'],
        conditionalOn: { questionId: 'maritalStatus', value: 'Married / common-law' },
      },
      {
        id: 'hasChildren',
        label: 'Do you have children?',
        type: 'yes-no',
      },
      {
        id: 'hasDependents',
        label: 'Do you have dependents?',
        type: 'yes-no',
      },
      {
        id: 'shareIncomeWithPartner',
        label: 'Do you share income or assets with your partner?',
        type: 'yes-no',
        conditionalOn: { questionId: 'maritalStatus', value: 'Married / common-law' },
      },
    ],
  },
  {
    id: 'expenses',
    title: 'Expenses',
    subtitle: 'Certain expenses can reduce your tax bill',
    icon: 'Receipt',
    questions: [
      {
        id: 'workFromHome',
        label: 'Do you work from home?',
        type: 'yes-no',
      },
      {
        id: 'payWorkExpenses',
        label: 'Do you pay for work-related expenses out of pocket?',
        type: 'yes-no',
      },
      {
        id: 'movedForWork',
        label: 'Did you move for work or school this year?',
        type: 'yes-no',
      },
      {
        id: 'paidChildcare',
        label: 'Did you pay for childcare?',
        type: 'yes-no',
      },
    ],
  },
  {
    id: 'selfEmployed',
    title: 'Self-Employment',
    subtitle: 'Additional deductions for business owners',
    icon: 'Building2',
    questions: [
      {
        id: 'vehicleForWork',
        label: 'Do you use a vehicle for work?',
        type: 'yes-no',
      },
      {
        id: 'businessTravel',
        label: 'Do you have business travel or meal expenses?',
        type: 'yes-no',
      },
      {
        id: 'toolsSoftware',
        label: 'Do you pay for tools or software for your business?',
        type: 'yes-no',
      },
      {
        id: 'payFamilyMembers',
        label: 'Do you pay family members for work in your business?',
        type: 'yes-no',
      },
    ],
  },
  {
    id: 'taxCredits',
    title: 'Tax Credits',
    subtitle: 'Credits that can lower what you owe',
    icon: 'BadgePercent',
    questions: [
      {
        id: 'charitableDonations',
        label: 'Did you make charitable donations this year?',
        type: 'yes-no',
      },
      {
        id: 'medicalExpenses',
        label: 'Did you have significant medical expenses?',
        type: 'yes-no',
      },
      {
        id: 'supportDependent',
        label: 'Do you support an elderly or disabled dependent?',
        type: 'yes-no',
      },
    ],
  },
  {
    id: 'investments',
    title: 'Investments',
    subtitle: 'Your investment activity this year',
    icon: 'TrendingUp',
    questions: [
      {
        id: 'soldInvestments',
        label: 'Did you sell any investments this year?',
        type: 'yes-no',
      },
      {
        id: 'soldAtLoss',
        label: 'Did you sell any investments at a loss?',
        type: 'yes-no',
        conditionalOn: { questionId: 'soldInvestments', value: 'Yes' },
      },
      {
        id: 'holdAtLoss',
        label: 'Do you currently hold investments at a loss?',
        type: 'yes-no',
      },
      {
        id: 'planToSell',
        label: 'Do you plan to sell investments soon?',
        type: 'yes-no',
      },
      {
        id: 'investorType',
        label: 'Are you an active or passive investor?',
        type: 'radio',
        options: ['Active', 'Passive'],
      },
    ],
  },
  {
    id: 'timing',
    title: 'Timing',
    subtitle: 'When you act matters for your taxes',
    icon: 'Clock',
    questions: [
      {
        id: 'rrspTiming',
        label: 'When do you typically contribute to your RRSP?',
        type: 'radio',
        options: ['Before tax season', 'After tax season'],
      },
      {
        id: 'taxPreference',
        label: 'What is your preference?',
        type: 'radio',
        options: ['Reduce taxes now', 'Reduce taxes long-term'],
      },
    ],
  },
  {
    id: 'retirement',
    title: 'Retirement',
    subtitle: 'Planning ahead for your golden years',
    icon: 'Sunset',
    questions: [
      {
        id: 'hasPension',
        label: 'Do you have a pension?',
        type: 'yes-no',
      },
      {
        id: 'retirementIncome',
        label: 'What do you expect your retirement income to be compared to now?',
        type: 'radio',
        options: ['Lower', 'Similar', 'Higher'],
      },
    ],
  },
  {
    id: 'goals',
    title: 'Your Goals',
    subtitle: 'What matters most to you right now?',
    icon: 'Target',
    questions: [
      {
        id: 'primaryGoal',
        label: 'What is your primary financial goal?',
        type: 'radio',
        options: ['Reduce taxes now', 'Build wealth', 'Save for a home', 'Retire early'],
      },
    ],
  },
];

export type QuizAnswers = Record<string, string | string[]>;
