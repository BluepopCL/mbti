import React from 'react';
import { Radar, RadarChart as RechartsChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { QuizScores } from '../types';

interface RadarChartProps {
  scores: QuizScores;
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  // Max score per letter is 3 (3 questions x 1 point)
  // We offset it so that empty/0 doesn't totally collapse
  const data = [
    { subject: 'E 外向', score: scores.E || 0.1, fullMark: 9 },
    { subject: 'N 直觉', score: scores.N || 0.1, fullMark: 9 },
    { subject: 'T 思考', score: scores.T || 0.1, fullMark: 9 },
    { subject: 'J 判断', score: scores.J || 0.1, fullMark: 9 },
    { subject: 'I 内向', score: scores.I || 0.1, fullMark: 9 },
    { subject: 'S 实感', score: scores.S || 0.1, fullMark: 9 },
    { subject: 'F 感受', score: scores.F || 0.1, fullMark: 9 },
    { subject: 'P 感受', score: scores.P || 0.1, fullMark: 9 },
  ];

  return (
    <div className="w-full h-64 md:h-80 bg-white rounded-3xl shadow-sm border border-slate-100 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
          <Radar
            name="Personality"
            dataKey="score"
            stroke="#f59e0b"
            fill="#fcd34d"
            fillOpacity={0.4}
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
};
