/*
 * Home Page — Canadian Tax Optimization Quiz
 * Design: Nordic Fintech — warm cream, forest green, DM Serif Display + DM Sans
 * Orchestrates the quiz flow: Welcome → Sections → Results
 */

import { QuizProvider, useQuiz } from '@/contexts/QuizContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuizSectionView from '@/components/QuizSectionView';
import ResultsPage from '@/components/ResultsPage';

function QuizFlow() {
  const { currentSectionIndex, isComplete } = useQuiz();

  if (isComplete) {
    return <ResultsPage />;
  }

  if (currentSectionIndex < 0) {
    return <WelcomeScreen />;
  }

  return <QuizSectionView />;
}

export default function Home() {
  return (
    <QuizProvider>
      <QuizFlow />
    </QuizProvider>
  );
}
