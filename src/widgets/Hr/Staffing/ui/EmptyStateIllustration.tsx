import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { If } from '@shared/ui/If';

export interface IEmptyStateProps {
  onAddOrg: () => void;
  dark?: boolean;
  hasSearch?: boolean;
  search?: string;
}

export const EmptyStateIllustration = ({
  onAddOrg,
  dark = false,
  hasSearch = false,
  search = '',
}: IEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border shadow-sm py-16 flex flex-col items-center justify-center gap-6 ${
        dark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-100'
      }`}
    >
      <div className="relative">
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="60" r="55" fill={dark ? '#1f2937' : '#f8fafc'} />
          <circle cx="80" cy="60" r="42" fill={dark ? '#374151' : '#f1f5f9'} />
          <rect x="55" y="28" width="50" height="32" rx="6" fill={dark ? '#4f46e5' : '#6366f1'} opacity="0.9" />
          <line x1="80" y1="60" x2="50" y2="76" stroke={dark ? '#6366f1' : '#a5b4fc'} strokeWidth="2" strokeDasharray="3 2" />
          <line x1="80" y1="60" x2="80" y2="76" stroke={dark ? '#6366f1' : '#a5b4fc'} strokeWidth="2" strokeDasharray="3 2" />
          <line x1="80" y1="60" x2="110" y2="76" stroke={dark ? '#6366f1' : '#a5b4fc'} strokeWidth="2" strokeDasharray="3 2" />
          <rect x="32" y="76" width="36" height="22" rx="5" fill={dark ? '#10b981' : '#d1fae5'} />
          <rect x="62" y="76" width="36" height="22" rx="5" fill={dark ? '#3b82f6' : '#dbeafe'} />
          <rect x="92" y="76" width="36" height="22" rx="5" fill={dark ? '#f59e0b' : '#fef3c7'} />
          <circle cx="80" cy="108" r="10" fill={dark ? '#4f46e5' : '#6366f1'} />
          <line x1="80" y1="104" x2="80" y2="112" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="76" y1="108" x2="84" y2="108" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center px-6">
        <h3 className={`text-base font-bold mb-2 ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
          {hasSearch ? 'Ничего не найдено' : 'Структура пустая'}
        </h3>
        <p className={`text-sm max-w-xs mx-auto leading-relaxed ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          {hasSearch
            ? `По запросу «${search}» ничего не найдено.`
            : 'Добавьте первую организацию, чтобы начать формирование штатного расписания'}
        </p>
      </div>
      <If is={!hasSearch}>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddOrg}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/25"
        >
          <Plus size={16} />
          <span>Добавить организацию</span>
        </motion.button>
      </If>
    </motion.div>
  );
};
