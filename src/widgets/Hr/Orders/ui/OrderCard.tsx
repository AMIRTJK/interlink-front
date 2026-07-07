import React from 'react';
import { ShieldCheck, Shield, ChevronRight } from 'lucide-react';
import { IOrderRecord } from '../model';
import { ORDER_STATUS_CONFIG, getExecutorInitials } from '../lib';

export interface IOrderCardProps {
  order: IOrderRecord;
  index: number;
  onClick: (order: IOrderRecord) => void;
}

export const OrderCard = ({ order, index, onClick }: IOrderCardProps) => {
  const scfg = ORDER_STATUS_CONFIG[order.status];
  const execInitials = getExecutorInitials(order.executorName);

  return (
    <tr
      onClick={() => onClick(order)}
      className="border-b last:border-b-0 border-slate-50 transition-all cursor-pointer hover:bg-slate-50"
    >
      {/* № */}
      <td className="px-5 py-4">
        <span className="text-[13px] text-slate-300 font-medium">{index + 1}</span>
      </td>
      {/* Вид */}
      <td className="px-5 py-4">
        <span className="text-[14px] font-semibold text-slate-800">
          {order.type}
        </span>
      </td>
      {/* Номер */}
      <td className="px-5 py-4 hidden sm:table-cell">
        <span className="font-mono text-[13px] text-slate-500 rounded bg-slate-50 px-2 py-0.5">
          {order.number}
        </span>
      </td>
      {/* Дата */}
      <td className="px-5 py-4 hidden md:table-cell">
        <span className="text-[13px] text-slate-500">{order.date}</span>
      </td>
      {/* Исполнитель */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            {execInitials}
          </div>
          <span className="text-[13px] text-slate-600 font-medium">
            {order.executorName}
          </span>
        </div>
      </td>
      {/* Министр */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          {order.ministerSigned ? (
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
          ) : (
            <Shield size={16} className="text-slate-300 shrink-0" />
          )}
          <span className="text-[13px] text-slate-600 font-medium">
            {order.ministerName}
          </span>
        </div>
      </td>
      {/* Пунктов */}
      <td className="px-5 py-4 hidden md:table-cell text-center">
        <span className="inline-flex items-center justify-center min-w-[24px] text-[13px] text-slate-500 font-medium">
          {order.points.filter((p) => p.trim()).length}
        </span>
      </td>
      {/* Приложений */}
      <td className="px-5 py-4 hidden md:table-cell text-center">
        <span
          className={`inline-flex items-center justify-center min-w-[24px] text-[13px] font-medium ${
            order.attachments.length > 0 ? 'text-blue-500' : 'text-slate-400'
          }`}
        >
          {order.attachments.length}
        </span>
      </td>
      {/* Статус */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border ${scfg.bg} ${scfg.text} border-transparent`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`} />
          <span>{order.status}</span>
        </span>
      </td>
      {/* Действия */}
      <td className="px-5 py-4 text-right">
        <ChevronRight size={16} className="text-slate-300 inline-block" />
      </td>
    </tr>
  );
};
