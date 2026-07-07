import React from 'react';
import { X } from 'lucide-react';
import { ORDER_TYPES } from '../model';

export interface IOrderFiltersProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  onReset: () => void;
}

export const OrderFilters = ({
  selectedTypes,
  onTypeToggle,
  onReset,
}: IOrderFiltersProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Тип приказа
          </p>
          <div className="flex flex-wrap gap-2">
            {ORDER_TYPES.map((type) => {
              const isActive = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onTypeToggle(type)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F]'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Reset button */}
        <div className="flex items-center justify-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            <X size={14} />
            <span>Сбросить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
