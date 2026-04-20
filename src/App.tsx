import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { QuizScores } from './types';
import { AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

type PageState = 'home' | 'quiz' | 'result';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageState>('home');
  const [scores, setScores] = useState<QuizScores | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mbti_app_state');
    if (saved) {
      try {
        const { page, savedScores } = JSON.parse(saved);
        if (page) setCurrentPage(page);
        if (savedScores) setScores(savedScores);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (currentPage === 'home') {
        localStorage.removeItem('mbti_app_state');
      } else {
        localStorage.setItem('mbti_app_state', JSON.stringify({ page: currentPage, savedScores: scores }));
      }
    }
  }, [currentPage, scores, isLoaded]);

  const startQuiz = () => setCurrentPage('quiz');
  const cancelQuiz = () => setCurrentPage('home');
  const finishQuiz = (finalScores: QuizScores) => {
    setScores(finalScores);
    setCurrentPage('result');
  };
  const restart = () => {
    setScores(null);
    setCurrentPage('home');
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen selection:bg-amber-200 selection:text-amber-900 font-sans relative">
      <button 
        onClick={() => {
          setIsMuted(!isMuted);
          window.speechSynthesis.cancel();
        }}
        className="fixed top-4 right-4 z-50 p-3 bg-white/80 backdrop-blur-sm shadow-md rounded-full text-slate-500 hover:text-slate-800 transition-colors border border-slate-100"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <AnimatePresence mode="wait">
        {currentPage === 'home' && <Home key="home" onStartQuiz={startQuiz} isMuted={isMuted} />}
        {currentPage === 'quiz' && <Quiz key="quiz" onBack={cancelQuiz} onComplete={finishQuiz} />}
        {currentPage === 'result' && scores && <Result key="result" scores={scores} onRestart={restart} isMuted={isMuted} />}
      </AnimatePresence>
    </div>
  );
}
