/*
 * ResultsPage — Nordic Fintech style
 * Asymmetric two-column layout on desktop
 * Summary profile on left, strategy cards on right
 * Staggered entrance animations
 */

import { motion } from 'framer-motion';
import {
  ArrowUpRight, TrendingUp, TrendingDown, PiggyBank, Home, Users,
  Laptop, Car, Wrench, Heart, Building, Shield, ArrowRightLeft,
  Clock, Calendar, FileText, GraduationCap, Truck, Plane,
  RotateCcw, Share2, BadgePercent, Target, AlertCircle, Baby,
  HeartHandshake, Stethoscope, ChevronRight, Sparkles, Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/contexts/QuizContext';
import { TaxStrategy, ImpactLevel } from '@/lib/taxEngine';
import { toast } from 'sonner';

const RESULTS_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663475534240/GNkNp5vXqFrHNeUUdf42JX/results-header-8xWeWN2xc27X6yHHbbe7Tc.webp';

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, TrendingDown, PiggyBank, Home, Users, Laptop, Car,
  Wrench, Heart, Building, Shield, ArrowRightLeft, Clock, Calendar,
  FileText, GraduationCap, Truck, Plane, ArrowUpRight, Baby,
  HeartHandshake, Stethoscope, BadgePercent, Target, Split: Users,
};

const impactColors: Record<ImpactLevel, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-forest/10', text: 'text-forest', label: 'High Impact' },
  medium: { bg: 'bg-gold/15', text: 'text-gold', label: 'Medium Impact' },
  low: { bg: 'bg-charcoal-light/10', text: 'text-charcoal-light', label: 'Low Impact' },
};

function StrategyCard({ strategy, index }: { strategy: TaxStrategy; index: number }) {
  const Icon = iconMap[strategy.icon] || Target;
  const impact = impactColors[strategy.impact];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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
            <p className="text-sm text-charcoal-light leading-relaxed">
              {strategy.why}
            </p>
          </div>

          {strategy.estimatedSavings && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-charcoal">
                Estimated savings: {strategy.estimatedSavings}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsPage() {
  const { strategies, summary, totalSavings, restart } = useQuiz();

  const topStrategies = strategies.filter(s => s.category === 'top').slice(0, 3);
  const additionalStrategies = strategies.filter(s => s.category === 'additional');
  const advancedStrategies = strategies.filter(s => s.category === 'advanced');

  const handleShare = async () => {
    const text = `I just discovered ${strategies.length} tax-saving strategies using the Canadian Tax Optimization Quiz! My estimated potential savings: ${totalSavings}. Try it yourself!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Tax Optimization Results', text, url: window.location.href });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={RESULTS_IMG} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-8 sm:pt-16 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-forest/10 text-forest px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Your Personalized Results
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4 leading-tight">
              Your Tax Optimization
              <br />
              <span className="text-forest">Strategy Report</span>
            </h1>
            <p className="text-lg text-charcoal-light max-w-2xl">
              Based on your answers, we've identified <strong className="text-charcoal">{strategies.length} strategies</strong> that
              could help you save on your Canadian taxes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Summary cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-2 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
          >
            <p className="text-sm text-charcoal-light mb-1">Estimated Total Savings</p>
            <p className="text-2xl font-bold text-forest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {totalSavings}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
          >
            <p className="text-sm text-charcoal-light mb-1">Strategies Found</p>
            <p className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {strategies.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
          >
            <p className="text-sm text-charcoal-light mb-1">High Impact</p>
            <p className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {strategies.filter(s => s.impact === 'high').length}
            </p>
          </motion.div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Left sidebar — Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm sticky top-4"
            >
              <h3 className="text-lg text-charcoal mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Your Profile
              </h3>
              <p className="text-sm text-charcoal-light leading-relaxed mb-6">
                {summary.incomeProfile}
              </p>

              {summary.missedOpportunities.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-gold" />
                    <h4 className="text-sm font-semibold text-charcoal" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Key Opportunities
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {summary.missedOpportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-charcoal-light">
                        <ChevronRight className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="border-t border-border/60 mt-6 pt-6 space-y-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full rounded-full border-border text-charcoal-light hover:bg-sage-light hover:text-charcoal"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
                <Button
                  onClick={restart}
                  variant="outline"
                  className="w-full rounded-full border-border text-charcoal-light hover:bg-sage-light hover:text-charcoal"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart Quiz
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right — Strategies */}
          <div className="space-y-10">
            {/* Top 3 */}
            {topStrategies.length > 0 && (
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-forest" />
                  </div>
                  <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Top Strategies
                  </h2>
                </motion.div>
                <div className="space-y-4">
                  {topStrategies.map((s, i) => (
                    <StrategyCard key={s.id} strategy={s} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Additional */}
            {additionalStrategies.length > 0 && (
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <BadgePercent className="w-4 h-4 text-gold" />
                  </div>
                  <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Additional Strategies
                  </h2>
                </motion.div>
                <div className="space-y-4">
                  {additionalStrategies.map((s, i) => (
                    <StrategyCard key={s.id} strategy={s} index={i + topStrategies.length} />
                  ))}
                </div>
              </div>
            )}

            {/* Advanced */}
            {advancedStrategies.length > 0 && (
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <div className="w-8 h-8 rounded-lg bg-sage/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-forest" />
                  </div>
                  <h2 className="text-xl text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Advanced Strategies
                  </h2>
                </motion.div>
                <div className="space-y-4">
                  {advancedStrategies.map((s, i) => (
                    <StrategyCard key={s.id} strategy={s} index={i + topStrategies.length + additionalStrategies.length} />
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-sage-light/50 rounded-2xl p-6 border border-sage/30"
            >
              <p className="text-sm text-charcoal-light leading-relaxed">
                <strong className="text-charcoal">Disclaimer:</strong> This tool provides general tax optimization
                suggestions based on your inputs. It is not a substitute for professional tax advice. Tax laws change
                frequently, and individual circumstances vary. Please consult a qualified Canadian tax professional
                before implementing any strategies. All recommendations comply with Canadian tax regulations and
                focus on legal optimization, deductions, and deferral strategies.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
