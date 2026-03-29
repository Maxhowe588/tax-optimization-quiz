/*
 * WelcomeScreen — Nordic Fintech style
 * Warm, inviting landing with hero illustration
 * DM Serif Display heading, forest green CTA
 */

import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/contexts/QuizContext';

const WELCOME_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663475534240/GNkNp5vXqFrHNeUUdf42JX/welcome-illustration-NdDR8VTZ5SGPq5oVLW3FpM.webp';

const features = [
  { icon: Sparkles, text: 'Personalized strategies based on your situation' },
  { icon: Shield, text: '100% compliant with Canadian tax rules' },
  { icon: Leaf, text: 'Takes about 5 minutes to complete' },
];

export default function WelcomeScreen() {
  const { goNext } = useQuiz();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 bg-sage-light text-forest px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            Free Tax Optimization Tool
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] text-charcoal mb-6">
            Discover Your
            <br />
            <span className="text-forest">Tax Savings</span>
            <br />
            Potential
          </h1>

          <p className="text-lg text-charcoal-light leading-relaxed mb-8 max-w-lg">
            Answer a few questions about your financial situation and get personalized,
            actionable strategies to optimize your Canadian taxes.
          </p>

          <div className="space-y-4 mb-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-forest" />
                </div>
                <span className="text-charcoal-light">{f.text}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={goNext}
            size="lg"
            className="bg-forest hover:bg-forest-light text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-forest/20 transition-all duration-200 hover:shadow-xl hover:shadow-forest/30 hover:-translate-y-0.5"
          >
            Start the Quiz
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-charcoal-light/60 mt-4">
            No login required. Your data stays in your browser.
          </p>
        </motion.div>

        {/* Right — Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <div className="relative w-full max-w-md lg:max-w-lg">
            <div className="absolute inset-0 bg-sage/30 rounded-3xl blur-3xl -z-10 scale-90" />
            <img
              src={WELCOME_IMG}
              alt="Canadian Tax Optimization"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
