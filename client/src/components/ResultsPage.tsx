/*
 * ResultsPage — Financial Dashboard
 * 7 sections: Net Worth, Cash Flow, Tax Analysis, Missed Opportunities,
 * Tax Efficiency Score, Strategy Recommendations, See the Math
 * Nordic Fintech design with Recharts
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, TrendingUp, TrendingDown, PiggyBank, Home, Users,
  Laptop, Car, Wrench, Heart, Building, Shield, ArrowRightLeft,
  Clock, Calendar, FileText, GraduationCap, Truck, Plane,
  RotateCcw, Share2, BadgePercent, Target, AlertCircle, Baby,
  HeartHandshake, Stethoscope, ChevronDown, ChevronUp, Sparkles, Leaf,
  Wallet, DollarSign, BarChart3, Gauge, ArrowRight, Info,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/contexts/QuizContext';
import { TaxStrategy, ImpactLevel, formatCurrency } from '@/lib/taxEngine';
import { toast } from 'sonner';

const RESULTS_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663475534240/GNkNp5vXqFrHNeUUdf42JX/results-header-8xWeWN2xc27X6yHHbbe7Tc.webp';

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, TrendingDown, PiggyBank, Home, Users, Laptop, Car,
  Wrench, Heart, Building, Shield, ArrowRightLeft, Clock, Calendar,
  FileText, GraduationCap, Truck, Plane, ArrowUpRight, Baby,
  HeartHandshake, Stethoscope, BadgePercent, Target,
};

const CHART_COLORS = ['#2d6a4f', '#52b788', '#95d5b2', '#b7e4c7', '#d8f3dc'];
const CHART_COLORS_ALT = ['#2d6a4f', '#d4a373'];

const impactColors: Record<ImpactLevel, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-forest/10', text: 'text-forest', label: 'High Impact' },
  medium: { bg: 'bg-gold/15', text: 'text-gold', label: 'Medium Impact' },
  low: { bg: 'bg-charcoal-light/10', text: 'text-charcoal-light', label: 'Low Impact' },
};

// ─── SECTION WRAPPER ───

function DashboardSection({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
          <Icon className="w-5 h-5 text-forest" />
        </div>
        <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── STAT CARD ───

function StatCard({ label, value, subtext, accent }: {
  label: string; value: string; subtext?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${accent ? 'bg-forest/5 border-forest/20' : 'bg-muted/50 border-border/40'}`}>
      <p className="text-xs font-medium text-charcoal-light mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-forest' : 'text-charcoal'}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </p>
      {subtext && <p className="text-xs text-charcoal-light/70 mt-0.5">{subtext}</p>}
    </div>
  );
}

// ─── EFFICIENCY GAUGE ───

function EfficiencyGauge({ score, label, max = 25 }: { score: number; label: string; max?: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-charcoal-light">{label}</span>
        <span className="font-medium text-charcoal">{score}/{max}</span>
      </div>
      <div className="h-2 bg-sage-light rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-forest rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

// ─── STRATEGY CARD ───

function StrategyCard({ strategy, index }: { strategy: TaxStrategy; index: number }) {
  const [showSteps, setShowSteps] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const Icon = iconMap[strategy.icon] || Target;
  const impact = impactColors[strategy.impact];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
      className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-forest" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-charcoal text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {strategy.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${impact.bg} ${impact.text}`}>
              {impact.label}
            </span>
          </div>

          <p className="text-sm text-charcoal-light leading-relaxed mb-3">
            {strategy.description}
          </p>

          <div className="bg-sage-light/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-forest-light font-medium mb-1">Why this works</p>
            <p className="text-sm text-charcoal-light leading-relaxed">{strategy.why}</p>
          </div>

          {/* Estimated savings */}
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-forest" />
            <span className="text-sm font-semibold text-forest">
              Estimated savings: {formatCurrency(strategy.estimatedSavings)}/year
            </span>
          </div>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-2">
            {strategy.steps && strategy.steps.length > 0 && (
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-light hover:text-charcoal px-3 py-1.5 rounded-full border border-border/60 hover:bg-sage-light transition-all"
              >
                {showSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showSteps ? 'Hide Steps' : 'See Steps'}
              </button>
            )}
            {strategy.math && (
              <button
                onClick={() => setShowMath(!showMath)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-light hover:text-charcoal px-3 py-1.5 rounded-full border border-border/60 hover:bg-sage-light transition-all"
              >
                {showMath ? <ChevronUp className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                {showMath ? 'Hide Math' : 'See the Math'}
              </button>
            )}
          </div>

          {/* Steps expandable */}
          <AnimatePresence>
            {showSteps && strategy.steps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ol className="mt-3 space-y-2 pl-1">
                  {strategy.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-charcoal-light">
                      <span className="w-5 h-5 rounded-full bg-forest/10 text-forest text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Math expandable */}
          <AnimatePresence>
            {showMath && strategy.math && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 bg-muted/50 rounded-xl p-4 border border-border/40">
                  <p className="text-xs font-semibold text-charcoal mb-2 uppercase tracking-wide">How this was calculated</p>
                  <div className="space-y-1.5 mb-3">
                    {strategy.math.inputs.map((inp, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-charcoal-light">{inp.label}</span>
                        <span className="font-medium text-charcoal">{inp.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/40 pt-2 mt-2">
                    <p className="text-xs text-charcoal-light mb-1">Formula: <span className="font-mono text-charcoal">{strategy.math.formula}</span></p>
                    <p className="text-sm font-semibold text-forest">Result: {strategy.math.result}</p>
                  </div>
                  {strategy.math.assumedRate && (
                    <p className="text-xs text-charcoal-light/60 mt-2 italic">
                      Estimate based on an assumed marginal tax rate of {strategy.math.assumedRate}%
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CUSTOM TOOLTIP ───

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-lg">
      {label && <p className="text-xs font-medium text-charcoal-light mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── MAIN RESULTS PAGE ───

export default function ResultsPage() {
  const { analysis, restart } = useQuiz();

  if (!analysis) return null;

  const { netWorth, cashFlow, tax, efficiencyScore, missedOpportunityTotal, missedOpportunities, strategies, reallocations, summary } = analysis;

  const topStrategies = strategies.filter(s => s.category === 'top').slice(0, 3);
  const additionalStrategies = strategies.filter(s => s.category === 'additional');
  const advancedStrategies = strategies.filter(s => s.category === 'advanced');
  const totalSavings = strategies.reduce((sum, s) => sum + s.estimatedSavings, 0);

  const handleShare = async () => {
    const text = `I just discovered ${strategies.length} tax-saving strategies! Estimated savings: ${formatCurrency(totalSavings)}/year. Try the Canadian Tax Optimization Quiz!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Tax Optimization Results', text, url: window.location.href }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  };

  // Chart data
  const netWorthPieData = [
    { name: 'Cash', value: netWorth.cash },
    { name: 'Investments', value: netWorth.investments },
    { name: 'Property', value: netWorth.property },
  ].filter(d => d.value > 0);

  const assetsVsDebtData = [
    { name: 'Assets', amount: netWorth.totalAssets },
    { name: 'Liabilities', amount: netWorth.totalLiabilities },
  ];

  const cashFlowData = [
    { name: 'Income', amount: cashFlow.monthlyIncome },
    { name: 'Expenses', amount: cashFlow.monthlyExpenses },
  ];

  const taxComparisonData = [
    { name: 'Current Tax', amount: tax.estimatedTaxCurrent },
    { name: 'Optimized Tax', amount: tax.optimizedTax },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={RESULTS_IMG} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-6 sm:pt-16 sm:pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-forest/10 text-forest px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Your Financial X-Ray
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4 leading-tight">
              Your Tax Optimization
              <br />
              <span className="text-forest">Dashboard</span>
            </h1>
            <p className="text-lg text-charcoal-light max-w-2xl">
              {summary.incomeProfile}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-2 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard label="Net Worth" value={formatCurrency(netWorth.netWorth)} accent />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <StatCard label="Potential Savings" value={`${formatCurrency(totalSavings)}/yr`} accent />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard label="Tax Efficiency" value={`${efficiencyScore.total}/100`} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <StatCard label="Strategies Found" value={`${strategies.length}`} />
          </motion.div>
        </div>
      </div>

      {/* Dashboard sections */}
      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">

        {/* SECTION 1: NET WORTH */}
        <DashboardSection title="Net Worth Breakdown" icon={Wallet} delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div>
              <p className="text-sm font-medium text-charcoal mb-3">Asset Allocation</p>
              {netWorthPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={netWorthPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {netWorthPieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value: string) => <span className="text-xs text-charcoal-light">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-charcoal-light/60">
                  No asset data provided
                </div>
              )}
            </div>
            {/* Bar chart */}
            <div>
              <p className="text-sm font-medium text-charcoal mb-3">Assets vs Liabilities</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={assetsVsDebtData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 90)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#666' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Amount" radius={[6, 6, 0, 0]}>
                    {assetsVsDebtData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS_ALT[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <StatCard label="Total Assets" value={formatCurrency(netWorth.totalAssets)} />
            <StatCard label="Total Liabilities" value={formatCurrency(netWorth.totalLiabilities)} />
            <StatCard label="Net Worth" value={formatCurrency(netWorth.netWorth)} accent />
            <StatCard label="Cash Holdings" value={formatCurrency(netWorth.cash)} />
          </div>
        </DashboardSection>

        {/* SECTION 2: CASH FLOW */}
        <DashboardSection title="Cash Flow Analysis" icon={BarChart3} delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-charcoal mb-3">Monthly Inflow vs Outflow</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cashFlowData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 90)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#666' }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Amount" radius={[6, 6, 0, 0]}>
                    {cashFlowData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS_ALT[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 content-start">
              <StatCard label="Monthly Income" value={formatCurrency(cashFlow.monthlyIncome)} />
              <StatCard label="Monthly Expenses" value={formatCurrency(cashFlow.monthlyExpenses)} />
              <StatCard label="Monthly Surplus" value={formatCurrency(cashFlow.monthlySurplus)} accent={cashFlow.monthlySurplus > 0} />
              <StatCard label="Savings Rate" value={`${cashFlow.savingsRate}%`} accent={cashFlow.savingsRate > 20} />
            </div>
          </div>
        </DashboardSection>

        {/* SECTION 3: TAX ANALYSIS */}
        <DashboardSection title="Tax Analysis" icon={DollarSign} delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-charcoal mb-3">Current vs Optimized Tax</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={taxComparisonData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 90)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#666' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Tax" radius={[6, 6, 0, 0]}>
                    {taxComparisonData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS_ALT[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 content-start">
              <StatCard label="Annual Income" value={formatCurrency(tax.annualIncome)} />
              <StatCard label="Marginal Rate" value={`${Math.round(tax.marginalRate * 100)}%`} />
              <StatCard label="Current Tax" value={formatCurrency(tax.estimatedTaxCurrent)} />
              <StatCard label="Optimized Tax" value={formatCurrency(tax.optimizedTax)} accent />
              <div className="col-span-2">
                <StatCard label="Potential Tax Savings" value={formatCurrency(tax.taxSaved)} subtext={`Effective rate: ${tax.effectiveTaxRate}%`} accent />
              </div>
            </div>
          </div>
          <p className="text-xs text-charcoal-light/60 mt-4 italic">
            Estimates based on an assumed marginal tax rate of {Math.round(tax.marginalRate * 100)}%. Actual rates vary by province and individual circumstances.
          </p>
        </DashboardSection>

        {/* SECTION 4: MISSED OPPORTUNITIES */}
        {missedOpportunities.length > 0 && (
          <DashboardSection title="Missed Opportunities" icon={AlertCircle} delay={0.25}>
            <div className="bg-forest/5 border border-forest/20 rounded-xl p-5 mb-5">
              <p className="text-sm text-charcoal-light mb-1">You are leaving approximately</p>
              <p className="text-3xl font-bold text-forest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {formatCurrency(missedOpportunityTotal)}<span className="text-lg font-medium text-charcoal-light">/year</span>
              </p>
              <p className="text-sm text-charcoal-light mt-1">on the table</p>
            </div>
            <div className="space-y-3">
              {missedOpportunities.map((opp, i) => (
                <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-muted/50 border border-border/40">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{opp.label}</p>
                    <p className="text-xs text-charcoal-light mt-0.5">{opp.explanation}</p>
                  </div>
                  <span className="text-sm font-bold text-forest whitespace-nowrap">{formatCurrency(opp.amount)}/yr</span>
                </div>
              ))}
            </div>
          </DashboardSection>
        )}

        {/* SECTION 5: TAX EFFICIENCY SCORE */}
        <DashboardSection title="Tax Efficiency Score" icon={Gauge} delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            {/* Big score circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.92 0.03 155)" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="oklch(0.40 0.10 155)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - efficiencyScore.total / 100) }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-charcoal" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {efficiencyScore.total}
                  </span>
                  <span className="text-xs text-charcoal-light">out of 100</span>
                </div>
              </div>
              <p className="text-sm font-medium text-charcoal mt-2">
                {efficiencyScore.total >= 75 ? 'Excellent' : efficiencyScore.total >= 50 ? 'Good' : efficiencyScore.total >= 25 ? 'Fair' : 'Needs Work'}
              </p>
            </div>
            {/* Breakdown bars */}
            <div className="space-y-4">
              <EfficiencyGauge score={efficiencyScore.accountUsage} label="Account Usage" />
              <EfficiencyGauge score={efficiencyScore.assetLocation} label="Asset Location" />
              <EfficiencyGauge score={efficiencyScore.incomeOptimization} label="Income Optimization" />
              <EfficiencyGauge score={efficiencyScore.deductionsUsed} label="Deductions Used" />
            </div>
          </div>
        </DashboardSection>

        {/* SECTION 5.5: REALLOCATION SUGGESTIONS */}
        {reallocations.length > 0 && (
          <DashboardSection title="Suggested Reallocation" icon={ArrowRight} delay={0.35}>
            <p className="text-sm text-charcoal-light mb-4">
              Based on your cash holdings and registered account room, here are suggested moves:
            </p>
            <div className="space-y-3">
              {reallocations.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-forest/5 border border-forest/15">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-charcoal-light">{r.from}</span>
                    <ArrowRight className="w-4 h-4 text-forest" />
                    <span className="text-sm font-medium text-forest">{r.to}</span>
                  </div>
                  <span className="text-lg font-bold text-forest ml-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {formatCurrency(r.amount)}
                  </span>
                </div>
              ))}
              <p className="text-xs text-charcoal-light/60 italic mt-2">
                These suggestions maintain a 3–6 month emergency fund in accessible accounts.
              </p>
            </div>
          </DashboardSection>
        )}

        {/* SECTION 6: STRATEGY RECOMMENDATIONS */}
        {topStrategies.length > 0 && (
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-forest" />
              </div>
              <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Top 3 Strategies
              </h2>
            </motion.div>
            <div className="space-y-4">
              {topStrategies.map((s, i) => <StrategyCard key={s.id} strategy={s} index={i} />)}
            </div>
          </div>
        )}

        {additionalStrategies.length > 0 && (
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <BadgePercent className="w-4 h-4 text-gold" />
              </div>
              <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Additional Strategies
              </h2>
            </motion.div>
            <div className="space-y-4">
              {additionalStrategies.map((s, i) => <StrategyCard key={s.id} strategy={s} index={i + 3} />)}
            </div>
          </div>
        )}

        {advancedStrategies.length > 0 && (
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-sage/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-forest" />
              </div>
              <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Advanced Strategies
              </h2>
            </motion.div>
            <div className="space-y-4">
              {advancedStrategies.map((s, i) => <StrategyCard key={s.id} strategy={s} index={i + 6} />)}
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            onClick={handleShare}
            variant="outline"
            className="rounded-full border-border text-charcoal-light hover:bg-sage-light hover:text-charcoal"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          <Button
            onClick={restart}
            variant="outline"
            className="rounded-full border-border text-charcoal-light hover:bg-sage-light hover:text-charcoal"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Quiz
          </Button>
        </div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-sage-light/50 rounded-2xl p-6 border border-sage/30">
          <p className="text-sm text-charcoal-light leading-relaxed">
            <strong className="text-charcoal">Disclaimer:</strong> This tool provides general tax optimization
            suggestions based on your inputs and assumed marginal tax rates. It is not a substitute for professional
            tax advice. Tax laws change frequently, and individual circumstances vary. Please consult a qualified
            Canadian tax professional before implementing any strategies. All recommendations comply with Canadian
            tax regulations and focus on legal optimization, deductions, and deferral strategies.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
