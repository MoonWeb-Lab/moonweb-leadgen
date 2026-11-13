import React from 'react';
import { Sparkles, Users } from 'lucide-react';

interface HeaderProps {
  user: any;
  metrics: {
    total: number;
    noWebsite: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ user, metrics }) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-rose-500 p-0.5 shadow-neon-cyan">
            <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">MoonWeb</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">LeadGen</span>
            </div>
            <p className="text-[11px] text-slate-400">Поиск лидов без сайтов</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Metrics Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Без сайта:</span>
            <span className="font-bold text-rose-400">{metrics.noWebsite}</span>
          </div>

          {/* User profile avatar or greeting */}
          {user && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-950/40 border border-sky-800/50 text-[11px] text-sky-200">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="max-w-[70px] truncate font-medium">{user.first_name || 'Вы'}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
