import React from 'react';
import { Network, Plus } from 'lucide-react';

interface IProps {
  containerBg: string;
  dark?: boolean;
  onAddOrg: () => void;
}

export function EmptyBubbleState({ containerBg, dark = false, onAddOrg }: IProps) {
  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col items-center justify-center py-20 gap-5 ${containerBg}`}
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
          <Network size={32} className="text-indigo-400" />
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg absolute -bottom-1 -right-1">
          <Plus size={14} className="text-white" />
        </div>
      </div>
      <div className="text-center">
        <p className={`text-base font-bold mb-1 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
          Нет организаций
        </p>
        <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          Добавьте организацию для отображения структуры
        </p>
      </div>
      <button
        onClick={onAddOrg}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
      >
        <Plus size={15} />
        <span>Добавить организацию</span>
      </button>
    </div>
  );
}
