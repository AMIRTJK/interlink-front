import React from 'react';
import { X, Search } from 'lucide-react';
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { ORDER_TYPES } from '../model';

export type TMinisterFilter = 'all' | 'signed' | 'unsigned';

export interface IOrderFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
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
  onTypesChange,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Тип приказа */}
        <div>
          <p className={labelCls}>Тип приказа</p>
          <Select
            mode="multiple"
            value={selectedTypes}
            onChange={onTypesChange}
            placeholder="Выберите типы приказов"
            options={ORDER_TYPES.map((type) => ({ value: type, label: type }))}
            style={{ width: '100%', minHeight: 34 }}
            className="text-xs"
          />
        </div>

        {/* Период */}
        <div>
          <p className={labelCls}>Период</p>
          <DatePicker.RangePicker
            value={[dateFrom ? dayjs(dateFrom) : null, dateTo ? dayjs(dateTo) : null]}
            onChange={(_dates: any, dateStrings: [string, string]) => {
              onDateFrom(dateStrings[0] || '');
              onDateTo(dateStrings[1] || '');
            }}
            style={{ width: '100%', height: 34 }}
          />
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
              style={{ height: 34 }}
            />
          </div>
        </div>

        {/* Подпись министра */}
        <div>
          <p className={labelCls}>Подпись министра</p>
          <Select
            value={ministerFilter}
            onChange={onMinisterFilter}
            options={MINISTER_OPTIONS.map((opt) => ({ value: opt.key, label: opt.label }))}
            style={{ width: '100%', height: 34 }}
            className="text-xs"
          />
        </div>
      </div>

      {/* Reset */}
      <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
        >
          <X size={12} />
          <span>Сбросить</span>
        </button>
      </div>
    </div>
  );
};

