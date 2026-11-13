import React from 'react';
import { Star, MapPin, Send, Phone, Instagram, Sparkles, ChevronDown } from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  cityName: string;
  address: string;
  categoryName?: string;
  categoryEmoji?: string;
  rating: number;
  reviewsCount: number;
  hasRealWebsite: boolean;
  phonePrimary: string;
  instagram?: string;
  telegram?: string;
  tgLink?: string;
  phoneLink?: string;
  crmStatus: string;
}

interface LeadCardProps {
  lead: Lead;
  onOpenOffer: (lead: Lead) => void;
  onUpdateCrmStatus: (leadId: number, status: string) => void;
  onHaptic?: () => void;
}

const CRM_STATUSES = [
  { key: 'new', label: '🆕 Новый', color: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  { key: 'contacted', label: '💬 Написали', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { key: 'in_progress', label: '⏳ В работе', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { key: 'won', label: '🤝 Сделка', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { key: 'rejected', label: '❌ Отказ', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
];

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onOpenOffer,
  onUpdateCrmStatus,
  onHaptic
}) => {
  const currentCrm = CRM_STATUSES.find(s => s.key === lead.crmStatus) || CRM_STATUSES[0];

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3 relative overflow-hidden">
      {/* Top row: Badges and CRM selector */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* No website badge */}
          {!lead.hasRealWebsite ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-950/50">
              🔥 Без сайта
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
              🌐 Есть сайт
            </span>
          )}

          {/* Category pill */}
          {lead.categoryName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
              <span>{lead.categoryEmoji}</span>
              <span>{lead.categoryName}</span>
            </span>
          )}
        </div>

        {/* CRM Status Dropdown */}
        <div className="relative">
          <select
            value={lead.crmStatus || 'new'}
            onChange={(e) => {
              onUpdateCrmStatus(lead.id, e.target.value);
              onHaptic?.();
            }}
            className={`appearance-none text-[11px] font-semibold py-1 pl-2.5 pr-6 rounded-lg border cursor-pointer focus:outline-none transition-all ${currentCrm.color}`}
          >
            {CRM_STATUSES.map(s => (
              <option key={s.key} value={s.key} className="bg-slate-900 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>
      </div>

      {/* Main Info */}
      <div>
        <h3 className="font-bold text-base text-white tracking-tight leading-snug">
          {lead.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <strong className="text-slate-300">{lead.cityName}</strong>
            {lead.address && <span className="text-slate-500">• {lead.address}</span>}
          </span>
        </div>

        {/* Rating and Reviews */}
        {lead.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{lead.rating.toFixed(1)}</span>
            </div>
            {lead.reviewsCount > 0 && (
              <span className="text-slate-500">
                ({lead.reviewsCount} {lead.reviewsCount === 1 ? 'отзыв' : lead.reviewsCount < 5 ? 'отзыва' : 'отзывов'})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Phone and Socials bar */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
        <div className="flex items-center gap-2">
          {lead.phonePrimary && (
            <a
              href={lead.phoneLink || `tel:${lead.phonePrimary}`}
              className="font-mono text-emerald-400 font-semibold hover:underline"
            >
              {lead.phonePrimary}
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lead.instagram && (
            <a
              href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 text-[11px] font-semibold border border-fuchsia-500/30 transition-all"
            >
              <Instagram className="w-3 h-3" />
              <span>Insta</span>
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Telegram Direct Button */}
        {lead.tgLink ? (
          <a
            href={lead.tgLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => onHaptic?.()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-sm shadow-sky-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>В Telegram</span>
          </a>
        ) : (
          <a
            href={lead.phoneLink || `tel:${lead.phonePrimary}`}
            onClick={() => onHaptic?.()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Позвонить</span>
          </a>
        )}

        {/* Generate Offer Button */}
        <button
          onClick={() => {
            onOpenOffer(lead);
            onHaptic?.();
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-sky-300 border border-sky-500/40 font-semibold text-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Оффер MoonWeb</span>
        </button>
      </div>
    </div>
  );
};
