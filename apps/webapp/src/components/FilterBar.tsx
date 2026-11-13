import React from 'react';
import { Flame, MessageCircle, Instagram, Star, Download } from 'lucide-react';

interface FilterBarProps {
  onlyNoWebsite: boolean;
  hasTelegram: boolean;
  hasInstagram: boolean;
  minRating: number | '';
  crmStatus: string;
  sortBy: 'reviews' | 'rating' | 'name' | 'newest';
  totalFound: number;
  onToggleNoWebsite: () => void;
  onToggleTelegram: () => void;
  onToggleInstagram: () => void;
  onToggleMinRating: () => void;
  onSelectCrmStatus: (status: string) => void;
  onSelectSortBy: (sort: 'reviews' | 'rating' | 'name' | 'newest') => void;
  onOpenExport: () => void;
  onHaptic?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onlyNoWebsite,
  hasTelegram,
  hasInstagram,
  minRating,
  crmStatus,
  sortBy,
  totalFound,
  onToggleNoWebsite,
  onToggleTelegram,
  onToggleInstagram,
  onToggleMinRating,
  onSelectCrmStatus,
  onSelectSortBy,
  onOpenExport,
  onHaptic
}) => {
  return (
    <div className="space-y-2 pt-1">
      {/* Toggles row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {/* Only No Website Toggle */}
        <button
          onClick={() => {
            onToggleNoWebsite();
            onHaptic?.();
          }}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            onlyNoWebsite
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${onlyNoWebsite ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          <span>Без сайта</span>
        </button>

        {/* Has Telegram Toggle */}
        <button
          onClick={() => {
            onToggleTelegram();
            onHaptic?.();
          }}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            hasTelegram
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>Есть Telegram</span>
        </button>

        {/* Has Instagram Toggle */}
        <button
          onClick={() => {
            onToggleInstagram();
            onHaptic?.();
          }}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            hasInstagram
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          <Instagram className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Есть Instagram</span>
        </button>

        {/* Rating 4.5+ Toggle */}
        <button
          onClick={() => {
            onToggleMinRating();
            onHaptic?.();
          }}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            minRating === 4.5
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          <span>4.5+</span>
        </button>
      </div>

      {/* Meta Row: Count & Export Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Найдено: <strong className="text-white font-bold">{totalFound}</strong>
          </span>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => {
              onSelectSortBy(e.target.value as any);
              onHaptic?.();
            }}
            className="bg-slate-900 text-slate-300 border border-slate-800 rounded-md text-[11px] px-2 py-0.5 focus:outline-none"
          >
            <option value="reviews">По отзывам</option>
            <option value="rating">По рейтингу</option>
            <option value="newest">Сначала новые</option>
            <option value="name">По алфавиту</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={() => {
            onOpenExport();
            onHaptic?.();
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Экспорт</span>
        </button>
      </div>
    </div>
  );
};
