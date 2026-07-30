import React from 'react';
import { ShieldCheck, Shield, FileText } from 'lucide-react';
import { If } from '@shared/ui/If';
import { IOrderRecord, ORDER_STATUS_LABELS } from '../../model';
import { getStatusConfig, getExecutorInitials } from '../../lib';

interface IProps {
  record: IOrderRecord;
}

export const OrderDetailSidebar = ({ record }: IProps) => {
  const statusCfg = getStatusConfig(record.status);
  const executorInitials = getExecutorInitials(record.executorName);

  const sideCardCls = 'bg-white rounded-2xl shadow-sm p-4';
  const sideLabelCls =
    'text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3';

  return (
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
  );
};
