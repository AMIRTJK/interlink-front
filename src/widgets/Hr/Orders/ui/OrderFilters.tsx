import React from 'react';
import { X, Calendar, Search } from 'lucide-react';
import { ORDER_TYPES } from '../model';

export type TMinisterFilter = 'all' | 'signed' | 'unsigned';

export interface IOrderFiltersProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  executorQuery: string;
  onExecutorQuery: (v: string) => void;
  ministerFilter: TMinisterFilter;
  onMinisterFilter: (v: TMinisterFilter) => void;
  onReset: () => void;
}

const labelCls = 'text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2';
const smallInputCls =
  'w-full pr-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] transition-all';

const MINISTER_OPTIONS: { key: TMinisterFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'signed', label: 'Подписан' },
  { key: 'unsigned', label: 'Не подписан' },
];

export const OrderFilters = ({
  selectedTypes,
  onTypeToggle,
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  executorQuery,
  onExecutorQuery,
  ministerFilter,
  onMinisterFilter,
  onReset,
}: IOrderFiltersProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Тип приказа */}
        <div>
          <p className={labelCls}>Тип приказа</p>
          <div className="flex flex-wrap gap-1.5">
            {ORDER_TYPES.map((type) => {
              const isActive = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onTypeToggle(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F]'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Период */}
        <div>
          <p className={labelCls}>Период</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFrom(e.target.value)}
                className={`${smallInputCls} pl-8`}
              />
            </div>
            <span className="text-slate-400 text-xs shrink-0">—</span>
            <div className="relative flex-1">
              <Calendar
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateTo(e.target.value)}
                className={`${smallInputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        {/* Исполнитель */}
        <div>
          <p className={labelCls}>Исполнитель</p>
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Имя исполнителя..."
              value={executorQuery}
              onChange={(e) => onExecutorQuery(e.target.value)}
              className={`${smallInputCls} pl-8 pr-3`}
            />
          </div>
        </div>

        {/* Подпись министра */}
        <div>
          <p className={labelCls}>Подпись министра</p>
          <div className="flex items-center gap-1.5">
            {MINISTER_OPTIONS.map((opt) => {
              const isActive = ministerFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onMinisterFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          <X size={12} />
          <span>Сбросить</span>
        </button>
      </div>
    </div>
  );
};
