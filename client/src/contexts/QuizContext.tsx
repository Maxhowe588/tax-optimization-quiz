import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { quizSections, QuizAnswers, QuizSection } from '@/lib/quizData';
import { TaxStrategy, generateRecommendations, generateSummary, estimateTotalSavings } from '@/lib/taxEngine';

interface QuizState {
  currentSectionIndex: number;
  answers: QuizAnswers;
  isComplete: boolean;
  strategies: TaxStrategy[];
  summary: { incomeProfile: string; missedOpportunities: string[] };
  totalSavings: string;
}

interface QuizContextType extends QuizState {
  currentSection: QuizSection;
  visibleSections: QuizSection[];
  totalVisibleSections: number;
  progressPercent: number;
  setAnswer: (questionId: string, value: string | string[]) => void;
  goNext: () => void;
  goPrev: () => void;
  goToSection: (index: number) => void;
  restart: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}

function getVisibleSections(answers: QuizAnswers): QuizSection[] {
  return quizSections.filter(section => {
    // Self-employed section only shows for self-employed, business owners, or contractors
    if (section.id === 'selfEmployed') {
      const status = answers.employmentStatus as string;
      return status === 'Self-employed' || status === 'Business owner' || status === 'Contractor';
    }
    return true;
  });
}

function isSectionComplete(section: QuizSection, answers: QuizAnswers): boolean {
  return section.questions.every(q => {
    // Check if question is conditional and should be hidden
    if (q.conditionalOn) {
      const parentVal = answers[q.conditionalOn.questionId];
      if (Array.isArray(q.conditionalOn.value)) {
        if (!q.conditionalOn.value.includes(parentVal as string)) return true; // skip hidden
      } else {
        if (parentVal !== q.conditionalOn.value) return true; // skip hidden
      }
    }
    const answer = answers[q.id];
    if (q.type === 'multi-select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== '';
  });
}

const initialState: QuizState = {
  currentSectionIndex: -1, // -1 = welcome screen
  answers: {},
  isComplete: false,
  strategies: [],
  summary: { incomeProfile: '', missedOpportunities: [] },
  totalSavings: '$0',
};

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuizState>(initialState);

  const visibleSections = useMemo(
    () => getVisibleSections(state.answers),
    [state.answers]
  );

  const totalVisibleSections = visibleSections.length;

  const currentSection = visibleSections[state.currentSectionIndex] || visibleSections[0];

  const progressPercent = state.currentSectionIndex < 0
    ? 0
    : Math.round(((state.currentSectionIndex + 1) / totalVisibleSections) * 100);

  const canGoNext = state.currentSectionIndex < 0
    ? true
    : isSectionComplete(currentSection, state.answers);

  const canGoPrev = state.currentSectionIndex > 0;

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const goNext = useCallback(() => {
    setState(prev => {
      const visible = getVisibleSections(prev.answers);
      const nextIndex = prev.currentSectionIndex + 1;
      if (nextIndex >= visible.length) {
        // Quiz complete — generate results
        const strategies = generateRecommendations(prev.answers);
        const summary = generateSummary(prev.answers);
        const totalSavings = estimateTotalSavings(strategies);
        return {
          ...prev,
          isComplete: true,
          strategies,
          summary,
          totalSavings,
        };
      }
      return { ...prev, currentSectionIndex: nextIndex };
    });
  }, []);

  const goPrev = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSectionIndex: Math.max(0, prev.currentSectionIndex - 1),
      isComplete: false,
    }));
  }, []);

  const goToSection = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentSectionIndex: index,
      isComplete: false,
    }));
  }, []);

  const restart = useCallback(() => {
    setState(initialState);
  }, []);

  const value: QuizContextType = {
    ...state,
    currentSection,
    visibleSections,
    totalVisibleSections,
    progressPercent,
    setAnswer,
    goNext,
    goPrev,
    goToSection,
    restart,
    canGoNext,
    canGoPrev,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}
