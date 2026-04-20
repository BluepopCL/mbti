import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS, INITIAL_SCORES } from '../constants';
import { QuizScores } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizProps {
  onComplete: (scores: QuizScores) => void;
  onBack: () => void;
  isMuted: boolean;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete, onBack, isMuted }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const question = QUIZ_QUESTIONS[currentIndex];
  const progress = ((currentIndex) / QUIZ_QUESTIONS.length) * 100;

  useEffect(() => {
    if (!isMuted && question) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.textCn);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1; // slightly faster for quiz reading
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex, isMuted, question]);

  const handleAnswer = (value: number) => {
    // Save answer
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setDirection(1);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200);
    } else {
      // Calculate scores
      const finalScores = { ...INITIAL_SCORES };
      QUIZ_QUESTIONS.forEach(q => {
        const val = newAnswers[q.id] || 0;
        // val ranges from -3 (strongly disagree) to 3 (strongly agree)
        // If direction is 1 (Agree favors E, S, T, J)
        // If direction is -1 (Agree favors I, N, F, P)
        const [dim1, dim2] = q.dimension.split('/') as [keyof QuizScores, keyof QuizScores];
        
        if (q.direction === 1) {
          if (val > 0) finalScores[dim1] += val;
          if (val < 0) finalScores[dim2] += Math.abs(val);
        } else {
          if (val > 0) finalScores[dim2] += val;
          if (val < 0) finalScores[dim1] += Math.abs(val);
        }
      });
      setTimeout(() => onComplete(finalScores), 300);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const options = [
    { labelCn: '非常同意', labelEn: 'Strongly Agree', value: 3, color: 'bg-emerald-500 hover:bg-emerald-600', ring: 'ring-emerald-200' },
    { labelCn: '同意', labelEn: 'Agree', value: 1, color: 'bg-emerald-400 hover:bg-emerald-500', ring: 'ring-emerald-100' },
    { labelCn: '反对', labelEn: 'Disagree', value: -1, color: 'bg-rose-400 hover:bg-rose-500', ring: 'ring-rose-100' },
    { labelCn: '非常反对', labelEn: 'Strongly Disagree', value: -3, color: 'bg-rose-500 hover:bg-rose-600', ring: 'ring-rose-200' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto px-4 py-8 md:py-24 min-h-[80vh] flex flex-col"
    >
      {/* Progress */}
      <div className="mb-12">
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          <span>Question {currentIndex + 1}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-slate-900 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center gap-12 relative overflow-hidden px-2">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* Question Text */}
          <motion.div 
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                {question.textCn}
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-serif italic">
                {question.textEn}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {options.map((opt, i) => {
                const isSelected = answers[question.id] === opt.value;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.value)}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-200 border-2 ${
                      isSelected 
                        ? `border-transparent ring-4 ${opt.ring} ${opt.color} text-white shadow-lg shadow-${opt.color.split('-')[1]}-500/30 scale-105` 
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full mb-4 border-2 ${isSelected ? 'border-white bg-white/20' : 'border-slate-200'}`}></div>
                    <span className="font-bold text-lg mb-1">{opt.labelCn}</span>
                    <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{opt.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-between">
        <button 
          onClick={handlePrevious}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors px-4 py-2"
        >
          <ArrowLeft size={18} />
          {currentIndex === 0 ? '返回首页 (Home)' : '上一题 (Previous)'}
        </button>
      </div>
    </motion.div>
  );
};
