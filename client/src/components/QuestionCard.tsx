/*
 * QuestionCard — Nordic Fintech style
 * Renders a single quiz question with appropriate input type
 * Supports: input, currency, percentage, select, radio, yes-no, multi-select
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, DollarSign, Percent } from 'lucide-react';
import { QuizQuestion } from '@/lib/quizData';
import { useQuiz } from '@/contexts/QuizContext';

interface Props {
  question: QuizQuestion;
  index: number;
}

export default function QuestionCard({ question, index }: Props) {
  const { answers, setAnswer } = useQuiz();
  const value = answers[question.id];

  // Check conditional visibility
  if (question.conditionalOn) {
    const parentVal = answers[question.conditionalOn.questionId];

    if (question.conditionalOn.negate) {
      // Show when value does NOT match
      if (typeof parentVal === 'string') {
        const numVal = parseFloat(parentVal.replace(/[^0-9.-]/g, ''));
        if (question.conditionalOn.value === '0') {
          if (isNaN(numVal) || numVal <= 0) return null;
        }
      } else {
        if (parentVal === question.conditionalOn.value) return null;
      }
    } else {
      if (Array.isArray(question.conditionalOn.value)) {
        if (!question.conditionalOn.value.includes(parentVal as string)) return null;
      } else {
        if (parentVal !== question.conditionalOn.value) return null;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mb-8 last:mb-0"
    >
      <label className="block text-base font-medium text-charcoal mb-3">
        {question.label}
      </label>
      {question.helpText && (
        <p className="text-sm text-charcoal-light/70 mb-3">{question.helpText}</p>
      )}

      {question.type === 'input' && (
        <InputField question={question} value={value as string} onChange={setAnswer} />
      )}
      {question.type === 'currency' && (
        <CurrencyField question={question} value={value as string} onChange={setAnswer} />
      )}
      {question.type === 'percentage' && (
        <PercentageField question={question} value={value as string} onChange={setAnswer} />
      )}
      {question.type === 'select' && (
        <SelectField question={question} value={value as string} onChange={setAnswer} />
      )}
      {question.type === 'radio' && (
        <RadioPills question={question} value={value as string} onChange={setAnswer} />
      )}
      {question.type === 'yes-no' && (
        <YesNoPills question={question} value={value as string} onChange={setAnswer} />
      )}
      {question.type === 'multi-select' && (
        <MultiSelectPills question={question} value={(value as string[]) || []} onChange={setAnswer} />
      )}
    </motion.div>
  );
}

// ─── INPUT FIELDS ───

function InputField({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (id: string, v: string) => void;
}) {
  return (
    <input
      type="number"
      min={question.validation?.min ?? 0}
      max={question.validation?.max ?? 120}
      value={value || ''}
      onChange={e => onChange(question.id, e.target.value)}
      placeholder={question.placeholder}
      className="w-full max-w-xs px-4 py-3 rounded-xl border border-border bg-card text-charcoal placeholder:text-charcoal-light/40 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200"
    />
  );
}

function CurrencyField({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (id: string, v: string) => void;
}) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current && value) {
      const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(num) && num > 0) {
        setDisplayValue(formatNumber(num));
      }
      isInitialized.current = true;
    }
  }, [value]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-CA').format(Math.round(num));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setDisplayValue('');
      onChange(question.id, '');
      return;
    }
    const num = parseInt(raw);
    if (!isNaN(num)) {
      setDisplayValue(formatNumber(num));
      onChange(question.id, num.toString());
    }
  };

  return (
    <div className="relative w-full max-w-xs">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center">
        <DollarSign className="w-4 h-4 text-forest" />
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={question.placeholder}
        className="w-full pl-14 pr-4 py-3 rounded-xl border border-border bg-card text-charcoal placeholder:text-charcoal-light/40 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200"
      />
    </div>
  );
}

function PercentageField({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (id: string, v: string) => void;
}) {
  return (
    <div className="relative w-full max-w-xs">
      <input
        type="number"
        min={question.validation?.min ?? 0}
        max={question.validation?.max ?? 100}
        step="0.1"
        value={value || ''}
        onChange={e => onChange(question.id, e.target.value)}
        placeholder={question.placeholder}
        className="w-full pr-12 px-4 py-3 rounded-xl border border-border bg-card text-charcoal placeholder:text-charcoal-light/40 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center">
        <Percent className="w-4 h-4 text-forest" />
      </div>
    </div>
  );
}

function SelectField({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (id: string, v: string) => void;
}) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(question.id, e.target.value)}
      className="w-full max-w-sm px-4 py-3 rounded-xl border border-border bg-card text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200 appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23666'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
      }}
    >
      <option value="">Select your province...</option>
      {question.options?.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function RadioPills({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (id: string, v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {question.options?.map(opt => {
        const selected = value === opt;
        return (
          <motion.button
            key={opt}
            onClick={() => onChange(question.id, opt)}
            whileTap={{ scale: 0.97 }}
            className={`
              px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200
              ${selected
                ? 'bg-forest text-white border-forest shadow-md shadow-forest/15'
                : 'bg-card text-charcoal border-border hover:border-sage hover:bg-sage-light'
              }
            `}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

function YesNoPills({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (id: string, v: string) => void;
}) {
  const options = ['Yes', 'No'];
  return (
    <div className="flex gap-3">
      {options.map(opt => {
        const selected = value === opt;
        return (
          <motion.button
            key={opt}
            onClick={() => onChange(question.id, opt)}
            whileTap={{ scale: 0.97 }}
            className={`
              px-6 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 min-w-[80px]
              ${selected
                ? 'bg-forest text-white border-forest shadow-md shadow-forest/15'
                : 'bg-card text-charcoal border-border hover:border-sage hover:bg-sage-light'
              }
            `}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

function MultiSelectPills({ question, value, onChange }: {
  question: QuizQuestion; value: string[]; onChange: (id: string, v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    const current = value || [];
    if (current.includes(opt)) {
      onChange(question.id, current.filter(v => v !== opt));
    } else {
      onChange(question.id, [...current, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {question.options?.map(opt => {
        const selected = (value || []).includes(opt);
        return (
          <motion.button
            key={opt}
            onClick={() => toggle(opt)}
            whileTap={{ scale: 0.97 }}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200
              ${selected
                ? 'bg-forest text-white border-forest shadow-md shadow-forest/15'
                : 'bg-card text-charcoal border-border hover:border-sage hover:bg-sage-light'
              }
            `}
          >
            {selected && <Check className="w-3.5 h-3.5" />}
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}
