import React, { useState } from 'react';
import { X, Copy, Check, Send, Instagram, Lightbulb, Sparkles, MessageCircle } from 'lucide-react';
import avatarImg from '../assets/avatar.jpg';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    businessName: string;
    city: string;
    niche: string;
    messageText: string;
    keyHooks: string[];
    suggestedAction: string;
  } | null;
  tgLink?: string;
  instagram?: string;
  onHaptic?: (type?: any) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  offer,
  tgLink,
  instagram,
  onHaptic,
}) => {
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  if (!isOpen || !offer) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.messageText).then(() => {
      setCopied(true);
      onHaptic?.('success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const instagramDirectUrl = instagram
    ? `https://instagram.com/${instagram.replace(/^@/, '')}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0C101D] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Studio Identity */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0E1526]/80">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0 bg-[#141B2D]">
              {!avatarError ? (
                <img
                  src={avatarImg}
                  alt="MoonWeb Lab"
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
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0C101D]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">MoonWeb Lab</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  На связи
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Оффер для: <strong className="text-white">{offer.businessName}</strong> ({offer.city})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрыть окно оффера"
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Key hooks banner */}
          {offer.keyHooks && offer.keyHooks.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span>Ключевые выгоды для этой ниши:</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-purple-400 leading-relaxed">
                {offer.keyHooks.map((hook, i) => (
                  <li key={i}>{hook}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Message Text Container */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Готовый текст сообщения (без канцелярита):</span>
              </span>
              <span>{offer.suggestedAction}</span>
            </div>

            <textarea
              readOnly
              value={offer.messageText}
              rows={11}
              className="w-full p-3.5 rounded-2xl bg-[#070B16] border border-white/10 text-slate-200 text-xs font-sans leading-relaxed focus:outline-none resize-none selection:bg-purple-500/30 selection:text-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0E1526]/80 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white hover:bg-neutral-200 text-black shadow-md'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-black" />
                <span>Скопировать готовый оффер</span>
              </>
            )}
          </button>

          {/* Action to Telegram */}
          {tgLink && (
            <button
              type="button"
              onClick={() => {
                onHaptic?.();
                const tg = window.Telegram?.WebApp;
                if (tg && typeof tg.openTelegramLink === 'function') {
                  tg.openTelegramLink(tgLink);
                } else {
                  window.open(tgLink, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>Написать в Telegram</span>
            </button>
          )}

          {/* Action to Instagram */}
          {instagramDirectUrl && (
            <button
              type="button"
              onClick={() => {
                onHaptic?.();
                const tg = window.Telegram?.WebApp;
                if (tg && typeof tg.openLink === 'function') {
                  tg.openLink(instagramDirectUrl);
                } else {
                  window.open(instagramDirectUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
