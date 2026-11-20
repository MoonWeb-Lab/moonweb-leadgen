import React, { useState } from 'react';
import { Star, MapPin, Send, Phone, Instagram, Sparkles, ChevronDown, ExternalLink, Check, MessageSquare } from 'lucide-react';

export interface Lead {
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
  yandexMapsUrl?: string;
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

export const LeadCard: React.FC<LeadCardProps> = React.memo(({
  lead,
  onOpenOffer,
  onUpdateCrmStatus,
  onHaptic
}) => {
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const currentCrm = CRM_STATUSES.find(s => s.key === lead.crmStatus) || CRM_STATUSES[0];

  // Guaranteed working Yandex Maps search URL
  const yandexUrl = lead.yandexMapsUrl || `https://yandex.ru/maps/?text=${encodeURIComponent(lead.cityName + ', ' + lead.name + (lead.address ? ', ' + lead.address : ''))}`;

  // Safe external link opener for Telegram Mini App and Web
  const openExternal = (e: React.MouseEvent, url?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;
    onHaptic?.();
    const tg = window.Telegram?.WebApp;
    if (tg && typeof tg.openLink === 'function') {
      tg.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const cleanPhone = (lead.phonePrimary || '').replace(/[^0-9]/g, '');
  const isUsername = Boolean(lead.telegram && !/^\+?\d+$/.test(lead.telegram));
  const effectiveUsername = isUsername ? lead.telegram!.replace('@', '').trim() : '';

  // Bulletproof Telegram Handler: NEVER redirects to telegram.org
  const handleTelegramClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHaptic?.();

    if (effectiveUsername) {
      // Direct username URL works 100% reliably
      const tgUsernameUrl = `https://t.me/${effectiveUsername}`;
      const tg = window.Telegram?.WebApp;
      if (tg && typeof tg.openTelegramLink === 'function') {
        tg.openTelegramLink(tgUsernameUrl);
      } else {
        window.open(tgUsernameUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (cleanPhone) {
      // Copy phone number to clipboard so user can immediately paste in Telegram search
      if (navigator.clipboard) {
        navigator.clipboard.writeText('+' + cleanPhone);
      }
      setCopiedNotice(`Номер +${cleanPhone} скопирован для поиска в Telegram!`);
      setTimeout(() => setCopiedNotice(null), 3500);

      // Deep link to native client
      const tgAppUrl = `tg://resolve?phone=${cleanPhone}`;
      const tg = window.Telegram?.WebApp;
      if (tg && typeof tg.openTelegramLink === 'function') {
        tg.openTelegramLink(tgAppUrl);
      } else {
        window.location.href = tgAppUrl;
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3 relative overflow-hidden bg-slate-900/60 shadow-lg">
      
      {/* Toast Notice when phone is copied */}
      {copiedNotice && (
        <div className="absolute top-2 left-2 right-2 z-20 bg-emerald-600 text-white text-xs py-1.5 px-3 rounded-xl flex items-center gap-2 shadow-xl animate-fade-in">
          <Check className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="font-semibold truncate">{copiedNotice}</span>
        </div>
      )}

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
            className={`appearance-none text-[11px] font-semibold py-1 pl-2.5 pr-6 rounded-lg border cursor-pointer focus:outline-none transition-colors ${currentCrm.color}`}
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
        
        {/* Clickable address with Yandex Maps integration */}
        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <button
            type="button"
            onClick={(e) => openExternal(e, yandexUrl)}
            className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors text-left group cursor-pointer"
            title="Открыть адрес на Яндекс Картах"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <strong className="text-slate-200">{lead.cityName}</strong>
            {lead.address && <span className="text-slate-400">• {lead.address}</span>}
          </button>
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

      {/* Contacts, Yandex Maps & Socials bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
        {/* Phone call button */}
        <div className="flex items-center gap-1.5">
          {lead.phonePrimary && (
            <a
              href={lead.phoneLink || `tel:${lead.phonePrimary}`}
              className="font-mono text-emerald-400 font-semibold hover:underline flex items-center gap-1 py-1"
            >
              <Phone className="w-3 h-3 text-emerald-400/80" />
              <span>{lead.phonePrimary}</span>
            </a>
          )}
        </div>

        {/* Action icons: Yandex Maps & Instagram */}
        <div className="flex items-center gap-1.5">
          {/* YANDEX MAPS BUTTON */}
          <button
            type="button"
            onClick={(e) => openExternal(e, yandexUrl)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] font-semibold transition-colors shadow-sm cursor-pointer"
            title="Открыть организацию в Яндекс Картах"
          >
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>Карты</span>
            <ExternalLink className="w-2.5 h-2.5 text-amber-400/70" />
          </button>

          {/* INSTAGRAM BUTTON */}
          {lead.instagram && (
            <button
              type="button"
              onClick={(e) => {
                const cleanInsta = lead.instagram!.replace('@', '').trim();
                const url = cleanInsta.startsWith('http') 
                  ? cleanInsta 
                  : `https://www.instagram.com/${cleanInsta}/`;
                openExternal(e, url);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 hover:text-fuchsia-200 text-[11px] font-semibold border border-fuchsia-500/30 transition-colors shadow-sm cursor-pointer"
              title="Открыть Instagram организации"
            >
              <Instagram className="w-3 h-3 text-fuchsia-400" />
              <span>Insta</span>
            </button>
          )}

          {/* WhatsApp Direct link if phone is present */}
          {cleanPhone && (
            <button
              type="button"
              onClick={(e) => openExternal(e, `https://wa.me/${cleanPhone}`)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 text-[11px] font-semibold border border-emerald-500/30 transition-colors shadow-sm cursor-pointer"
              title="Написать в WhatsApp"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>WA</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Telegram Direct Button with Bulletproof Safe Handler */}
        <button
          type="button"
          onClick={handleTelegramClick}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
          title={effectiveUsername ? `Открыть @${effectiveUsername}` : `Скопировать +${cleanPhone} и открыть Telegram`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{effectiveUsername ? 'В Telegram (@)' : 'В Telegram (номер)'}</span>
        </button>

        {/* Generate Offer Button */}
        <button
          type="button"
          onClick={() => {
            onOpenOffer(lead);
            onHaptic?.();
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-sky-300 border border-sky-500/40 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Оффер MoonWeb</span>
        </button>
      </div>
    </div>
  );
});

LeadCard.displayName = 'LeadCard';
