import React, { useState } from 'react';
import { Users, Activity, Instagram, Zap } from 'lucide-react';
import avatarImg from '../assets/avatar.jpg';

interface HeaderProps {
  user: any;
  metrics: {
    total: number;
    noWebsite: number;
  };
  onOpenInstagramAutopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, metrics, onOpenInstagramAutopilot }) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3 bg-[#070C18]/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Avatar + Studio Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30 shadow-[0_0_14px_rgba(168,85,247,0.25)] shrink-0 bg-[#0E1526] select-none">
            {!avatarError ? (
              <img
                src={avatarImg}
                alt="MoonWeb Lab Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover aspect-square"
                onError={() => setAvatarError(true)}
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-sky-500 text-white font-extrabold text-xs">
                MW
              </div>
            )}
            {/* Live active dot indicator */}
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070C18]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                MoonWeb<span className="text-purple-400 ml-0.5">Lab</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Hunter
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Конвейер лидов</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">Беларусь</span>
            </p>
          </div>
        </div>

        {/* Right: Real-time Stats & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Instagram Autopilot Button */}
          {onOpenInstagramAutopilot && (
            <button
              type="button"
              onClick={onOpenInstagramAutopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 border border-pink-400/30 transition-all cursor-pointer"
              title="Открыть автопилот Instagram (15 в день)"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-200" />
              <span>15 в Direct</span>
            </button>
          )}

          {/* Target Leads Without Website Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-slate-300 text-[11px] font-medium hidden sm:inline">Без сайта:</span>
            <span className="font-bold text-rose-300 font-mono text-xs">{metrics.noWebsite}</span>
          </div>

          {/* User profile / Active state */}
          {user ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-slate-200">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="max-w-[80px] truncate font-medium">{user.first_name || 'Вы'}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium">Парсер готов</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
