import React from 'react';
import { GitBranch, Plus } from 'lucide-react';

interface IProps {
  dark?: boolean;
  onAddOrg: () => void;
}

export function EmptyOrgTreeState({ dark = false, onAddOrg }: IProps) {
  const containerBg = dark ? 'bg-gray-900/60 border-gray-700/60' : 'bg-white border-gray-100';

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col items-center justify-center py-20 gap-5 ${containerBg}`}
    >
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
        <GitBranch size={28} className="text-indigo-400" />
      </div>
      <div className="text-center">
        <p className={`text-base font-bold mb-1 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
          Структура пустая
        </p>
        <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          Добавьте организацию для построения иерархии
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
