// Tax Calculation & Recommendation Engine — Advanced Version
// Implements: marginal tax rates, net worth, cash flow, tax efficiency score,
// reallocation engine, and "See the Math" breakdowns

import { QuizAnswers } from './quizData';

// ─── TYPES ───

export type ImpactLevel = 'low' | 'medium' | 'high';
export type StrategyCategory = 'top' | 'additional' | 'advanced';

export interface MathBreakdown {
  inputs: { label: string; value: string }[];
  formula: string;
  result: string;
  assumedRate?: number;
}

export interface TaxStrategy {
  id: string;
  title: string;
  description: string;
  why: string;
  impact: ImpactLevel;
  category: StrategyCategory;
  estimatedSavings: number; // dollar amount per year
  icon: string;
  steps?: string[];
  math?: MathBreakdown;
}

export interface NetWorthBreakdown {
  cash: number;
  investments: number;
  property: number;
  totalAssets: number;
  creditCardDebt: number;
  studentLoans: number;
  mortgage: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface CashFlowAnalysis {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  savingsRate: number; // percentage
  annualSurplus: number;
}

export interface TaxAnalysis {
  annualIncome: number;
  estimatedTaxCurrent: number;
  effectiveTaxRate: number;
  marginalRate: number;
  optimizedTax: number;
  taxSaved: number;
}

export interface TaxEfficiencyScore {
  total: number; // 0-100
  accountUsage: number; // 0-25
  assetLocation: number; // 0-25
  incomeOptimization: number; // 0-25
  deductionsUsed: number; // 0-25
}

export interface ReallocationSuggestion {
  from: string;
  to: string;
  amount: number;
  reason: string;
}

export interface FullAnalysis {
  netWorth: NetWorthBreakdown;
  cashFlow: CashFlowAnalysis;
  tax: TaxAnalysis;
  efficiencyScore: TaxEfficiencyScore;
  missedOpportunityTotal: number;
  missedOpportunities: { label: string; amount: number; explanation: string }[];
  strategies: TaxStrategy[];
  reallocations: ReallocationSuggestion[];
  summary: { incomeProfile: string };
}

// ─── HELPERS ───

function num(answers: QuizAnswers, key: string): number {
  const v = answers[key] as string;
  if (!v || v === '') return 0;
  return parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
}

function isYes(answers: QuizAnswers, key: string): boolean {
  return answers[key] === 'Yes';
}

function isSelfEmployedOrBusiness(answers: QuizAnswers): boolean {
  const s = answers.employmentStatus as string;
  return s === 'Self-employed' || s === 'Business owner' || s === 'Contractor';
}

function isMarried(answers: QuizAnswers): boolean {
  return answers.maritalStatus === 'Married / common-law';
}

function hasIncomeSource(answers: QuizAnswers, source: string): boolean {
  const s = answers.incomeSources as string[];
  return Array.isArray(s) && s.includes(source);
}

// ─── MARGINAL TAX RATES ───

export function getMarginalRate(income: number): number {
  if (income <= 0) return 0;
  if (income < 50000) return 0.20;
  if (income < 100000) return 0.30;
  if (income < 150000) return 0.38;
  return 0.45;
}

function estimateAnnualTax(income: number): number {
  if (income <= 0) return 0;
  let tax = 0;
  if (income > 150000) { tax += (income - 150000) * 0.45; income = 150000; }
  if (income > 100000) { tax += (income - 100000) * 0.38; income = 100000; }
  if (income > 50000) { tax += (income - 50000) * 0.30; income = 50000; }
  tax += income * 0.20;
  return Math.round(tax);
}

// ─── NET WORTH ───

function calculateNetWorth(a: QuizAnswers): NetWorthBreakdown {
  const cash = num(a, 'chequingBalance') + num(a, 'savingsBalance');
  const investments = num(a, 'tfsaBalance') + num(a, 'rrspBalance') + num(a, 'fhsaBalance') + num(a, 'taxableBalance');
  const property = num(a, 'homeValue') + num(a, 'rentalValue');
  const totalAssets = cash + investments + property;

  const creditCardDebt = num(a, 'creditCardBalance');
  const studentLoans = num(a, 'studentLoanBalance');
  const mortgage = num(a, 'mortgageBalance');
  const totalLiabilities = creditCardDebt + studentLoans + mortgage;

  return {
    cash, investments, property, totalAssets,
    creditCardDebt, studentLoans, mortgage, totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

// ─── CASH FLOW ───

function calculateCashFlow(a: QuizAnswers): CashFlowAnalysis {
  const monthlyIncome = num(a, 'monthlyAfterTax');
  const monthlyExpenses = num(a, 'monthlyExpenses');
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;
  return {
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    savingsRate: Math.round(savingsRate * 10) / 10,
    annualSurplus: monthlySurplus * 12,
  };
}

// ─── TAX ANALYSIS ───

function calculateTaxAnalysis(a: QuizAnswers, strategies: TaxStrategy[]): TaxAnalysis {
  const annualIncome = num(a, 'annualIncome') + num(a, 'bonusAmount');
  const marginalRate = getMarginalRate(annualIncome);
  const estimatedTaxCurrent = estimateAnnualTax(annualIncome);
  const effectiveTaxRate = annualIncome > 0 ? (estimatedTaxCurrent / annualIncome) * 100 : 0;
  const totalSavings = strategies.reduce((sum, s) => sum + s.estimatedSavings, 0);
  const optimizedTax = Math.max(0, estimatedTaxCurrent - totalSavings);

  return {
    annualIncome,
    estimatedTaxCurrent,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
    marginalRate,
    optimizedTax,
    taxSaved: estimatedTaxCurrent - optimizedTax,
  };
}

// ─── TAX EFFICIENCY SCORE ───

function calculateEfficiencyScore(a: QuizAnswers): TaxEfficiencyScore {
  let accountUsage = 0;
  let assetLocation = 0;
  let incomeOptimization = 0;
  let deductionsUsed = 0;

  // Account usage (0-25)
  if (isYes(a, 'hasTFSA')) accountUsage += 5;
  if (isYes(a, 'tfsaMaxed')) accountUsage += 7;
  if (isYes(a, 'hasRRSP')) accountUsage += 5;
  if (isYes(a, 'rrspMaxed')) accountUsage += 5;
  if (isYes(a, 'hasFHSA') || !isYes(a, 'planBuyHome')) accountUsage += 3;
  accountUsage = Math.min(25, accountUsage);

  // Asset location (0-25)
  if (isYes(a, 'growthInTFSA')) assetLocation += 12;
  const pctBonds = num(a, 'pctBonds');
  const taxableBalance = num(a, 'taxableBalance');
  if (pctBonds > 0 && taxableBalance > 0) {
    assetLocation += 0; // penalty for bonds in taxable
  } else {
    assetLocation += 8;
  }
  if (num(a, 'savingsBalance') < num(a, 'monthlyExpenses') * 6 || num(a, 'savingsBalance') === 0) {
    assetLocation += 5; // not over-saving in low-yield
  }
  assetLocation = Math.min(25, assetLocation);

  // Income optimization (0-25)
  if (isSelfEmployedOrBusiness(a)) {
    if (isYes(a, 'workFromHome')) incomeOptimization += 5;
    if (isYes(a, 'vehicleForWork')) incomeOptimization += 5;
    if (isYes(a, 'toolsSoftware')) incomeOptimization += 5;
    if (isYes(a, 'payFamilyMembers') && isMarried(a)) incomeOptimization += 5;
  } else {
    incomeOptimization += 10; // employees have less to optimize
    if (isYes(a, 'workFromHome')) incomeOptimization += 5;
  }
  if (isMarried(a) && num(a, 'partnerIncome') < num(a, 'annualIncome') * 0.5) {
    if (isYes(a, 'shareIncomeWithPartner')) incomeOptimization += 5;
  }
  incomeOptimization = Math.min(25, incomeOptimization);

  // Deductions used (0-25)
  if (isYes(a, 'charitableDonations')) deductionsUsed += 5;
  if (isYes(a, 'medicalExpenses')) deductionsUsed += 5;
  if (isYes(a, 'paidChildcare')) deductionsUsed += 5;
  if (isYes(a, 'movedForWork')) deductionsUsed += 5;
  if (isYes(a, 'holdAtLoss')) {
    deductionsUsed += 0; // missed opportunity
  } else {
    deductionsUsed += 5;
  }
  deductionsUsed = Math.min(25, deductionsUsed);

  return {
    total: accountUsage + assetLocation + incomeOptimization + deductionsUsed,
    accountUsage,
    assetLocation,
    incomeOptimization,
    deductionsUsed,
  };
}

// ─── REALLOCATION ENGINE ───

function calculateReallocations(a: QuizAnswers, cashFlow: CashFlowAnalysis): ReallocationSuggestion[] {
  const suggestions: ReallocationSuggestion[] = [];
  const monthlyExpenses = num(a, 'monthlyExpenses');
  const emergencyTarget = monthlyExpenses * 4; // 4 months
  const savingsBalance = num(a, 'savingsBalance');
  const chequingBalance = num(a, 'chequingBalance');
  const totalCash = savingsBalance + chequingBalance;

  // Keep minimum in chequing for expenses
  const chequingMin = monthlyExpenses * 1.5;

  // Emergency fund check
  const excessCash = totalCash - emergencyTarget - chequingMin;

  if (excessCash > 1000) {
    // Suggest moving excess to registered accounts
    if (!isYes(a, 'tfsaMaxed')) {
      const toTFSA = Math.min(excessCash, 7000); // annual TFSA limit
      suggestions.push({
        from: 'Savings Account',
        to: 'TFSA',
        amount: toTFSA,
        reason: 'Your savings exceed your emergency fund needs. Moving to a TFSA shelters growth from tax.',
      });
    }

    const remainingExcess = excessCash - (suggestions.length > 0 ? suggestions[0].amount : 0);
    if (remainingExcess > 1000 && !isYes(a, 'rrspMaxed') && num(a, 'annualIncome') > 50000) {
      const maxRRSP = Math.min(remainingExcess, num(a, 'annualIncome') * 0.18, 31560); // 2024 limit
      if (maxRRSP > 500) {
        suggestions.push({
          from: 'Savings Account',
          to: 'RRSP',
          amount: Math.round(maxRRSP),
          reason: 'Additional excess can be contributed to your RRSP for an immediate tax deduction.',
        });
      }
    }
  }

  // Suggest keeping enough in chequing
  if (chequingBalance < chequingMin && savingsBalance > chequingMin) {
    suggestions.push({
      from: 'Savings Account',
      to: 'Chequing Account',
      amount: Math.round(chequingMin - chequingBalance),
      reason: `Keep at least ${formatCurrency(chequingMin)} in chequing to cover 1.5 months of expenses.`,
    });
  }

  return suggestions;
}

// ─── STRATEGY GENERATION ───

function generateStrategies(a: QuizAnswers): TaxStrategy[] {
  const strategies: TaxStrategy[] = [];
  const income = num(a, 'annualIncome') + num(a, 'bonusAmount');
  const marginalRate = getMarginalRate(income);
  const pctRate = Math.round(marginalRate * 100);

  // ─── RRSP ───
  if (income > 50000 && isYes(a, 'hasRRSP') && !isYes(a, 'rrspMaxed')) {
    const maxContrib = Math.min(income * 0.18, 31560);
    const savings = Math.round(maxContrib * marginalRate);
    strategies.push({
      id: 'rrsp-max',
      title: 'Maximize Your RRSP Contributions',
      description: `Contributing the maximum to your RRSP provides a dollar-for-dollar deduction against your taxable income. At your income level, each dollar contributed saves you ${pctRate} cents in tax.`,
      why: `At your ${pctRate}% marginal rate, RRSP contributions provide the highest tax savings. Contributions grow tax-deferred until withdrawal in retirement, when you'll likely be in a lower bracket.`,
      impact: 'high',
      category: 'top',
      estimatedSavings: savings,
      icon: 'TrendingUp',
      steps: [
        'Check your RRSP contribution room on your CRA My Account',
        `Contribute up to ${formatCurrency(maxContrib)} before the March 1 deadline`,
        'Claim the deduction on your tax return',
        'Reinvest your tax refund for compound growth',
      ],
      math: {
        inputs: [
          { label: 'Annual income', value: formatCurrency(income) },
          { label: 'Max RRSP contribution (18% of income, capped at $31,560)', value: formatCurrency(maxContrib) },
          { label: 'Marginal tax rate', value: `${pctRate}%` },
        ],
        formula: 'RRSP contribution × marginal tax rate',
        result: formatCurrency(savings),
        assumedRate: pctRate,
      },
    });
  }

  if (isYes(a, 'incomeDecrease') && isYes(a, 'hasRRSP') && !isYes(a, 'rrspMaxed')) {
    strategies.push({
      id: 'rrsp-delay',
      title: 'Consider Delaying RRSP Contributions',
      description: 'Since you expect your income to decrease, it may be beneficial to delay RRSP contributions to a year when your income is higher, so the deduction offsets taxes at a higher marginal rate.',
      why: 'RRSP deductions are worth more when your marginal tax rate is higher. By waiting, each dollar of contribution saves you more in taxes.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: Math.round(income * 0.18 * 0.08), // difference between current and lower rate
      icon: 'Clock',
      math: {
        inputs: [
          { label: 'Current marginal rate', value: `${pctRate}%` },
          { label: 'Expected lower rate', value: `${Math.max(20, pctRate - 8)}%` },
        ],
        formula: 'RRSP room × (current rate - future rate)',
        result: formatCurrency(Math.round(income * 0.18 * 0.08)),
        assumedRate: pctRate,
      },
    });
  }

  // ─── TFSA ───
  if (!isYes(a, 'tfsaMaxed') && isYes(a, 'hasTFSA')) {
    const tfsaRoom = 7000; // annual limit
    const assumedReturn = 0.06;
    const taxOnGains = Math.round(tfsaRoom * assumedReturn * marginalRate);
    strategies.push({
      id: 'tfsa-max',
      title: 'Max Out Your TFSA',
      description: 'All investment growth inside a TFSA is completely tax-free. No tax on interest, dividends, or capital gains. This is one of the most powerful tax shelters available to Canadians.',
      why: "Unlike an RRSP, TFSA withdrawals are not taxed and don't affect government benefits. It's the most flexible registered account for building wealth.",
      impact: 'high',
      category: 'top',
      estimatedSavings: taxOnGains > 0 ? taxOnGains : 420,
      icon: 'PiggyBank',
      math: {
        inputs: [
          { label: 'Annual TFSA contribution room', value: formatCurrency(tfsaRoom) },
          { label: 'Assumed annual return', value: '6%' },
          { label: 'Tax avoided on gains', value: `${pctRate}%` },
        ],
        formula: 'TFSA room × assumed return × marginal tax rate',
        result: formatCurrency(taxOnGains > 0 ? taxOnGains : 420),
        assumedRate: pctRate,
      },
    });
  } else if (!isYes(a, 'hasTFSA')) {
    strategies.push({
      id: 'tfsa-open',
      title: 'Open a TFSA',
      description: 'You don\'t have a TFSA yet. Opening one gives you access to tax-free investment growth. Your contribution room accumulates each year, so you may have significant room available.',
      why: 'The TFSA is the most flexible tax shelter in Canada. All growth is tax-free, and withdrawals don\'t affect government benefits.',
      impact: 'high',
      category: 'top',
      estimatedSavings: 500,
      icon: 'PiggyBank',
    });
  }

  if (!isYes(a, 'growthInTFSA') && num(a, 'pctStocks') > 0) {
    const taxableBalance = num(a, 'taxableBalance');
    const growthInTaxable = taxableBalance * (num(a, 'pctStocks') / 100);
    const taxDrag = Math.round(growthInTaxable * 0.06 * marginalRate * 0.5); // 50% inclusion rate for cap gains
    strategies.push({
      id: 'tfsa-growth',
      title: 'Move Growth Investments Into Your TFSA',
      description: 'Your highest-growth investments should be inside your TFSA. Since all gains are tax-free, putting assets with the most growth potential here maximizes the tax benefit.',
      why: 'Growth stocks have the highest potential for capital appreciation. Sheltering these gains in a TFSA means you keep 100% of the profits.',
      impact: taxDrag > 500 ? 'high' : 'medium',
      category: taxDrag > 500 ? 'top' : 'additional',
      estimatedSavings: Math.max(taxDrag, 300),
      icon: 'ArrowUpRight',
      math: {
        inputs: [
          { label: 'Growth investments in taxable account', value: formatCurrency(growthInTaxable) },
          { label: 'Assumed annual return', value: '6%' },
          { label: 'Capital gains inclusion rate', value: '50%' },
          { label: 'Marginal tax rate', value: `${pctRate}%` },
        ],
        formula: 'Growth in taxable × return × inclusion rate × marginal rate',
        result: formatCurrency(Math.max(taxDrag, 300)),
        assumedRate: pctRate,
      },
    });
  }

  // ─── FHSA ───
  if (isYes(a, 'planBuyHome') && !isYes(a, 'hasFHSA')) {
    const fhsaDeduction = Math.round(8000 * marginalRate);
    strategies.push({
      id: 'fhsa-open',
      title: 'Open a First Home Savings Account (FHSA)',
      description: 'The FHSA combines the best of both RRSP and TFSA. Contributions are tax-deductible AND withdrawals for a qualifying home purchase are completely tax-free. Contribute up to $8,000/year, $40,000 lifetime.',
      why: "This is a double tax advantage — you get an immediate deduction AND tax-free growth and withdrawal. It's the most tax-efficient way to save for your first home.",
      impact: 'high',
      category: 'top',
      estimatedSavings: fhsaDeduction,
      icon: 'Home',
      steps: [
        'Open an FHSA at your bank or brokerage',
        'Contribute up to $8,000 this year',
        'Claim the deduction on your tax return',
        'Invest the funds for growth until you buy',
      ],
      math: {
        inputs: [
          { label: 'Annual FHSA contribution', value: '$8,000' },
          { label: 'Marginal tax rate', value: `${pctRate}%` },
        ],
        formula: 'FHSA contribution × marginal tax rate',
        result: formatCurrency(fhsaDeduction),
        assumedRate: pctRate,
      },
    });
  }

  // ─── INCOME SPLITTING ───
  if (isMarried(a) && num(a, 'partnerIncome') < income * 0.5 && income > 80000) {
    const partnerIncome = num(a, 'partnerIncome');
    const gap = income - partnerIncome;
    const splitAmount = Math.min(gap * 0.25, 30000);
    const currentTax = estimateAnnualTax(income) + estimateAnnualTax(partnerIncome);
    const splitTax = estimateAnnualTax(income - splitAmount) + estimateAnnualTax(partnerIncome + splitAmount);
    const savings = Math.max(0, currentTax - splitTax);
    if (savings > 200) {
      strategies.push({
        id: 'income-split',
        title: 'Use Income Splitting Strategies',
        description: `Since your partner earns significantly less, income splitting can reduce your household's overall tax burden. Consider a spousal RRSP, which lets the higher-income spouse get the deduction while the lower-income spouse is taxed on withdrawals.`,
        why: "Canada's progressive tax system means shifting income to a lower-earning spouse reduces total household tax. Spousal RRSPs are one of the most effective legal methods.",
        impact: 'high',
        category: 'top',
        estimatedSavings: savings,
        icon: 'Users',
        math: {
          inputs: [
            { label: 'Your income', value: formatCurrency(income) },
            { label: "Partner's income", value: formatCurrency(partnerIncome) },
            { label: 'Income gap', value: formatCurrency(gap) },
          ],
          formula: 'Tax(current split) - Tax(optimized split)',
          result: formatCurrency(savings),
          assumedRate: pctRate,
        },
      });
    }
  }

  // ─── HOME OFFICE ───
  if (isYes(a, 'workFromHome')) {
    const isSE = isSelfEmployedOrBusiness(a);
    const savings = isSE ? Math.min(income * 0.03, 5000) : 500;
    strategies.push({
      id: 'home-office',
      title: 'Claim Home Office Deductions',
      description: isSE
        ? 'As a self-employed individual, you can deduct a proportional share of rent, utilities, internet, and maintenance for your home office.'
        : 'Employees who work from home can use the simplified flat-rate method ($2/day, up to $500) or the detailed method with a signed T2200.',
      why: "This is an often-overlooked deduction. The CRA allows home office claims for anyone who works from home more than 50% of the time over at least four consecutive weeks.",
      impact: isSE ? 'high' : 'medium',
      category: isSE ? 'top' : 'additional',
      estimatedSavings: Math.round(savings * marginalRate),
      icon: 'Laptop',
      math: {
        inputs: [
          { label: 'Estimated deductible expenses', value: formatCurrency(savings) },
          { label: 'Marginal tax rate', value: `${pctRate}%` },
        ],
        formula: 'Deductible expenses × marginal tax rate',
        result: formatCurrency(Math.round(savings * marginalRate)),
        assumedRate: pctRate,
      },
    });
  }

  // ─── SELF-EMPLOYED DEDUCTIONS ───
  if (isSelfEmployedOrBusiness(a)) {
    if (isYes(a, 'vehicleForWork')) {
      const vehicleDeduction = Math.min(income * 0.05, 8000);
      strategies.push({
        id: 'vehicle-deduction',
        title: 'Write Off Vehicle Expenses',
        description: 'Deduct the business-use portion of your vehicle expenses: fuel, insurance, maintenance, lease payments, and CCA (depreciation). Keep a detailed mileage log.',
        why: 'Vehicle expenses can be substantial. Deducting the business-use percentage directly reduces your self-employment income.',
        impact: 'high',
        category: 'additional',
        estimatedSavings: Math.round(vehicleDeduction * marginalRate),
        icon: 'Car',
        math: {
          inputs: [{ label: 'Estimated vehicle deduction', value: formatCurrency(vehicleDeduction) }, { label: 'Marginal rate', value: `${pctRate}%` }],
          formula: 'Vehicle deduction × marginal rate',
          result: formatCurrency(Math.round(vehicleDeduction * marginalRate)),
          assumedRate: pctRate,
        },
      });
    }

    if (isYes(a, 'toolsSoftware')) {
      const toolsDeduction = Math.min(income * 0.03, 5000);
      strategies.push({
        id: 'tools-deduction',
        title: 'Deduct Tools & Software Expenses',
        description: 'Business-related tools, software subscriptions, equipment, and supplies are fully deductible.',
        why: 'These reduce your net self-employment income, lowering both income tax and CPP contributions.',
        impact: 'medium',
        category: 'additional',
        estimatedSavings: Math.round(toolsDeduction * marginalRate),
        icon: 'Wrench',
        math: {
          inputs: [{ label: 'Estimated tools/software expenses', value: formatCurrency(toolsDeduction) }, { label: 'Marginal rate', value: `${pctRate}%` }],
          formula: 'Tools deduction × marginal rate',
          result: formatCurrency(Math.round(toolsDeduction * marginalRate)),
          assumedRate: pctRate,
        },
      });
    }

    if (isYes(a, 'payFamilyMembers')) {
      const familySplit = Math.min(income * 0.1, 20000);
      const currentTaxOnPortion = Math.round(familySplit * marginalRate);
      const familyTax = Math.round(familySplit * 0.20);
      strategies.push({
        id: 'family-income-split',
        title: 'Income Splitting Through Family Employment',
        description: 'Paying family members a reasonable salary for legitimate work shifts income to lower tax brackets.',
        why: 'This effectively splits your business income, reducing overall household tax while keeping money in the family.',
        impact: 'high',
        category: 'additional',
        estimatedSavings: Math.max(0, currentTaxOnPortion - familyTax),
        icon: 'Users',
        math: {
          inputs: [{ label: 'Salary to family member', value: formatCurrency(familySplit) }, { label: 'Your marginal rate', value: `${pctRate}%` }, { label: "Family member's rate", value: '20%' }],
          formula: '(Salary × your rate) - (Salary × their rate)',
          result: formatCurrency(Math.max(0, currentTaxOnPortion - familyTax)),
          assumedRate: pctRate,
        },
      });
    }

    if (isYes(a, 'businessTravel')) {
      const travelDeduction = Math.min(income * 0.03, 5000);
      strategies.push({
        id: 'travel-deduction',
        title: 'Deduct Business Travel & Meal Expenses',
        description: 'Business travel is fully deductible. Business meals are 50% deductible. Keep all receipts.',
        why: 'Travel and meal expenses add up quickly and directly reduce your taxable business income.',
        impact: 'medium',
        category: 'additional',
        estimatedSavings: Math.round(travelDeduction * marginalRate),
        icon: 'Plane',
      });
    }
  }

  // ─── TAX LOSS HARVESTING ───
  if (isYes(a, 'holdAtLoss')) {
    const unrealizedLoss = num(a, 'unrealizedLoss');
    const capitalGains = num(a, 'capitalGainsAmount');
    const lossToHarvest = unrealizedLoss > 0 ? unrealizedLoss : 5000;
    const gainsToOffset = capitalGains > 0 ? Math.min(lossToHarvest, capitalGains) : lossToHarvest;
    const savings = Math.round(gainsToOffset * 0.5 * marginalRate); // 50% inclusion rate
    strategies.push({
      id: 'tax-loss-harvest',
      title: 'Harvest Tax Losses to Offset Gains',
      description: 'Sell investments at a loss to realize capital losses. These offset capital gains this year, can be carried back 3 years, or carried forward indefinitely.',
      why: 'Tax-loss harvesting reduces your tax bill while allowing you to reinvest in similar (but not identical) assets.',
      impact: savings > 500 ? 'high' : 'medium',
      category: savings > 500 ? 'top' : 'additional',
      estimatedSavings: Math.max(savings, 200),
      icon: 'TrendingDown',
      math: {
        inputs: [
          { label: 'Unrealized losses', value: formatCurrency(lossToHarvest) },
          { label: 'Capital gains inclusion rate', value: '50%' },
          { label: 'Marginal tax rate', value: `${pctRate}%` },
        ],
        formula: 'Losses × 50% inclusion × marginal rate',
        result: formatCurrency(Math.max(savings, 200)),
        assumedRate: pctRate,
      },
    });
  }

  // ─── ASSET LOCATION — BONDS ───
  if (num(a, 'pctBonds') > 0 && num(a, 'taxableBalance') > 0) {
    const bondsInTaxable = num(a, 'taxableBalance') * (num(a, 'pctBonds') / 100);
    const taxDrag = Math.round(bondsInTaxable * 0.04 * marginalRate); // 4% bond yield taxed at full rate
    if (taxDrag > 50) {
      strategies.push({
        id: 'bonds-to-rrsp',
        title: 'Move Bonds to Your RRSP',
        description: 'Bond interest is taxed as regular income — the highest rate. Holding bonds inside your RRSP lets interest grow tax-deferred.',
        why: "Asset location optimization ensures you pay the least tax on each type of investment income. Interest income is taxed most heavily.",
        impact: taxDrag > 500 ? 'high' : 'medium',
        category: 'advanced',
        estimatedSavings: taxDrag,
        icon: 'ArrowRightLeft',
        math: {
          inputs: [
            { label: 'Bonds in taxable account', value: formatCurrency(bondsInTaxable) },
            { label: 'Assumed bond yield', value: '4%' },
            { label: 'Marginal tax rate', value: `${pctRate}%` },
          ],
          formula: 'Bond value × yield × marginal rate',
          result: formatCurrency(taxDrag),
          assumedRate: pctRate,
        },
      });
    }
  }

  // ─── RENTAL PROPERTY ───
  if (isYes(a, 'ownRental')) {
    const rentalVal = num(a, 'rentalValue');
    const estimatedDeductions = Math.round(rentalVal * 0.03); // rough 3% of value in deductions
    const savings = Math.round(estimatedDeductions * marginalRate);
    strategies.push({
      id: 'rental-deductions',
      title: 'Maximize Rental Property Deductions',
      description: 'Deduct mortgage interest, property taxes, insurance, maintenance, repairs, property management fees, and CCA (depreciation).',
      why: 'Many landlords miss legitimate deductions. Properly tracking all allowable expenses can significantly reduce your rental income tax.',
      impact: 'high',
      category: 'additional',
      estimatedSavings: Math.max(savings, 1000),
      icon: 'Building',
      math: {
        inputs: [
          { label: 'Rental property value', value: formatCurrency(rentalVal) },
          { label: 'Estimated annual deductions (~3% of value)', value: formatCurrency(estimatedDeductions) },
          { label: 'Marginal rate', value: `${pctRate}%` },
        ],
        formula: 'Deductions × marginal rate',
        result: formatCurrency(Math.max(savings, 1000)),
        assumedRate: pctRate,
      },
    });
  }

  // ─── CHILDCARE ───
  if (isYes(a, 'paidChildcare')) {
    const childcareAmount = num(a, 'childcareAmount');
    const deductible = childcareAmount > 0 ? childcareAmount : 8000;
    const savings = Math.round(deductible * marginalRate);
    strategies.push({
      id: 'childcare-deduction',
      title: 'Claim Childcare Expense Deductions',
      description: 'Childcare expenses are deductible: daycare, before/after school care, day camps, and some boarding school fees. Claimed by the lower-income spouse.',
      why: 'The childcare deduction directly reduces taxable income. Up to $8,000 per child under 7 and $5,000 per child aged 7–16.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: savings,
      icon: 'Baby',
      math: {
        inputs: [
          { label: 'Childcare expenses', value: formatCurrency(deductible) },
          { label: 'Marginal rate', value: `${pctRate}%` },
        ],
        formula: 'Childcare expenses × marginal rate',
        result: formatCurrency(savings),
        assumedRate: pctRate,
      },
    });
  }

  // ─── DONATIONS ───
  if (isYes(a, 'charitableDonations')) {
    const donationAmt = num(a, 'donationAmount');
    const savings = donationAmt > 200
      ? Math.round(200 * 0.15 + (donationAmt - 200) * 0.29)
      : Math.round(donationAmt * 0.15);
    strategies.push({
      id: 'donate-stocks',
      title: 'Donate Appreciated Securities Instead of Cash',
      description: 'Donating publicly traded securities directly to charity gives you a donation tax credit AND eliminates capital gains tax on the appreciation.',
      why: "Normally you'd pay capital gains tax when selling investments. Donating directly eliminates the tax while giving you the full donation credit.",
      impact: savings > 500 ? 'high' : 'medium',
      category: 'advanced',
      estimatedSavings: Math.max(savings, 100),
      icon: 'Heart',
      math: {
        inputs: [
          { label: 'Donation amount', value: formatCurrency(donationAmt) },
          { label: 'First $200 credit rate', value: '15%' },
          { label: 'Amount over $200 credit rate', value: '29%' },
        ],
        formula: '($200 × 15%) + (excess × 29%)',
        result: formatCurrency(Math.max(savings, 100)),
      },
    });
  }

  // ─── MEDICAL EXPENSES ───
  if (isYes(a, 'medicalExpenses')) {
    const medicalAmt = num(a, 'medicalAmount');
    const threshold = Math.min(income * 0.03, 2635);
    const claimable = Math.max(0, medicalAmt - threshold);
    const savings = Math.round(claimable * 0.15); // 15% federal credit
    if (savings > 0) {
      strategies.push({
        id: 'medical-credit',
        title: 'Claim the Medical Expense Tax Credit',
        description: `Medical expenses exceeding ${formatCurrency(threshold)} (3% of income or $2,635, whichever is less) qualify for a non-refundable tax credit.`,
        why: 'The medical expense tax credit is often underutilized. Bundling expenses into a single 12-month period can maximize your credit.',
        impact: savings > 300 ? 'medium' : 'low',
        category: 'additional',
        estimatedSavings: savings,
        icon: 'Stethoscope',
        math: {
          inputs: [
            { label: 'Medical expenses', value: formatCurrency(medicalAmt) },
            { label: 'Threshold (3% of income or $2,635)', value: formatCurrency(threshold) },
            { label: 'Claimable amount', value: formatCurrency(claimable) },
          ],
          formula: 'Claimable amount × 15% federal credit rate',
          result: formatCurrency(savings),
        },
      });
    }
  }

  // ─── CAREGIVER CREDIT ───
  if (isYes(a, 'supportDependent')) {
    strategies.push({
      id: 'caregiver-credit',
      title: 'Claim the Canada Caregiver Credit',
      description: 'If you support an elderly or disabled dependent, you may be eligible for the Canada Caregiver Credit — up to $1,200–$2,300 in tax reduction.',
      why: 'This credit recognizes the financial burden of caregiving and provides meaningful tax relief.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: 1500,
      icon: 'HeartHandshake',
    });
  }

  // ─── MOVING EXPENSES ───
  if (isYes(a, 'movedForWork')) {
    strategies.push({
      id: 'moving-expenses',
      title: 'Deduct Moving Expenses',
      description: 'If you moved at least 40 km closer to a new work location, you can deduct transportation, temporary lodging, meals, and home sale/purchase costs.',
      why: 'Moving expenses are fully deductible against income earned at the new location.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: Math.round(3000 * marginalRate),
      icon: 'Truck',
    });
  }

  // ─── RESP ───
  if (isYes(a, 'hasChildren') && !isYes(a, 'hasRESP')) {
    strategies.push({
      id: 'resp-open',
      title: 'Open an RESP for Your Children',
      description: 'The RESP provides tax-deferred growth plus a 20% government match (CESG) on the first $2,500/year per child — $500 of free money annually.',
      why: "The CESG is an immediate 20% return. Combined with tax-deferred growth, it's the most efficient way to save for education.",
      impact: 'medium',
      category: 'additional',
      estimatedSavings: 500,
      icon: 'GraduationCap',
    });
  }

  // ─── OAS PLANNING ───
  if (income > 100000 && (a.taxPreference === 'Reduce taxes long-term' || a.primaryGoal === 'Build wealth' || a.primaryGoal === 'Retire early')) {
    strategies.push({
      id: 'oas-planning',
      title: 'Plan TFSA Withdrawals to Avoid OAS Clawbacks',
      description: 'In retirement, if net income exceeds ~$90,000, you lose 15 cents of OAS per dollar above. TFSA withdrawals don\'t count as income.',
      why: 'High-income earners risk losing thousands in OAS. Building a large TFSA now and drawing from it in retirement keeps reportable income below the clawback threshold.',
      impact: 'high',
      category: 'advanced',
      estimatedSavings: 4000,
      icon: 'Shield',
    });
  }

  // ─── PENSION SPLITTING ───
  if (isYes(a, 'hasPension') && isMarried(a)) {
    strategies.push({
      id: 'pension-split',
      title: 'Split Pension Income With Your Spouse',
      description: 'Up to 50% of eligible pension income can be allocated to your spouse on tax returns, reducing the higher earner\'s tax burden.',
      why: 'Pension income splitting is one of the simplest and most effective strategies for retired couples.',
      impact: 'high',
      category: 'advanced',
      estimatedSavings: 2500,
      icon: 'Users',
    });
  }

  // ─── WORK EXPENSES ───
  if (isYes(a, 'payWorkExpenses') && !isSelfEmployedOrBusiness(a)) {
    strategies.push({
      id: 'employment-expenses',
      title: 'Deduct Unreimbursed Employment Expenses',
      description: 'With a signed T2200 from your employer, you can deduct supplies, phone, vehicle use, and professional dues.',
      why: "Many employees don't realize they can deduct work expenses with proper documentation.",
      impact: 'low',
      category: 'additional',
      estimatedSavings: Math.round(1000 * marginalRate),
      icon: 'FileText',
    });
  }

  // ─── RRSP TIMING ───
  if (a.rrspTiming === 'After tax season' && isYes(a, 'hasRRSP') && !isYes(a, 'rrspMaxed')) {
    strategies.push({
      id: 'rrsp-timing',
      title: 'Contribute to Your RRSP Before the Deadline',
      description: 'Contributing before March 1 lets you claim the deduction on last year\'s return for an immediate tax refund.',
      why: 'Early contributions give an extra year of tax-deferred growth and an immediate tax benefit.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: Math.round(5000 * marginalRate),
      icon: 'Calendar',
    });
  }

  // ─── CASH MISALLOCATION ───
  const savingsBalance = num(a, 'savingsBalance');
  const monthlyExpenses = num(a, 'monthlyExpenses');
  const emergencyNeeded = monthlyExpenses * 6;
  const excessSavings = savingsBalance - emergencyNeeded;
  if (excessSavings > 5000 && !isYes(a, 'tfsaMaxed')) {
    const lostReturns = Math.round(excessSavings * 0.06 * marginalRate);
    strategies.push({
      id: 'cash-misallocation',
      title: 'Move Excess Savings to Your TFSA',
      description: `You have approximately ${formatCurrency(excessSavings)} beyond your emergency fund sitting in a low-yield savings account. Moving this to a TFSA could shelter the growth from tax.`,
      why: 'Savings accounts earn minimal interest that is fully taxable. Investing excess cash in a TFSA provides tax-free growth.',
      impact: lostReturns > 500 ? 'high' : 'medium',
      category: lostReturns > 500 ? 'top' : 'additional',
      estimatedSavings: Math.max(lostReturns, 200),
      icon: 'ArrowUpRight',
      math: {
        inputs: [
          { label: 'Excess savings beyond emergency fund', value: formatCurrency(excessSavings) },
          { label: 'Assumed return if invested', value: '6%' },
          { label: 'Tax avoided', value: `${pctRate}%` },
        ],
        formula: 'Excess savings × assumed return × marginal rate',
        result: formatCurrency(Math.max(lostReturns, 200)),
        assumedRate: pctRate,
      },
    });
  }

  // Sort strategies
  const catOrder: Record<StrategyCategory, number> = { top: 0, additional: 1, advanced: 2 };
  const impOrder: Record<ImpactLevel, number> = { high: 0, medium: 1, low: 2 };
  strategies.sort((a, b) => {
    if (catOrder[a.category] !== catOrder[b.category]) return catOrder[a.category] - catOrder[b.category];
    if (b.estimatedSavings !== a.estimatedSavings) return b.estimatedSavings - a.estimatedSavings;
    return impOrder[a.impact] - impOrder[b.impact];
  });

  return strategies;
}

// ─── MISSED OPPORTUNITIES ───

function calculateMissedOpportunities(a: QuizAnswers, marginalRate: number): { label: string; amount: number; explanation: string }[] {
  const opps: { label: string; amount: number; explanation: string }[] = [];
  const income = num(a, 'annualIncome') + num(a, 'bonusAmount');
  const pctRate = Math.round(marginalRate * 100);

  if (!isYes(a, 'rrspMaxed') && isYes(a, 'hasRRSP') && income > 50000) {
    const room = Math.min(income * 0.18, 31560);
    const savings = Math.round(room * marginalRate);
    opps.push({ label: 'Unused RRSP room', amount: savings, explanation: `Contributing ${formatCurrency(room)} at ${pctRate}% marginal rate` });
  }

  if (!isYes(a, 'tfsaMaxed')) {
    const growth = Math.round(7000 * 0.06 * marginalRate);
    opps.push({ label: 'Unused TFSA growth potential', amount: Math.max(growth, 200), explanation: 'Tax-free growth on $7,000 annual room at 6% return' });
  }

  if (!isYes(a, 'growthInTFSA') && num(a, 'pctStocks') > 0 && num(a, 'taxableBalance') > 0) {
    const growthInTaxable = num(a, 'taxableBalance') * (num(a, 'pctStocks') / 100);
    const drag = Math.round(growthInTaxable * 0.06 * 0.5 * marginalRate);
    if (drag > 50) opps.push({ label: 'Poor asset location (growth in taxable)', amount: drag, explanation: 'Capital gains tax on growth stocks held outside TFSA' });
  }

  if (num(a, 'pctBonds') > 0 && num(a, 'taxableBalance') > 0) {
    const bondsInTaxable = num(a, 'taxableBalance') * (num(a, 'pctBonds') / 100);
    const drag = Math.round(bondsInTaxable * 0.04 * marginalRate);
    if (drag > 50) opps.push({ label: 'Bonds in taxable account', amount: drag, explanation: 'Bond interest taxed at full marginal rate instead of sheltered in RRSP' });
  }

  const savingsBalance = num(a, 'savingsBalance');
  const emergencyNeeded = num(a, 'monthlyExpenses') * 6;
  const excess = savingsBalance - emergencyNeeded;
  if (excess > 5000) {
    const lost = Math.round(excess * 0.04); // opportunity cost
    opps.push({ label: 'Cash sitting idle in savings', amount: lost, explanation: `${formatCurrency(excess)} earning minimal interest instead of being invested` });
  }

  return opps;
}

// ─── MAIN ANALYSIS ───

export function generateFullAnalysis(answers: QuizAnswers): FullAnalysis {
  const netWorth = calculateNetWorth(answers);
  const cashFlow = calculateCashFlow(answers);
  const strategies = generateStrategies(answers);
  const tax = calculateTaxAnalysis(answers, strategies);
  const efficiencyScore = calculateEfficiencyScore(answers);
  const missedOpportunities = calculateMissedOpportunities(answers, tax.marginalRate);
  const missedOpportunityTotal = missedOpportunities.reduce((sum, o) => sum + o.amount, 0);
  const reallocations = calculateReallocations(answers, cashFlow);

  const employment = (answers.employmentStatus as string) || 'Not specified';
  const province = (answers.province as string) || 'Not specified';
  const incomeProfile = `${employment} in ${province} earning ${formatCurrency(tax.annualIncome)}/year`;

  return {
    netWorth,
    cashFlow,
    tax,
    efficiencyScore,
    missedOpportunityTotal,
    missedOpportunities,
    strategies,
    reallocations,
    summary: { incomeProfile },
  };
}

// ─── FORMATTING ───

export function formatCurrency(amount: number): string {
  if (amount === 0) return '$0';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}
