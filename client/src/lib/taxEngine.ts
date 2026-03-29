// Tax Recommendation Logic Engine
// Implements all rules from the Canadian Tax Optimization Quiz spec

import { QuizAnswers } from './quizData';

export type ImpactLevel = 'low' | 'medium' | 'high';
export type StrategyCategory = 'top' | 'additional' | 'advanced';

export interface TaxStrategy {
  id: string;
  title: string;
  description: string;
  why: string;
  impact: ImpactLevel;
  category: StrategyCategory;
  estimatedSavings?: string;
  icon: string;
}

function getIncomeLevel(answers: QuizAnswers): number {
  const income = answers.annualIncome as string;
  if (income === 'Under $50,000') return 1;
  if (income === '$50,000 – $100,000') return 2;
  if (income === '$100,000 – $150,000') return 3;
  if (income === 'Over $150,000') return 4;
  return 1;
}

function getPartnerIncomeLevel(answers: QuizAnswers): number {
  const income = answers.partnerIncome as string;
  if (income === 'Under $50,000') return 1;
  if (income === '$50,000 – $100,000') return 2;
  if (income === 'Over $100,000') return 3;
  return 0;
}

function isYes(answers: QuizAnswers, key: string): boolean {
  return answers[key] === 'Yes';
}

function isSelfEmployedOrBusiness(answers: QuizAnswers): boolean {
  const status = answers.employmentStatus as string;
  return status === 'Self-employed' || status === 'Business owner' || status === 'Contractor';
}

function isMarried(answers: QuizAnswers): boolean {
  return answers.maritalStatus === 'Married / common-law';
}

function hasIncome(answers: QuizAnswers, source: string): boolean {
  const sources = answers.incomeSources as string[];
  return Array.isArray(sources) && sources.includes(source);
}

function hasInvestmentType(answers: QuizAnswers, type: string): boolean {
  const types = answers.investmentTypes as string[];
  return Array.isArray(types) && types.includes(type);
}

function hasAccountType(answers: QuizAnswers, type: string): boolean {
  const accounts = answers.investmentAccounts as string[];
  return Array.isArray(accounts) && accounts.includes(type);
}

function isHighIncome(answers: QuizAnswers): boolean {
  return getIncomeLevel(answers) >= 3;
}

function isLongTermFocus(answers: QuizAnswers): boolean {
  return answers.taxPreference === 'Reduce taxes long-term' ||
    answers.primaryGoal === 'Build wealth' ||
    answers.primaryGoal === 'Retire early';
}

export function generateRecommendations(answers: QuizAnswers): TaxStrategy[] {
  const strategies: TaxStrategy[] = [];
  const incomeLevel = getIncomeLevel(answers);

  // ─── RRSP RULES ───
  if (incomeLevel >= 3 && !isYes(answers, 'rrspMaxed')) {
    strategies.push({
      id: 'rrsp-max',
      title: 'Maximize Your RRSP Contributions',
      description: 'With your income level, contributing the maximum to your RRSP will provide a significant tax deduction. Every dollar contributed reduces your taxable income dollar-for-dollar in the year of contribution.',
      why: 'At your income bracket, RRSP contributions provide the highest marginal tax savings. Contributions grow tax-deferred until withdrawal in retirement, when you\'ll likely be in a lower tax bracket.',
      impact: 'high',
      category: 'top',
      estimatedSavings: incomeLevel >= 4 ? '$5,000 – $15,000+' : '$3,000 – $8,000',
      icon: 'TrendingUp',
    });
  }

  if (isYes(answers, 'incomeDecrease')) {
    strategies.push({
      id: 'rrsp-delay',
      title: 'Consider Delaying RRSP Contributions',
      description: 'Since you expect your income to decrease, it may be beneficial to delay RRSP contributions to a year when your income is higher. This way, the deduction will offset taxes at a higher marginal rate.',
      why: 'RRSP deductions are worth more when your marginal tax rate is higher. By waiting, each dollar of contribution saves you more in taxes.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$500 – $3,000',
      icon: 'Clock',
    });
  }

  // ─── TFSA RULES ───
  if (!isYes(answers, 'tfsaMaxed')) {
    strategies.push({
      id: 'tfsa-max',
      title: 'Max Out Your TFSA',
      description: 'Your TFSA still has room. All investment growth inside a TFSA is completely tax-free — no tax on interest, dividends, or capital gains. This is one of the most powerful tax shelters available to Canadians.',
      why: 'Unlike an RRSP, TFSA withdrawals are not taxed and don\'t affect government benefits. It\'s the most flexible registered account for building wealth.',
      impact: 'high',
      category: 'top',
      estimatedSavings: '$500 – $5,000+',
      icon: 'PiggyBank',
    });
  }

  if (!isYes(answers, 'growthInTFSA') && hasInvestmentType(answers, 'Growth stocks')) {
    strategies.push({
      id: 'tfsa-growth',
      title: 'Move Growth Investments Into Your TFSA',
      description: 'Your highest-growth investments should be inside your TFSA. Since all gains are tax-free, putting assets with the most growth potential here maximizes the tax benefit.',
      why: 'Growth stocks have the highest potential for capital appreciation. Sheltering these gains in a TFSA means you keep 100% of the profits instead of paying capital gains tax.',
      impact: 'high',
      category: 'top',
      estimatedSavings: '$1,000 – $10,000+',
      icon: 'ArrowUpRight',
    });
  }

  // ─── FHSA RULE ───
  if (isYes(answers, 'planBuyHome') && !isYes(answers, 'hasFHSA')) {
    strategies.push({
      id: 'fhsa-open',
      title: 'Open a First Home Savings Account (FHSA)',
      description: 'The FHSA combines the best of both RRSP and TFSA. Contributions are tax-deductible (like an RRSP), and withdrawals for a qualifying home purchase are completely tax-free (like a TFSA). You can contribute up to $8,000 per year, up to a $40,000 lifetime limit.',
      why: 'This is a double tax advantage — you get an immediate deduction AND tax-free growth and withdrawal. It\'s the most tax-efficient way to save for your first home.',
      impact: 'high',
      category: 'top',
      estimatedSavings: '$1,500 – $4,000 per year',
      icon: 'Home',
    });
  }

  // ─── INCOME SPLITTING ───
  if (isMarried(answers) && getPartnerIncomeLevel(answers) < getIncomeLevel(answers) - 1) {
    strategies.push({
      id: 'income-split',
      title: 'Use Income Splitting Strategies',
      description: 'Since your partner earns significantly less than you, income splitting can reduce your household\'s overall tax burden. Consider contributing to a spousal RRSP, which allows the higher-income spouse to get the deduction while the lower-income spouse is taxed on withdrawals.',
      why: 'Canada\'s progressive tax system means shifting income to a lower-earning spouse reduces the total tax paid by your household. Spousal RRSPs are one of the most effective legal methods.',
      impact: 'high',
      category: 'top',
      estimatedSavings: '$2,000 – $10,000+',
      icon: 'Users',
    });
  }

  // ─── CHILDCARE ───
  if (isYes(answers, 'hasChildren') || isYes(answers, 'paidChildcare')) {
    strategies.push({
      id: 'childcare-deduction',
      title: 'Claim Childcare Expense Deductions',
      description: 'Childcare expenses are deductible in Canada. This includes daycare, before/after school care, day camps, and even some boarding school fees. The deduction is generally claimed by the lower-income spouse.',
      why: 'The childcare deduction directly reduces your taxable income. Depending on the age of your children, you can deduct up to $8,000 per child under 7 and $5,000 per child aged 7–16.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$1,000 – $4,000',
      icon: 'Baby',
    });
  }

  // ─── HOME OFFICE ───
  if (isYes(answers, 'workFromHome')) {
    strategies.push({
      id: 'home-office',
      title: 'Claim Home Office Deductions',
      description: 'If you work from home, you can deduct a portion of your home expenses. Employees can use the simplified flat-rate method ($2/day, up to $500). Self-employed individuals can deduct a proportional share of rent, utilities, internet, and maintenance.',
      why: 'This is an often-overlooked deduction. The CRA allows home office claims for anyone who works from home more than 50% of the time over at least four consecutive weeks.',
      impact: isSelfEmployedOrBusiness(answers) ? 'high' : 'medium',
      category: isSelfEmployedOrBusiness(answers) ? 'top' : 'additional',
      estimatedSavings: isSelfEmployedOrBusiness(answers) ? '$1,500 – $5,000' : '$200 – $500',
      icon: 'Laptop',
    });
  }

  // ─── SELF-EMPLOYED DEDUCTIONS ───
  if (isSelfEmployedOrBusiness(answers)) {
    if (isYes(answers, 'vehicleForWork')) {
      strategies.push({
        id: 'vehicle-deduction',
        title: 'Write Off Vehicle Expenses',
        description: 'As a self-employed individual, you can deduct the business-use portion of your vehicle expenses, including fuel, insurance, maintenance, lease payments, and CCA (depreciation). Keep a detailed mileage log to support your claim.',
        why: 'Vehicle expenses can be substantial. Deducting the business-use percentage directly reduces your self-employment income and the taxes you owe.',
        impact: 'high',
        category: 'additional',
        estimatedSavings: '$1,000 – $5,000+',
        icon: 'Car',
      });
    }

    if (isYes(answers, 'toolsSoftware')) {
      strategies.push({
        id: 'tools-deduction',
        title: 'Deduct Tools & Software Expenses',
        description: 'Business-related tools, software subscriptions, equipment, and supplies are fully deductible. This includes computers, phones, software licenses, cloud services, and professional tools.',
        why: 'These are legitimate business expenses that reduce your net self-employment income, lowering both your income tax and CPP contributions.',
        impact: 'medium',
        category: 'additional',
        estimatedSavings: '$500 – $3,000',
        icon: 'Wrench',
      });
    }

    if (isYes(answers, 'payFamilyMembers')) {
      strategies.push({
        id: 'family-income-split',
        title: 'Income Splitting Through Family Employment',
        description: 'Paying family members a reasonable salary for legitimate work in your business shifts income to lower tax brackets. Ensure the pay is reasonable for the work performed and properly documented.',
        why: 'This effectively splits your business income across multiple people, reducing the overall household tax burden while keeping the money in the family.',
        impact: 'high',
        category: 'additional',
        estimatedSavings: '$2,000 – $8,000+',
        icon: 'Users',
      });
    }

    if (isYes(answers, 'businessTravel')) {
      strategies.push({
        id: 'travel-deduction',
        title: 'Deduct Business Travel & Meal Expenses',
        description: 'Business travel expenses (flights, hotels, transportation) are fully deductible. Business meals are 50% deductible. Keep all receipts and document the business purpose of each expense.',
        why: 'Travel and meal expenses add up quickly. Claiming these deductions can significantly reduce your taxable business income.',
        impact: 'medium',
        category: 'additional',
        estimatedSavings: '$500 – $3,000',
        icon: 'Plane',
      });
    }
  }

  // ─── DONATIONS ───
  if (isYes(answers, 'charitableDonations')) {
    strategies.push({
      id: 'donate-stocks',
      title: 'Donate Appreciated Securities Instead of Cash',
      description: 'If you donate publicly traded securities directly to a charity, you receive a donation tax credit AND pay zero capital gains tax on the appreciation. This is significantly more tax-efficient than selling the stock and donating cash.',
      why: 'Normally, you\'d pay capital gains tax when selling investments. By donating securities directly, you eliminate the capital gains tax entirely while still receiving the full donation credit.',
      impact: 'high',
      category: 'advanced',
      estimatedSavings: '$500 – $5,000+',
      icon: 'Heart',
    });
  }

  // ─── TAX LOSS HARVESTING ───
  if (isYes(answers, 'holdAtLoss')) {
    strategies.push({
      id: 'tax-loss-harvest',
      title: 'Harvest Tax Losses to Offset Gains',
      description: 'Sell investments that are currently at a loss to realize capital losses. These losses can offset capital gains from this year, be carried back 3 years, or carried forward indefinitely to offset future gains.',
      why: 'Tax-loss harvesting is one of the most powerful investment tax strategies. It allows you to reduce your tax bill while potentially reinvesting in similar (but not identical) assets.',
      impact: 'high',
      category: 'top',
      estimatedSavings: '$500 – $10,000+',
      icon: 'TrendingDown',
    });
  }

  // ─── ASSET LOCATION ───
  if (hasInvestmentType(answers, 'Bonds') && hasAccountType(answers, 'Taxable account')) {
    strategies.push({
      id: 'bonds-to-rrsp',
      title: 'Move Bonds to Your RRSP',
      description: 'Bond interest is taxed as regular income — the highest tax rate. By holding bonds inside your RRSP, the interest grows tax-deferred. Keep growth-oriented investments in your TFSA instead.',
      why: 'Asset location optimization ensures you\'re paying the least tax possible on each type of investment income. Interest income is taxed most heavily, so it benefits most from tax sheltering.',
      impact: 'medium',
      category: 'advanced',
      estimatedSavings: '$200 – $2,000',
      icon: 'ArrowRightLeft',
    });
  }

  if (!isYes(answers, 'growthInTFSA') && hasAccountType(answers, 'Taxable account') &&
    (hasInvestmentType(answers, 'Growth stocks') || hasInvestmentType(answers, 'Crypto'))) {
    // Only add if not already covered by tfsa-growth
    if (!strategies.find(s => s.id === 'tfsa-growth')) {
      strategies.push({
        id: 'growth-to-tfsa',
        title: 'Relocate Growth Assets to Your TFSA',
        description: 'Growth-oriented investments like stocks and crypto should be held in your TFSA where all gains are completely tax-free. Holding them in a taxable account means paying capital gains tax on every profitable sale.',
        why: 'The TFSA\'s tax-free growth benefit is most valuable for assets with the highest growth potential. Moving these assets could save you thousands over time.',
        impact: 'high',
        category: 'advanced',
        estimatedSavings: '$1,000 – $10,000+',
        icon: 'ArrowUpRight',
      });
    }
  }

  // ─── RENTAL PROPERTY ───
  if (isYes(answers, 'ownRental')) {
    strategies.push({
      id: 'rental-deductions',
      title: 'Maximize Rental Property Deductions',
      description: 'As a rental property owner, you can deduct mortgage interest, property taxes, insurance, maintenance, repairs, property management fees, and CCA (depreciation). These deductions can significantly reduce your rental income tax.',
      why: 'Many landlords miss legitimate deductions. Properly tracking and claiming all allowable expenses can turn a taxable rental profit into a much smaller taxable amount.',
      impact: 'high',
      category: 'additional',
      estimatedSavings: '$2,000 – $10,000+',
      icon: 'Building',
    });
  }

  // ─── OAS / FUTURE PLANNING ───
  if (isHighIncome(answers) && isLongTermFocus(answers)) {
    strategies.push({
      id: 'oas-planning',
      title: 'Plan TFSA Withdrawals to Avoid OAS Clawbacks',
      description: 'In retirement, if your net income exceeds the OAS clawback threshold (approximately $90,000), you\'ll lose 15 cents of OAS for every dollar above. TFSA withdrawals don\'t count as income, making them ideal for supplementing retirement income without triggering clawbacks.',
      why: 'High-income earners risk losing thousands in OAS benefits. By building a large TFSA now and drawing from it in retirement, you can keep your reportable income below the clawback threshold.',
      impact: 'high',
      category: 'advanced',
      estimatedSavings: '$3,000 – $8,000+ per year in retirement',
      icon: 'Shield',
    });
  }

  // ─── MEDICAL EXPENSES ───
  if (isYes(answers, 'medicalExpenses')) {
    strategies.push({
      id: 'medical-credit',
      title: 'Claim the Medical Expense Tax Credit',
      description: 'Medical expenses exceeding 3% of your net income (or $2,635, whichever is less) qualify for a non-refundable tax credit. This includes prescriptions, dental work, vision care, and many other health-related costs.',
      why: 'The medical expense tax credit is often underutilized. Bundling medical expenses into a single 12-month period can help you exceed the threshold and maximize your credit.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$200 – $2,000',
      icon: 'Stethoscope',
    });
  }

  // ─── SUPPORT DEPENDENT ───
  if (isYes(answers, 'supportDependent')) {
    strategies.push({
      id: 'caregiver-credit',
      title: 'Claim the Canada Caregiver Credit',
      description: 'If you support an elderly or disabled dependent, you may be eligible for the Canada Caregiver Credit. This non-refundable credit can reduce your federal tax by up to $1,200–$2,300 depending on the dependent\'s relationship and income.',
      why: 'This credit recognizes the financial burden of caregiving and provides meaningful tax relief. It\'s available for parents, grandparents, siblings, and other relatives.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$300 – $2,300',
      icon: 'HeartHandshake',
    });
  }

  // ─── MOVING EXPENSES ───
  if (isYes(answers, 'movedForWork')) {
    strategies.push({
      id: 'moving-expenses',
      title: 'Deduct Moving Expenses',
      description: 'If you moved at least 40 km closer to a new work location or school, you can deduct moving expenses including transportation, temporary lodging, meals, and costs of selling/buying a home.',
      why: 'Moving expenses can be substantial and are fully deductible against income earned at the new location. Many people overlook this valuable deduction.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$500 – $5,000+',
      icon: 'Truck',
    });
  }

  // ─── RESP ───
  if (isYes(answers, 'hasChildren') && !isYes(answers, 'hasRESP')) {
    strategies.push({
      id: 'resp-open',
      title: 'Open an RESP for Your Children',
      description: 'The RESP provides tax-deferred growth plus a 20% government match (CESG) on the first $2,500 contributed per year per child — that\'s $500 of free money annually. Lifetime contribution limit is $50,000 per child.',
      why: 'The CESG is an immediate 20% return on your investment, which is hard to beat. Combined with tax-deferred growth, the RESP is the most efficient way to save for your children\'s education.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$500+ per year (CESG)',
      icon: 'GraduationCap',
    });
  }

  // ─── WORK EXPENSES ───
  if (isYes(answers, 'payWorkExpenses') && !isSelfEmployedOrBusiness(answers)) {
    strategies.push({
      id: 'employment-expenses',
      title: 'Deduct Unreimbursed Employment Expenses',
      description: 'If your employer requires you to pay for certain work expenses and you have a signed T2200 form, you can deduct these costs. This may include supplies, phone, vehicle use, and professional dues.',
      why: 'Many employees don\'t realize they can deduct work expenses if they have the proper documentation from their employer.',
      impact: 'low',
      category: 'additional',
      estimatedSavings: '$200 – $1,500',
      icon: 'FileText',
    });
  }

  // ─── RRSP TIMING ───
  if (answers.rrspTiming === 'After tax season' && !isYes(answers, 'rrspMaxed')) {
    strategies.push({
      id: 'rrsp-timing',
      title: 'Contribute to Your RRSP Before the Deadline',
      description: 'Contributing before the March 1 deadline allows you to claim the deduction on last year\'s tax return. This can result in an immediate tax refund that you can reinvest.',
      why: 'Early RRSP contributions give you an extra year of tax-deferred growth and an immediate tax benefit. The refund can be reinvested for compound growth.',
      impact: 'medium',
      category: 'additional',
      estimatedSavings: '$500 – $3,000',
      icon: 'Calendar',
    });
  }

  // ─── PENSION INCOME SPLITTING ───
  if (isYes(answers, 'hasPension') && isMarried(answers)) {
    strategies.push({
      id: 'pension-split',
      title: 'Split Pension Income With Your Spouse',
      description: 'Up to 50% of eligible pension income can be allocated to your spouse on your tax returns. This can significantly reduce the higher-earning spouse\'s tax burden.',
      why: 'Pension income splitting is one of the simplest and most effective tax reduction strategies for retired couples. It requires no actual transfer of money — just an allocation on your tax returns.',
      impact: 'high',
      category: 'advanced',
      estimatedSavings: '$1,000 – $5,000+',
      icon: 'Split',
    });
  }

  // Sort: top strategies first, then additional, then advanced
  const categoryOrder: Record<StrategyCategory, number> = { top: 0, additional: 1, advanced: 2 };
  const impactOrder: Record<ImpactLevel, number> = { high: 0, medium: 1, low: 2 };

  strategies.sort((a, b) => {
    if (categoryOrder[a.category] !== categoryOrder[b.category]) {
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  return strategies;
}

export function generateSummary(answers: QuizAnswers): {
  incomeProfile: string;
  missedOpportunities: string[];
} {
  const incomeLevel = getIncomeLevel(answers);
  const employment = answers.employmentStatus as string || 'Not specified';
  const province = answers.province as string || 'Not specified';

  let incomeRange = 'Not specified';
  if (incomeLevel === 1) incomeRange = 'Under $50,000';
  else if (incomeLevel === 2) incomeRange = '$50,000 – $100,000';
  else if (incomeLevel === 3) incomeRange = '$100,000 – $150,000';
  else if (incomeLevel === 4) incomeRange = 'Over $150,000';

  const incomeProfile = `${employment} in ${province} earning ${incomeRange}`;

  const missedOpportunities: string[] = [];

  if (!isYes(answers, 'tfsaMaxed')) {
    missedOpportunities.push('TFSA contribution room not maximized');
  }
  if (incomeLevel >= 3 && !isYes(answers, 'rrspMaxed')) {
    missedOpportunities.push('RRSP contribution room available at a high marginal rate');
  }
  if (isYes(answers, 'planBuyHome') && !isYes(answers, 'hasFHSA')) {
    missedOpportunities.push('No FHSA despite planning to buy a home');
  }
  if (!isYes(answers, 'growthInTFSA') && hasInvestmentType(answers, 'Growth stocks')) {
    missedOpportunities.push('Growth investments not sheltered in TFSA');
  }
  if (isMarried(answers) && getPartnerIncomeLevel(answers) < getIncomeLevel(answers) - 1) {
    missedOpportunities.push('Income splitting opportunity with lower-earning spouse');
  }
  if (isYes(answers, 'holdAtLoss')) {
    missedOpportunities.push('Unrealized investment losses that could offset gains');
  }
  if (isYes(answers, 'hasChildren') && !isYes(answers, 'hasRESP')) {
    missedOpportunities.push('No RESP — missing free government grants for education');
  }

  return { incomeProfile, missedOpportunities };
}

export function estimateTotalSavings(strategies: TaxStrategy[]): string {
  let minTotal = 0;
  let maxTotal = 0;

  strategies.forEach(s => {
    if (!s.estimatedSavings) return;
    const match = s.estimatedSavings.match(/\$([\d,]+)\s*[–-]\s*\$([\d,]+)/);
    if (match) {
      minTotal += parseInt(match[1].replace(/,/g, ''));
      maxTotal += parseInt(match[2].replace(/,/g, ''));
    }
  });

  if (maxTotal === 0) return '$0';
  if (minTotal >= 1000) {
    return `$${(minTotal / 1000).toFixed(0)}k – $${(maxTotal / 1000).toFixed(0)}k+`;
  }
  return `$${minTotal.toLocaleString()} – $${maxTotal.toLocaleString()}+`;
}
