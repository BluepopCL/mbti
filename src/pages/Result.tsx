import React, { useEffect, useState, useRef } from 'react';
import { QuizScores, ResultJSON, PersonalityData } from '../types';
import { PERSONALITIES } from '../constants';
import { generatePersonalityAnalysis } from '../services/geminiService';
import { RadarChart } from '../components/RadarChart';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Target, Compass, Heart, Award, Download, Volume2, Square, AlertCircle, LogIn, ChevronLeft, Info, Activity, User as UserIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

// Firebase imports
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDoc, updateDoc, increment } from 'firebase/firestore';

interface ResultProps {
  scores: QuizScores;
  onRestart: () => void;
  isMuted: boolean;
}

const AI_THINKING_STEPS = [
  "正在解析您的认知功能矩阵...",
  "正在对比 16 种人格原型库...",
  "正在深度挖掘您的潜意识倾向...",
  "正在计算各维度的能量分布...",
  "正在优化您的个性化成长路径...",
  "正在生成您的专属人生格言..."
];

export const Result: React.FC<ResultProps> = ({ scores, onRestart, isMuted }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<ResultJSON | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [personality, setPersonality] = useState<PersonalityData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [show建议Modal, setShow建议Modal] = useState<{title: string, content: string} | null>(null);
  const [rarity, setRarity] = useState<number | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % AI_THINKING_STEPS.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const saveToFirebase = async (data: ResultJSON, p: PersonalityData, variant: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'quiz_records'), {
        userId: user.uid,
        personalityId: p.id,
        variant,
        scores,
        analysis: data,
        createdAt: serverTimestamp(),
        isPublic: true
      });

      const statsRef = doc(db, 'stats', 'mbti');
      const statsSnap = await getDoc(statsRef);
      if (!statsSnap.exists()) {
        await setDoc(statsRef, { totalTests: 1, typeCounts: { [p.id]: 1 } });
      } else {
        await updateDoc(statsRef, {
          totalTests: increment(1),
          [`typeCounts.${p.id}`]: increment(1)
        });
      }
    } catch (err) { console.error("Save failed:", err); }
  };

  useEffect(() => {
    // 1. Determine Type
    const typeStr = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('').toLowerCase();
    
    const variantStr = scores.A >= scores.Tu ? 'A' : 'T';

    const pData = PERSONALITIES.find(p => p.id === typeStr) || PERSONALITIES[0];
    setPersonality(pData);

    // Fetch Stats for Rarity
    getDoc(doc(db, 'stats', 'mbti')).then(snap => {
      if (snap.exists()) {
        const stats = snap.data();
        const count = stats.typeCounts?.[typeStr] || 0;
        const total = stats.totalTests || 1;
        setRarity(Math.round((count / total) * 100));
      }
    });

    // 2. Fetch AI Analysis
    generatePersonalityAnalysis(scores, typeStr, variantStr).then(res => {
      setAnalysis(res);
      setLoading(false);
      
      if (user) {
        saveToFirebase(res, pData, variantStr);
      }

      if (res.motto && !isMuted) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.motto);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
      }
    }).catch(err => {
      console.error(err);
      setErrorMsg('生成分析报告时出现错误，请检查网络或稍后再试。');
      setLoading(false);
    });
  }, [scores, user]);

  const handleSavePoster = async () => {
    if (!posterRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#f8fafc' // Base bg color
      });
      const url = canvas.toDataURL("image/png");
      
      // Try Web Share API for Mobile
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], `MBTI-${personality?.nameCn || 'Result'}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '我的MBTI测试结果',
            text: '快来看看我的性格解析吧！',
            files: [file]
          });
          setIsGenerating(false);
          return;
        }
      } catch (shareErr) {
        console.log("Share API failed or not supported, falling back to download", shareErr);
      }

      // Fallback to traditional download
      const link = document.createElement('a');
      link.download = `MBTI-${personality?.nameCn || 'Result'}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster', err);
    }
    setIsGenerating(false);
  };

  const handlePlayTTS = () => {
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    if (analysis && personality) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(true);
      
      const parts = [
        `您的性格类型是：${personality.nameCn}。`,
        `深度解析：${analysis.summary}`,
        `您的核心优势包括：${analysis.strengths.join('。')}`,
        `可以提升的成长空间有：${analysis.weaknesses.join('。')}`,
        `感情方面：${analysis.relationships}`,
        analysis.compatibility ? `最佳伴侣是${analysis.compatibility.bestMatch}，事业拍档最好是${analysis.compatibility.workPartner}。` : '',
        `最后，送给您一句专属人生格言：${analysis.motto}`
      ];

      const utterance = new SpeechSynthesisUtterance(parts.join(' '));
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      window.speechSynthesis.cancel();
    }
  }, []);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (err) { console.error("Login failed:", err); }
  };

  const getDimensionTip = (dimension: string, value: number) => {
    const tips: Record<string, string> = {
      'E': value > 7 ? "您是一个极度依赖社交获取能量的人，建议在忙碌后安排群体活动来回血。" : "您有较强的外部适应性，能在社交中游刃有余。",
      'I': value > 7 ? "您高度依赖内部世界，深度社交后请务必留足独处回血的时间，避免能量耗尽。" : "您享受独处的宁静，这是您深度思考的源泉。",
      'S': value > 7 ? "您极度注重细节和现实，建议偶尔抬头看看远大的愿景，避免陷入琐碎。" : "您务实稳健，是团队中可靠的定海神针。",
      'N': value > 7 ? "您满脑子都是灵感和未来，记得偶尔脚踏实地，将构想落地为现实。" : "您极具直觉敏锐度，擅长捕捉事物的潜在联系。",
      'T': value > 7 ? "逻辑是您的铠甲，但有时冷静得让人感到疏离，试着多表达一点情感关怀。" : "您的决策基于客观分析，理性是您的强项。",
      'F': value > 7 ? "同理心是您的超能力，但别让过度共情压垮了自己，记得设立情感边界。" : "您心思细腻，能敏锐察觉到他人的情感波动。",
      'J': value > 7 ? "掌控感让您安心，但计划赶不上变化时，试着放下执念，拥抱生活的随机性。" : "您条理清晰，是执行计划的最佳人选。",
      'P': value > 7 ? "您热爱自由与无限可能，但偶尔的截止日期和纪律能帮您更有效地达成目标。" : "您灵活多变，能在变化中发现独特的机遇。",
      'A': value > 7 ? "您异常沉稳自信，这种稳定性深受他人信赖，但也需警惕由此带来的过度乐观。" : "您情绪饱满而稳定，抗压性极强。",
      'T_DIM': value > 7 ? "您是一个完美的追求者，压力是您的动力但也可能过载，学会与不完美的自己和解。" : "您对自我要求极高，这促使您不断进化。"
    };
    return tips[dimension] || "";
  };

  const renderDichotomy = (left: string, right: string, leftScore: number, rightScore: number, leftLabel: string, rightLabel: string) => {
    const total = leftScore + rightScore;
    const leftPct = total > 0 ? Math.round((leftScore / total) * 100) : 50;
    const rightPct = 100 - leftPct;

    const tip = getDimensionTip(left, leftScore);
    const rightTip = getDimensionTip(right === 'T' ? 'T_DIM' : right, rightScore);

    return (
      <div className="mb-5 last:mb-0">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
          <button 
            onClick={() => setShow建议Modal({ title: `${leftLabel} 深度洞见`, content: tip })}
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
          >
            <span className={leftScore >= rightScore ? "text-indigo-600" : ""}>{left}</span> 
            {leftLabel} ({leftPct}%)
            <Info size={10} />
          </button>
          <button 
            onClick={() => setShow建议Modal({ title: `${rightLabel} 深度洞见`, content: rightTip })}
            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
          >
            <Info size={10} />
            ({rightPct}%) {rightLabel} 
            <span className={rightScore > leftScore ? "text-emerald-600" : ""}>{right}</span>
          </button>
        </div>
        <div className="h-2 flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
          <div className="h-full bg-indigo-500/70 transition-all duration-1000" style={{ width: `${leftPct}%` }}></div>
          <div className="h-full bg-emerald-500/70 transition-all duration-1000" style={{ width: `${rightPct}%` }}></div>
        </div>
      </div>
    );
  };

  if (!personality) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen transition-colors duration-1000 overflow-x-hidden"
      style={{ 
        backgroundColor: personality.colorHex + '05', // 5% opacity personality color as bg
      }}
    >
      <div ref={posterRef} className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Dynamic Theme Header */}
        <div className="text-center mb-16 relative">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[120px] rounded-full -z-10 bg-current opacity-30 ${personality.colorClass.split(' ')[0]}`}></div>
          <div className="flex flex-col items-center">
            <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 bg-white shadow-sm border border-slate-100 ${personality.colorClass.split(' ')[1]}`}>
              Test Result Analysis
            </div>
            <div className="flex justify-center items-center gap-6 mb-8">
              <div className={`text-7xl md:text-9xl font-black tracking-tighter ${personality.colorClass.split(' ')[1]} drop-shadow-sm`}>
                {personality.id.toUpperCase()}
              </div>
              <div className="text-left">
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">{personality.nameCn}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="h-0.5 w-6 bg-slate-200"></span>
                  <p className="text-xl text-slate-400 font-serif italic">{personality.nameEn}</p>
                </div>
              </div>
            </div>
            
            {/* Account & Rarity Info */}
            <div className="flex flex-wrap justify-center items-center gap-4">
              {!user ? (
                <button 
                  onClick={handleLogin}
                  className="px-6 py-2 bg-white text-slate-600 rounded-full text-xs font-bold border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                >
                  <LogIn size={14} /> 登录保存测试历史
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                    <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-5 h-5 rounded-full border border-slate-100" />
                    <span className="text-xs font-bold text-slate-600">{user.displayName}</span>
                  </div>
                  <button onClick={() => signOut(auth)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">登出</button>
                </div>
              )}
              {rarity !== null && (
                <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <Activity size={12} className="text-emerald-400" /> 全球稀有度: {rarity}%
                </div>
              )}
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Col: Avatar & Chart */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className={`bg-white rounded-[2.5rem] shadow-xl p-8 flex justify-center items-center border border-slate-100 relative overflow-hidden ${personality.colorClass.split(' ')[0]} bg-opacity-10`}>
            {/* Background shape */}
            <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full opacity-20 blur-3xl ${personality.colorClass.split(' ')[0]}`}></div>
            <img 
              src={personality.avatarUrl} 
              alt={personality.nameCn} 
              loading="lazy"
              className="w-64 h-auto relative z-10 filter drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="bg-white rounded-[2rem] shadow-lg p-6 border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target size={20} className="text-slate-400"/> 维度分析 (Dimensions)</h3>
            <div className="mb-8">
              {renderDichotomy('E', 'I', scores.E, scores.I, '外向', '内向')}
              {renderDichotomy('S', 'N', scores.S, scores.N, '实感', '直觉')}
              {renderDichotomy('T', 'F', scores.T, scores.F, '思考', '情感')}
              {renderDichotomy('J', 'P', scores.J, scores.P, '判断', '感受')}
              <div className="mt-6 pt-6 border-t border-slate-100">
                {renderDichotomy('A', 'T', scores.A, scores.Tu, '自信', '动荡')}
              </div>
            </div>
            <RadarChart scores={scores} />
          </div>

          {/* Moved AI Content: Motto Only */}
          {analysis && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] text-center shadow-lg relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${personality.colorClass.split(' ')[0]}`}></div>
                <div className="inline-block mb-4">
                  <div className="h-0.5 w-10 bg-slate-100 mx-auto mb-2"></div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Motto</h4>
                </div>
                <p className="text-3xl font-serif italic text-slate-900 font-bold leading-tight px-2 group-hover:scale-105 transition-transform">
                  "{analysis.motto}"
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Col: AI Analysis */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 h-full relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md z-20 text-center px-8"
                >
                  <div className="relative mb-12">
                    <div className="w-20 h-20 border-2 border-slate-100 rounded-full border-t-amber-500 border-r-amber-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="text-amber-500 animate-pulse" size={32} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">MBTI 精准计算系统</h3>
                  <div className="h-6 overflow-hidden">
                    <motion.p 
                      key={thinkingStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-amber-600 font-medium text-sm"
                    >
                      {AI_THINKING_STEPS[thinkingStep]}
                    </motion.p>
                  </div>
                </motion.div>
              ) : analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
                
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><Sparkles className="text-amber-500" /> 深度性格解析</h3>
                  <button 
                    onClick={handlePlayTTS}
                    className="ml-4 flex-shrink-0 flex items-center justify-center p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
                    title={isPlayingTTS ? "停止朗读" : "朗读全文"}
                  >
                    {isPlayingTTS ? <Square size={18} className="fill-current" /> : <Volume2 size={18} />}
                  </button>
                </div>

                {/* Bento Grid Starts Here */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  
                  {/* 1. Summary - Big Block */}
                  <section className="md:col-span-6 bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100">
                    <p className="text-slate-600 leading-loose text-lg font-medium">{analysis.summary}</p>
                  </section>

                  {/* 2. Strengths - Vertical Tall Block */}
                  <section className="md:col-span-3 bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem]">
                    <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-4 border-b border-emerald-200/50 pb-3"><Award size={20}/> 核心优势 (Strengths)</h4>
                    <ul className="space-y-3">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* 3. Weaknesses - Vertical Tall Block */}
                  <section className="md:col-span-3 bg-orange-50/50 border border-orange-100 p-6 rounded-[2rem]">
                    <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-4 border-b border-orange-200/50 pb-3"><Compass size={20}/> 成长空间 (Weaknesses)</h4>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"></div>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </section>

                   {/* 6. Compatibility - Grid inner Grid */}
                   {analysis.compatibility && (
                    <section className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-50 hover:border-rose-200 transition-colors">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">💖 最佳伴侣</div>
                        <div className="font-bold text-rose-600 text-sm">{analysis.compatibility.bestMatch}</div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 hover:border-blue-200 transition-colors">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">💼 最佳事业拍档</div>
                        <div className="font-bold text-blue-600 text-sm">{analysis.compatibility.workPartner}</div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-50 hover:border-amber-200 transition-colors">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">⚠️ 需多包容了解</div>
                        <div className="font-bold text-amber-600 text-sm">{analysis.compatibility.conflict}</div>
                      </div>
                    </section>
                  )}

                  {/* 7. Celebrities - Moved here to the bottom of the bento grid */}
                  {analysis.celebrities && analysis.celebrities.length > 0 && (
                    <section className="md:col-span-6 bg-purple-50/30 border border-purple-100 p-6 md:p-8 rounded-[2.5rem]">
                      <h4 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
                        <Sparkles className="text-purple-500" size={20}/> 你的精神同行者 (Celebrities)
                      </h4>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {analysis.celebrities.map((celeb, idx) => (
                          <div key={idx} className="min-w-[220px] p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex-shrink-0 hover:shadow-md transition-all">
                            <h5 className="font-black text-slate-900 text-sm mb-2">{celeb.name}</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{celeb.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Error rendering analysis.</div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Suggested Tip Modal */}
      <AnimatePresence>
        {show建议Modal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShow建议Modal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 z-10"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <Info size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{show建议Modal.title}</h3>
              <p className="text-slate-600 leading-loose text-lg">{show建议Modal.content}</p>
              <button 
                onClick={() => setShow建议Modal(null)}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                收起建议
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 px-4">
        <button 
          onClick={handleSavePoster}
          disabled={isGenerating || loading}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Download size={18} />
          )}
          {isGenerating ? '生成中...' : '保存分享海报'}
        </button>

        <button 
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RotateCcw size={18} /> 重新测试 (Retake)
        </button>
      </div>

      {/* Banner */}
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="max-w-xl relative z-10">
          <h2 className="text-3xl font-bold mb-4">关注【程同学AI嘚啵嘚】</h2>
          <p className="text-slate-400 text-lg">获取更多AI硬核干货与创新玩法，掌握AI时代的核心竞争力。</p>
        </div>
        <div className="w-32 h-32 bg-white rounded-xl p-2 flex-shrink-0 relative z-10 shadow-lg">
          <img src="/wechat-qr.png" alt="关注程同学AI嘚啵嘚" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
     </div> {/* End posterRef */}

    </motion.div>
  );
};
