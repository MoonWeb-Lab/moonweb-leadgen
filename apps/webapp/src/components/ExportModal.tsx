import React, { useState } from 'react';
import { X, FileSpreadsheet, Send, Download, Check, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  userChatId?: number | string | null;
  totalLeads: number;
  onHaptic?: (type?: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filters,
  userChatId,
  totalLeads,
  onHaptic
}) => {
  const [loadingTg, setLoadingTg] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendTelegram = async () => {
    if (!userChatId) {
      setErrorMsg('Не удалось определить ваш Telegram ID. Пожалуйста, используйте кнопку "Скачать на устройство".');
      return;
    }

    setLoadingTg(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.exportToTelegram(userChatId, filters);
      setSuccessMsg('Файл Excel отправлен в ваш диалог с ботом!');
      onHaptic?.('success');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2500);
    } catch (e: any) {
      setErrorMsg(e.message || 'Ошибка отправки в Telegram');
      onHaptic?.('error');
    } finally {
      setLoadingTg(false);
    }
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    setErrorMsg('');
    try {
      await api.downloadExcel(filters);
      onHaptic?.('success');
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Ошибка загрузки');
      onHaptic?.('error');
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0E172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Экспорт лидов в Excel</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Будет сформирован файл Excel со всеми контактами, телефонами, соцсетями и готовыми офферами для <strong className="text-white">{totalLeads} компаний</strong> по выбранным фильтрам.
        </p>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          {/* Send to Bot option */}
          <button
            onClick={handleSendTelegram}
            disabled={loadingTg || loadingDownload}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loadingTg ? 'Отправка...' : 'Отправить файл мне в Telegram'}</span>
          </button>

          {/* Browser Download option */}
          <button
            onClick={handleDownload}
            disabled={loadingTg || loadingDownload}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{loadingDownload ? 'Формирование...' : 'Скачать на устройство (.xlsx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
