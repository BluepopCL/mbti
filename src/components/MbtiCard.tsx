import React from 'react';
import { PersonalityData } from '../types';
import { PlayCircle } from 'lucide-react';

interface MbtiCardProps {
  data: PersonalityData;
  onClick: (data: PersonalityData) => void;
}

export const MbtiCard: React.FC<MbtiCardProps> = ({ data, onClick }) => {
  return (
    <div 
      className="group relative bg-white hover:bg-slate-50 border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 overflow-hidden"
      onClick={() => onClick(data)}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-10 -mt-10 rounded-full ${data.colorClass.split(' ')[0]}`} />

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-24 h-32 flex-shrink-0 flex items-center justify-center">
          <img 
            src={data.avatarUrl} 
            alt={data.nameCn} 
            loading="lazy"
            className="w-full h-full object-contain filter group-hover:drop-shadow-lg transition-transform duration-500 ease-out group-hover:scale-105" 
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Info */}
        <div className="flex flex-col flex-grow">
          <div className={`text-xs font-semibold px-2 py-1 uppercase tracking-widest inline-flex w-fit rounded-full mb-2 ${data.colorClass}`}>
            {data.id}
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-bold font-sans text-slate-800">{data.nameCn}</h3>
            <span className="text-xs text-slate-400 font-medium">{data.nameEn}</span>
          </div>
          <span className="text-sm font-semibold text-slate-500 mb-2">{data.aliasCn}</span>
          
          <div className="text-xs text-slate-400 italic line-clamp-2 pr-4 font-serif relative">
            <span className="absolute -left-2 -top-1 opacity-20 text-3xl">"</span>
            "{data.quoteCn}"
          </div>
        </div>
        
        {/* Action Icon */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-300 group-hover:text-amber-500">
          <PlayCircle size={28} />
        </div>
      </div>
    </div>
  );
};
