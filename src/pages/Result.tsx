import React, { useEffect, useState, useRef } from 'react';
import { QuizScores, ResultJSON, PersonalityData } from '../types';
import { PERSONALITIES } from '../constants';
import { generatePersonalityAnalysis } from '../services/geminiService';
import { RadarChart } from '../components/RadarChart';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles, Target, Compass, Heart, Award, Download, Volume2, Square, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ResultProps {
  scores: QuizScores;
  onRestart: () => void;
  isMuted: boolean;
}

export const Result: React.FC<ResultProps> = ({ scores, onRestart, isMuted }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<ResultJSON | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [personality, setPersonality] = useState<PersonalityData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

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

    // 2. Fetch AI Analysis
    generatePersonalityAnalysis(scores, typeStr, variantStr).then(res => {
      setAnalysis(res);
      setLoading(false);
      
      // Auto speak motto when done
      if (res.motto && !isMuted) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.motto);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
      }
    }).catch(err => {
      console.error(err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('EXHAUSTED') || errMsg.includes('quota')) {
        setErrorMsg('非常抱歉，由于当前参与测试的人数过多，AI 接口调用已达到配额限制。请您稍后重新点击测试！');
      } else {
        setErrorMsg('生成分析报告时出现错误，请检查网络或稍后再试。');
      }
      setLoading(false);
    });
  }, [scores, isMuted]);

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

  const renderDichotomy = (left: string, right: string, leftScore: number, rightScore: number, leftLabel: string, rightLabel: string) => {
    // Each dimension max sum is effectively 9 from 3 questions (-3 to +3 logic)
    const total = leftScore + rightScore;
    const leftPct = total > 0 ? Math.round((leftScore / total) * 100) : 50;
    const rightPct = 100 - leftPct;

    return (
      <div className="mb-5 last:mb-0">
        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="text-indigo-600">{left}</span> 
            {leftLabel} ({leftPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            ({rightPct}%) {rightLabel} 
            <span className="text-emerald-600">{right}</span>
          </span>
        </div>
        <div className="h-2.5 flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
          <div className="h-full bg-indigo-500/80 transition-all duration-1000" style={{ width: `${leftPct}%` }}></div>
          <div className="h-full bg-emerald-500/80 transition-all duration-1000" style={{ width: `${rightPct}%` }}></div>
        </div>
      </div>
    );
  };

  if (!personality) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 py-12 md:py-16"
    >
      <div ref={posterRef} className="pb-8 bg-[#f8fafc]">
        <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/20 blur-[100px] rounded-full -z-10"></div>
        <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">您的测试结果 Your Result</h1>
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className={`text-6xl md:text-8xl font-black tracking-tighter ${personality.colorClass.split(' ')[1]}`}>
            {personality.id.toUpperCase()}-{scores.A >= scores.Tu ? 'A' : 'T'}
          </div>
          <div className="text-left leading-tight">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">{personality.nameCn}</h2>
            <p className="text-lg text-slate-500 font-serif italic mt-1">{personality.nameEn}</p>
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
        </div>

        {/* Right Col: AI Analysis */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 h-full relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Sparkles className="animate-pulse text-amber-500"/> Gemini 智能分析中...</h3>
                <p className="text-sm text-slate-400 mt-2">Generating personalized insights</p>
              </div>
            ) : analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col space-y-10">
                
                {/* 1. Summary */}
                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800"><Sparkles className="text-amber-500" /> 深度性格解析</h3>
                    <button 
                      onClick={handlePlayTTS}
                      className="ml-4 flex-shrink-0 flex items-center justify-center p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
                      title={isPlayingTTS ? "停止朗读" : "朗读全文"}
                    >
                      {isPlayingTTS ? <Square size={18} className="fill-current" /> : <Volume2 size={18} />}
                    </button>
                  </div>
                  <p className="text-slate-600 leading-loose text-lg font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">{analysis.summary}</p>
                </section>

                {/* 2. Strengths & Weaknesses */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100">
                    <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-4 border-b border-emerald-200/50 pb-3"><Award size={20}/> 核心优势 (Strengths)</h4>
                    <ul className="space-y-3">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-3xl bg-orange-50/50 border border-orange-100">
                    <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-4 border-b border-orange-200/50 pb-3"><Compass size={20}/> 成长空间 (Weaknesses)</h4>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"></div>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* 3. Career Path */}
                <section>
                  <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-5"><Target className="text-blue-500" size={22}/> 职业雷达 (Career Path)</h4>
                  <div className="flex flex-wrap gap-3">
                    {analysis.careerPath.map((c, i) => (
                      <span key={i} className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-full text-slate-700 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </section>

                {/* 4. Relationships & Compatibility */}
                <section className="p-6 md:p-8 bg-rose-50/30 border border-rose-100 rounded-3xl">
                  <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4"><Heart className="text-rose-400 fill-rose-100" size={22}/> 情感与社交 (Relationships)</h4>
                  <p className="text-slate-600 leading-relaxed mb-8 text-lg">{analysis.relationships}</p>
                  
                  {analysis.compatibility && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-50 hover:border-rose-200 transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">💖 最佳伴侣</div>
                        <div className="font-bold text-rose-600 text-lg">{analysis.compatibility.bestMatch}</div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 hover:border-blue-200 transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">💼 最佳事业拍档</div>
                        <div className="font-bold text-blue-600 text-lg">{analysis.compatibility.workPartner}</div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-50 hover:border-amber-200 transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">⚠️ 需多包容了解</div>
                        <div className="font-bold text-amber-600 text-lg">{analysis.compatibility.conflict}</div>
                      </div>
                    </div>
                  )}
                </section>

                {/* 5. Celebrities */}
                {analysis.celebrities && analysis.celebrities.length > 0 && (
                  <section>
                    <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-5"><Sparkles className="text-purple-500" size={22}/> 同款名人 (Celebrities)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {analysis.celebrities.map((celeb, idx) => (
                        <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                          <h5 className="font-extrabold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">{celeb.name}</h5>
                          <p className="text-sm text-slate-500 leading-relaxed">{celeb.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 6. Motto */}
                <section className="mt-auto pt-10 pb-4 text-center">
                  <div className="inline-block mb-6">
                    <div className="h-px w-16 bg-slate-200 mx-auto mb-4"></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">专属人生格言 / Motto</h4>
                  </div>
                  <p className="text-2xl md:text-3xl font-serif italic text-slate-800 font-medium px-4">"{analysis.motto}"</p>
                </section>
                
              </motion.div>
            ) : errorMsg ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">生成报告失败</h3>
                <p className="text-slate-600 leading-relaxed max-w-sm mb-8">{errorMsg}</p>
                <button 
                  onClick={onRestart}
                  className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  返回首页重试
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">Failed to load analysis.</div>
            )}
          </div>
        </div>
      </div>

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
          <img src="/qrcode.png" alt="程同学二维码" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
     </div> {/* End posterRef */}

    </motion.div>
  );
};
