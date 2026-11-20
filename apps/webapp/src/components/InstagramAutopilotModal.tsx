import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  RotateCcw,
  Terminal,
  X,
  Send
} from 'lucide-react';
import { generateClientOffer } from '../services/clientOfferService.js';

interface InstagramAutopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: any[];
  onHaptic?: () => void;
}

const DAILY_LIMIT = 15;
const STORAGE_KEY_PREFIX = 'moonweb_ig_autopilot_';

export const InstagramAutopilotModal: React.FC<InstagramAutopilotModalProps> = ({
  isOpen,
  onClose,
  leads,
  onHaptic,
}) => {
  // Текущая дата YYYY-MM-DD
  const todayKey = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Список отправленных ID за сегодня
  const [sentLeadIds, setSentLeadIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${todayKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Выбираем строго 15 целевых компаний без сайта с Инстаграмом
  const candidateLeads = useMemo(() => {
    return leads
      .filter((lead) => !lead.hasRealWebsite && Boolean(lead.instagram))
      .slice(0, DAILY_LIMIT);
  }, [leads]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'interactive' | 'robot'>('interactive');
  const [copiedCli, setCopiedCli] = useState(false);

  // Синхронизация localStorage
  const markAsSent = (leadId: number) => {
    setSentLeadIds((prev) => {
      if (prev.includes(leadId)) return prev;
      const updated = [...prev, leadId];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${todayKey}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });
  };

  const resetTodayLog = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${todayKey}`);
      setSentLeadIds([]);
      setCurrentIndex(0);
      setToastMessage('Счётчик сегодняшних отправок сброшен!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Таймер анти-бан паузы (60 секунд)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const currentLead = candidateLeads[currentIndex] || candidateLeads[0];
  const isCurrentSent = currentLead ? sentLeadIds.includes(currentLead.id) : false;
  const sentCount = sentLeadIds.length;
  const remainingQuota = Math.max(0, DAILY_LIMIT - sentCount);

  // Генерируем живой оффер под текущего кандидата
  const currentOffer = useMemo(() => {
    if (!currentLead) return null;
    return generateClientOffer({
      id: currentLead.id,
      name: currentLead.name,
      cityName: currentLead.cityName || 'Минск',
      subcategoryId: currentLead.subcategoryId,
      instagram: currentLead.instagram,
      phonePrimary: currentLead.phonePrimary,
    });
  }, [currentLead]);

  const handleSendAction = () => {
    if (!currentLead || !currentOffer) return;
    onHaptic?.();

    // 1. Копируем готовый оффер в буфер
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOffer.messageText);
    }

    const cleanHandle = (currentLead.instagram || '').replace('@', '').trim();
    // 2. Открываем Direct диалог
    const igDirectUrl = `https://www.instagram.com/direct/t/${cleanHandle}/`;
    window.open(igDirectUrl, '_blank', 'noopener,noreferrer');

    // 3. Отмечаем отправку и запускаем защитную паузу
    markAsSent(currentLead.id);
    setCooldownSeconds(60);
    setToastMessage(`Оффер скопирован! Открыли Direct @${cleanHandle}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNextLead = () => {
    onHaptic?.();
    if (currentIndex < candidateLeads.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevLead = () => {
    onHaptic?.();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const copyCliCommand = () => {
    onHaptic?.();
    const cmd = 'npm run instagram:outreach';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
    }
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        
        {/* Toast Notification */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 z-[60] bg-emerald-600 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#0A101F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-[#0A101F] to-pink-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 p-[1.5px] shadow-lg shadow-pink-500/20">
                <div className="w-full h-full bg-[#0A101F] rounded-[14px] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white tracking-tight">
                    Автопилот Instagram
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    15 в день
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Поиск клиентов без сайта и отправка в Direct
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onHaptic?.();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-4 pt-3 flex gap-2 border-b border-white/5 bg-[#070C18]/50">
            <button
              onClick={() => {
                setActiveTab('interactive');
                onHaptic?.();
              }}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'interactive'
                  ? 'border-pink-500 text-pink-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Пошаговый автопилот</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('robot');
                onHaptic?.();
              }}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'robot'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Автономный робот (Chrome)</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* Daily Safety Quota Banner */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Лимит безопасности Meta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {sentCount} <span className="text-slate-400">/ {DAILY_LIMIT}</span>
                  </span>
                  {sentCount > 0 && (
                    <button
                      onClick={resetTodayLog}
                      className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 underline"
                      title="Сбросить локальный счетчик"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>сброс</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (sentCount / DAILY_LIMIT) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {sentCount >= DAILY_LIMIT ? (
                  <span className="text-amber-300 font-semibold">
                    🎉 Дневная квота (15/15) закрыта! Лимит защищает аккаунт @moonweb_labs от теневого бана.
                  </span>
                ) : (
                  <span>
                    Осталось отправить: <strong className="text-white">{remainingQuota}</strong> из 15 целевых компаний без сайта на сегодня.
                  </span>
                )}
              </p>
            </div>

            {/* TAB 1: INTERACTIVE STEP-BY-STEP */}
            {activeTab === 'interactive' && (
              <>
                {candidateLeads.length === 0 ? (
                  <div className="text-center py-8 space-y-2 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
                    <p className="text-xs">В текущей выборке нет лидов с Instagram и без сайта.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Navigation between today's 15 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">
                        Бизнес {currentIndex + 1} из {candidateLeads.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handlePrevLead}
                          disabled={currentIndex === 0}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs"
                        >
                          ← Назад
                        </button>
                        <button
                          onClick={handleNextLead}
                          disabled={currentIndex >= candidateLeads.length - 1}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs"
                        >
                          Вперёд →
                        </button>
                      </div>
                    </div>

                    {/* Target Business Card */}
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-white">{currentLead.name}</h4>
                            {isCurrentSent && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Отправлено</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {currentLead.cityName || 'Беларусь'} •{' '}
                            <span className="text-pink-400 font-semibold">
                              @{currentLead.instagram?.replace('@', '')}
                            </span>
                          </p>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 font-semibold shrink-0">
                          Нет сайта
                        </span>
                      </div>

                      {/* Pitch Text Box */}
                      {currentOffer && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-pink-400" />
                            <span>Готовое живое сообщение (Humanizer):</span>
                          </label>
                          <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-200 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto leading-relaxed selection:bg-pink-500/30">
                            {currentOffer.messageText}
                          </div>
                        </div>
                      )}

                      {/* Anti-ban Countdown Alert */}
                      {cooldownSeconds > 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2">
                          <Clock className="w-4 h-4 animate-spin shrink-0" />
                          <span>
                            Защитная пауза: подождите <strong>{cooldownSeconds} сек</strong> перед отправкой следующему
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleSendAction}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
                        >
                          <Instagram className="w-4 h-4" />
                          <span>Открыть Direct и скопировать оффер</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextLead}
                          disabled={currentIndex >= candidateLeads.length - 1}
                          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Пропустить →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: AUTONOMOUS PLAYWRIGHT ROBOT */}
            {activeTab === 'robot' && (
              <div className="space-y-4">
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>Автономный робот (Playwright в реальном Google Chrome)</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Робот откроет настоящий браузер Google Chrome на твоём компьютере, зайдёт под твоим аккаунтом Instagram, последовательно найдёт отобранные 15 бизнесов без сайта и сам отправит персонализированные сообщения в Direct с паузой 1–2 минуты.
                  </p>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-3">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Команда для запуска робота в терминале проекта:
                  </label>
                  <div className="flex items-center justify-between gap-2 bg-[#050811] border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-pink-300 overflow-x-auto">
                    <code>npm run instagram:outreach</code>
                    <button
                      onClick={copyCliCommand}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] font-sans font-semibold flex items-center gap-1 transition-colors shrink-0"
                    >
                      {copiedCli ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    💡 При первом запуске откроется окно Chrome — просто войдите в аккаунт @moonweb_labs один раз, сессия сохранится навсегда.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-[#070C18]/90 flex items-center justify-between text-xs text-slate-400">
            <span>Студия MoonWeb Lab • Лидген 2026</span>
            <button
              onClick={() => {
                onHaptic?.();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
