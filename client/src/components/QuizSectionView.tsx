/*
 * QuizSectionView — Nordic Fintech style
 * Renders a full quiz section with questions, navigation, and smooth transitions
 * Card-based layout with generous padding
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, User, Briefcase, PiggyBank, Home,
  Users, Receipt, Building2, BadgePercent, TrendingUp, Clock,
  Sunset, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/contexts/QuizContext';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';

const iconMap: Record<string, React.ElementType> = {
  User, Briefcase, PiggyBank, Home, Users, Receipt,
  Building2, BadgePercent, TrendingUp, Clock, Sunset, Target,
};

export default function QuizSectionView() {
  const {
    currentSection, currentSectionIndex, canGoNext, canGoPrev,
    goNext, goPrev, totalVisibleSections,
  } = useQuiz();

  const isLastSection = currentSectionIndex === totalVisibleSections - 1;

  const SectionIcon = iconMap[currentSection.icon] || User;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar with progress */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressBar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Section header */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center mb-4"
                >
                  <SectionIcon className="w-6 h-6 text-forest" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl text-charcoal mb-2">
                  {currentSection.title}
                </h2>
                <p className="text-charcoal-light">
                  {currentSection.subtitle}
                </p>
              </div>

              {/* Questions card */}
              <div className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8 shadow-sm">
                {currentSection.questions.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={!canGoPrev}
                  className="rounded-full px-6 border-border text-charcoal-light hover:bg-sage-light hover:text-charcoal disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="rounded-full px-8 bg-forest hover:bg-forest-light text-white shadow-md shadow-forest/15 disabled:opacity-40 disabled:shadow-none transition-all duration-200"
                >
                  {currentSectionIndex === -1 ? 'Get Started' : isLastSection ? 'See My Results' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {!canGoNext && currentSectionIndex >= 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-charcoal-light/60 mt-4"
                >
                  Please answer all questions to continue
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
