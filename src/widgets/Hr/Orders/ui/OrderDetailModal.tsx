import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, X, ShieldCheck, Shield, FileText } from 'lucide-react';
import { If } from '@shared/ui/If';
import { IOrderRecord, ORDER_STATUS_LABELS } from '../model';
import { getStatusConfig, parseDate, getExecutorInitials } from '../lib';

export interface IOrderDetailModalProps {
  record: IOrderRecord;
  onClose: () => void;
  onEdit: () => void;
}

export const OrderDetailModal = ({
  record,
  onClose,
  onEdit,
}: IOrderDetailModalProps) => {
  const statusCfg = getStatusConfig(record.status);
  const executorInitials = getExecutorInitials(record.executorName);
  const { day, month, year } = parseDate(record.date || record.orderDate || '');

  const sideCardCls = 'bg-white rounded-2xl shadow-sm p-4';
  const sideLabelCls =
    'text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3';

  return (
    <div className="fixed inset-4 z-50 flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
        onClick={onClose}
      />

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-[#1E3A5F] text-base leading-tight truncate">
              <span>Приказ №</span>
              <span>{record.number}</span>
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${statusCfg.bg} ${statusCfg.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span>{ORDER_STATUS_LABELS[record.status] || record.status}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1E3A5F] text-[#1E3A5F] text-sm font-medium hover:bg-[#1E3A5F]/5 transition-colors"
          >
            <Pencil size={14} />
            <span>Редактировать</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* MODAL BODY */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
        <div className="flex gap-6 h-full">
          {/* LEFT — Document card */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-4xl border border-gray-200 bg-gray-50"
                    aria-label="Герб"
                  >
                    🇹🇯
                  </div>
                </div>
                <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide leading-snug">
                  МИНИСТЕРСТВО ФИНАНСОВ РЕСПУБЛИКИ ТАДЖИКИСТАН
                </p>
                <div className="border-t border-gray-300 my-3" />
                <p className="text-[20px] font-bold text-gray-900 tracking-[0.22em]">
                  П Р И К А З
                </p>
                <p className="text-[12px] text-slate-500 italic mt-1">
                  {record.type}
                </p>
              </div>

              {/* Date/Number row */}
              <div className="flex items-baseline justify-between gap-4 mb-5 text-sm text-gray-700">
                <span>
                  <span>от «</span>
                  <span>{day}</span>
                  <span>» </span>
                  <span>{month}</span>
                  <span> </span>
                  <span>{year}</span>
                  <span>г.</span>
                </span>
                <span>
                  <span>№ </span>
                  <span className="font-semibold">{record.number}</span>
                </span>
              </div>

              {/* Legal body */}
              <p className="text-[12px] text-gray-600 leading-relaxed mb-4 text-justify">
                В соответствии с постановлением Правительства Республики Таджикистан
                от 31 октября 2014 года, №694 «О порядке назначения на должности и
                освобождения от должностей руководителей местных структур
                центральных органов исполнительной власти государства» и пунктом 12
                Положения о Министерстве финансов Республики Таджикистан,
                утверждённого постановлением Правительства Республики Таджикистан от
                2 апреля 2015 года, №187,
              </p>

              <If is={record.basis.trim().length > 0}>
                <p className="text-[12px] text-gray-500 italic mb-4 text-justify leading-relaxed">
                  {record.basis}
                </p>
              </If>

              <p className="text-center text-[13px] font-bold text-gray-900 tracking-[0.18em] mb-5">
                П Р И К А З Ы В А Ю:
              </p>

              <If is={record.points.filter((p) => p.trim()).length > 0}>
                <div className="space-y-3 mb-6">
                  {record.points
                    .filter((p) => p.trim())
                    .map((point, idx) => (
                      <p
                        key={`pt-${idx}`}
                        className="text-[12px] text-gray-800 leading-relaxed"
                      >
                        <span className="font-semibold">{idx + 1}. </span>
                        <span>{point}</span>
                      </p>
                    ))}
                </div>
              </If>

              {/* Signature row */}
              <div className="flex items-end justify-between gap-8 pt-6 border-t border-gray-200 mt-6">
                <div>
                  <p className="text-[12px] font-medium text-gray-800 mb-1">
                    Министр финансов
                  </p>
                  <div className="w-28 border-b border-gray-400 mt-5" />
                </div>
                <div className="text-right flex items-center gap-2 justify-end">
                  <If is={record.ministerSigned}>
                    <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  </If>
                  <If is={!record.ministerSigned}>
                    <Shield size={15} className="text-slate-300 shrink-0" />
                  </If>
                  <p className="text-[12px] font-semibold text-gray-800">
                    {record.ministerName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Card 1 — РЕКВИЗИТЫ */}
            <div className={sideCardCls}>
              <p className={sideLabelCls}>РЕКВИЗИТЫ</p>
              <div className="space-y-0 divide-y divide-slate-50">
                <div className="py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium mb-0.5">Тип</p>
                  <p className="text-sm font-medium text-[#1E3A5F] leading-tight">
                    {record.type}
                  </p>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium mb-0.5">Номер</p>
                  <span className="inline-block font-mono text-sm bg-slate-50 rounded px-2 py-0.5 text-slate-700">
                    {record.number}
                  </span>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium mb-0.5">Дата</p>
                  <p className="text-sm text-slate-400">{record.date || record.orderDate}</p>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium mb-0.5">Статус</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    <span>{ORDER_STATUS_LABELS[record.status] || record.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 — ИСПОЛНИТЕЛЬ */}
            <div className={sideCardCls}>
              <p className={sideLabelCls}>ИСПОЛНИТЕЛЬ</p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1E3A5F, #4A90D9)' }}
                >
                  {executorInitials}
                </div>
                <p className="text-sm font-medium text-slate-800 leading-tight">
                  {record.executorName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <If is={record.executorSigned}>
                  <ShieldCheck size={14} className="text-emerald-500" />
                </If>
                <If is={!record.executorSigned}>
                  <Shield size={14} className="text-slate-300" />
                </If>
                <span
                  className={`text-xs font-medium ${
                    record.executorSigned ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {record.executorSigned ? 'ЭЦП подписан' : 'ЭЦП не подписан'}
                </span>
              </div>
            </div>

            {/* Card 3 — ПРИЛОЖЕНИЯ */}
            <div className={sideCardCls}>
              <p className={sideLabelCls}>ПРИЛОЖЕНИЯ</p>
              <If is={record.attachments.length === 0}>
                <p className="text-sm text-slate-400">Нет приложений</p>
              </If>
              <If is={record.attachments.length > 0}>
                <div className="space-y-2">
                  {record.attachments.map((att) => (
                    <a
                      key={`att-${att.id}`}
                      href={att.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <FileText size={13} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-blue-600 truncate flex-1 hover:underline">
                        {att.original_name}
                      </span>
                    </a>
                  ))}
                </div>
              </If>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
