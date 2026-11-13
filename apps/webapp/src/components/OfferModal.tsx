import React, { useState } from 'react';
import { X, Copy, Check, Send, Sparkles, Lightbulb } from 'lucide-react';

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
  onHaptic?: (type?: any) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  offer,
  tgLink,
  onHaptic
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !offer) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.messageText).then(() => {
      setCopied(true);
      onHaptic?.('success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm transition-all">
      <div 
        className="w-full max-w-lg bg-[#0E172A] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Персональный оффер</h2>
              <p className="text-[11px] text-slate-400">для {offer.businessName} ({offer.city})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Key hooks banner */}
          {offer.keyHooks && offer.keyHooks.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Главные триггеры для этой ниши:</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-sky-400">
                {offer.keyHooks.map((hook, i) => (
                  <li key={i}>{hook}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Message Text Container */}
          <div className="relative">
            <textarea
              readOnly
              value={offer.messageText}
              rows={9}
              className="w-full p-3 rounded-xl bg-[#070C18] border border-slate-700/80 text-slate-200 text-xs font-sans leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/80 border-t border-white/10 grid grid-cols-2 gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Скопировать текст</span>
              </>
            )}
          </button>

          {/* Direct TG send */}
          {tgLink ? (
            <a
              href={tgLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Перейти в чат</span>
            </a>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <span>Готово к отправке</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
