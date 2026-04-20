import React, { useState, useEffect } from 'react';
import { PERSONALITIES } from '../constants';
import { MbtiCard } from '../components/MbtiCard';
import { PersonalityData, MbtiCategory } from '../types';
import { X, ArrowRight, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  onStartQuiz: () => void;
  isMuted: boolean;
}

export const Home: React.FC<HomeProps> = ({ onStartQuiz, isMuted }) => {
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityData | null>(null);

  // Group personalities
  const grouped = PERSONALITIES.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<MbtiCategory, PersonalityData[]>);

  const handleCardClick = (data: PersonalityData) => {
    setSelectedPersonality(data);
  };

  useEffect(() => {
    // Stop speaking if modal closes
    if (!selectedPersonality) {
      window.speechSynthesis.cancel();
    } else if (!isMuted) {
      // Speak the quote
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedPersonality.quoteCn);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedPersonality, isMuted]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-12"
    >
      {/* Header */}
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full shadow-sm text-sm font-semibold tracking-wide text-amber-700 uppercase relative overflow-hidden">
          <Zap size={16} className="text-amber-500" />
          <span>程同学AI嘚啵嘚 (Cheng AI Studio)</span>
          <span className="w-1 h-1 rounded-full bg-amber-400 mx-1"></span>
          <span className="text-amber-500">永久免费 / 100% Free</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-slate-900 leading-tight">
          发现真实的你
          <span className="block text-xl md:text-2xl mt-4 text-slate-400 font-medium tracking-normal mb-8">Discover Your True Self</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed font-serif">
          16型人格测验通过多维度的科学分析，结合 Gemini 2.5 Flash 智能洞察，为您生成独一无二的成长与人生指南。
        </p>
        
        <button 
          onClick={onStartQuiz}
          className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto"
        >
          开始测试 <ArrowRight size={20} />
        </button>
      </header>

      {/* Grid sections for each category */}
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="mb-16">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Activity className="text-slate-300" />
            {category === 'Analyst' ? '分析家 (Analysts)' : 
             category === 'Diplomat' ? '外交家 (Diplomats)' : 
             category === 'Sentinel' ? '守护者 (Sentinels)' : '探险家 (Explorers)'}
          </h2>
          <div className="w-12 h-1 bg-slate-200 rounded-full mb-8"></div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <MbtiCard data={item} onClick={handleCardClick} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      ))}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPersonality && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPersonality(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              <button 
                onClick={() => setSelectedPersonality(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>

              <div className={`p-8 flex items-center justify-center relative md:w-2/5 ${selectedPersonality.colorClass.split(' ')[0]} bg-opacity-20`}>
                <div className={`absolute inset-0 opacity-10 bg-current`}></div>
                <img 
                  src={selectedPersonality.avatarUrl} 
                  alt={selectedPersonality.nameCn} 
                  className="w-48 h-auto object-contain relative z-10 filter drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-8 md:w-3/5 flex flex-col justify-center">
                 <div className={`text-xs font-semibold px-3 py-1 uppercase tracking-widest inline-flex w-fit rounded-full mb-4 ${selectedPersonality.colorClass}`}>
                  {selectedPersonality.id}
                </div>
                
                <h3 className="text-3xl font-bold font-sans text-slate-900 mb-1">{selectedPersonality.nameCn}</h3>
                <span className="text-sm text-slate-400 font-medium mb-4 block"><span className="text-slate-600 font-semibold">{selectedPersonality.aliasCn}</span> • {selectedPersonality.nameEn}</span>
                
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {selectedPersonality.descriptionCn}
                </p>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-8 relative">
                  <span className="text-4xl text-slate-200 absolute top-2 left-2 font-serif">"</span>
                  <p className="text-slate-700 italic font-serif relative z-10 text-sm leading-relaxed whitespace-pre-wrap px-4">
                    {selectedPersonality.quoteCn}
                  </p>
                  <p className="text-slate-400 mt-2 text-xs italic text-right relative z-10">
                    - {selectedPersonality.quoteEn}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setSelectedPersonality(null);
                    onStartQuiz();
                  }}
                  className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-lg hover:bg-amber-600 transition-colors shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  去测试这个性格 <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
