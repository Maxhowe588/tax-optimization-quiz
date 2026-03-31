import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { quizSections, QuizAnswers, QuizSection } from '@/lib/quizData';
import { FullAnalysis, generateFullAnalysis } from '@/lib/taxEngine';

interface QuizState {
  currentSectionIndex: number;
  answers: QuizAnswers;
  isComplete: boolean;
  analysis: FullAnalysis | null;
}

interface QuizContextType extends QuizState {
  currentSection: QuizSection;
  visibleSections: QuizSection[];
  totalVisibleSections: number;
  progressPercent: number;
  currentLayer: number;
  layerLabel: string;
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
    if (!section.conditionalOn) return true;
    const { questionId, value } = section.conditionalOn;
    const answer = answers[questionId];
    if (Array.isArray(value)) {
      return value.includes(answer as string);
    }
    return answer === value;
  });
}

function isQuestionVisible(
  questionId: string,
  conditionalOn: QuizSection['questions'][0]['conditionalOn'],
  answers: QuizAnswers
): boolean {
  if (!conditionalOn) return true;
  const parentVal = answers[conditionalOn.questionId];

  if (conditionalOn.negate) {
    // Show when value does NOT match (for debt interest rate fields)
    if (typeof parentVal === 'string') {
      const numVal = parseFloat(parentVal.replace(/[^0-9.-]/g, ''));
      if (conditionalOn.value === '0') {
        return !isNaN(numVal) && numVal > 0;
      }
    }
    return parentVal !== conditionalOn.value;
  }

  if (Array.isArray(conditionalOn.value)) {
    return conditionalOn.value.includes(parentVal as string);
  }
  return parentVal === conditionalOn.value;
}

function isSectionComplete(section: QuizSection, answers: QuizAnswers): boolean {
  return section.questions.every(q => {
    if (!isQuestionVisible(q.id, q.conditionalOn, answers)) return true;
    const answer = answers[q.id];
    if (q.type === 'multi-select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    // Currency and percentage fields: 0 is a valid answer, empty string is not
    if (q.type === 'currency' || q.type === 'percentage') {
      return answer !== undefined && answer !== '';
    }
    return answer !== undefined && answer !== '';
  });
}

const initialState: QuizState = {
  currentSectionIndex: -1,
  answers: {},
  isComplete: false,
  analysis: null,
};

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuizState>(initialState);

  const visibleSections = useMemo(
    () => getVisibleSections(state.answers),
    [state.answers]
  );

  const totalVisibleSections = visibleSections.length;
  const currentSection = visibleSections[state.currentSectionIndex] || visibleSections[0];
  const currentLayer = currentSection?.layer || 1;
  const layerLabel = currentSection?.layerLabel || 'Basic Info';

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
        const analysis = generateFullAnalysis(prev.answers);
        return { ...prev, isComplete: true, analysis };
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
    setState(prev => ({ ...prev, currentSectionIndex: index, isComplete: false }));
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
    currentLayer,
    layerLabel,
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
