/*
 * ProgressBar — Nordic Fintech style
 * Organic thin line that grows with quiz progress
 * Forest green fill on cream background
 */

import { motion } from 'framer-motion';
import { useQuiz } from '@/contexts/QuizContext';

export default function ProgressBar() {
  const { progressPercent, currentSectionIndex, totalVisibleSections } = useQuiz();

  if (currentSectionIndex < 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-charcoal-light">
          Step {currentSectionIndex + 1} of {totalVisibleSections}
        </span>
        <span className="text-sm font-medium text-forest">
          {progressPercent}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-sage-light rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-forest rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
