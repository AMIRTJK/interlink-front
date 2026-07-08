import React from 'react';
import { ShieldCheck, Shield, ChevronRight } from 'lucide-react';
import { IOrderRecord, ORDER_STATUS_LABELS } from '../model';
import { getStatusConfig, getExecutorInitials } from '../lib';

export interface IOrderCardProps {
  order: IOrderRecord;
  index: number;
  onClick: (order: IOrderRecord) => void;
}

export const OrderCard = ({ order, index, onClick }: IOrderCardProps) => {
  const scfg = getStatusConfig(order.status);
  const execInitials = getExecutorInitials(order.executorName);
  const pointsCount = order.points.filter((p) => p.trim()).length;
  const attachmentsCount = order.attachments.length;

  return (
    <tr
      onClick={() => onClick(order)}
      className="group border-b last:border-b-0 border-b-slate-50 border-l-2 border-transparent transition-all cursor-pointer hover:border-l-[#1E3A5F] hover:bg-slate-50"
    >
      {/* № */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-slate-300">{index + 1}</span>
      </td>
      {/* Вид */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-[#1E3A5F]">{order.type}</span>
      </td>
      {/* Номер */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="font-mono text-xs rounded px-2 py-0.5 bg-slate-50 text-slate-600">
          {order.number}
        </span>
      </td>
      {/* Дата */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-slate-400">{order.date}</span>
      </td>
      {/* Исполнитель */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E3A5F, #4A90D9)' }}
          >
            {execInitials}
          </div>
          <span className="text-xs truncate max-w-[110px] text-slate-600">
            {order.executorName}
          </span>
        </div>
      </td>
      {/* Министр */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          {order.ministerSigned ? (
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          ) : (
            <Shield size={14} className="text-slate-300 shrink-0" />
          )}
          <span className="text-xs truncate max-w-[110px] text-slate-600">
            {order.ministerName}
          </span>
        </div>
      </td>
      {/* Пунктов */}
      <td className="px-4 py-3 hidden md:table-cell text-center">
        <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
          {pointsCount}
        </span>
      </td>
      {/* Приложений */}
      <td className="px-4 py-3 hidden md:table-cell text-center">
        <span
          className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
            attachmentsCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
          }`}
        >
          {attachmentsCount}
        </span>
      </td>
      {/* Статус */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${scfg.bg} ${scfg.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`} />
          <span>{ORDER_STATUS_LABELS[order.status] || order.status}</span>
        </span>
      </td>
      {/* Действия */}
      <td className="px-4 py-3">
        <ChevronRight
          size={15}
          className="text-slate-200 group-hover:text-[#1E3A5F] transition-opacity"
        />
      </td>
    </tr>
  );
};
