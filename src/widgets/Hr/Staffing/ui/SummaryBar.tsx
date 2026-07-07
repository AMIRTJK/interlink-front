import React from 'react';
import { motion } from 'framer-motion';
import { ISubOrganization } from '../model';
import { OccupancyRing } from './components/OccupancyRing';
import { AnimatedStatChip } from './components/AnimatedStatChip';
import { If } from '@shared/ui/If';

export interface ISummaryBarProps {
  organizations: ISubOrganization[];
  totalSlots: number;
  totalOccupied: number;
  totalVacant: number;
  totalFot: number;
  totalPositions: number;
  dark?: boolean;
}

export const SummaryBar = ({
  organizations,
  totalSlots,
  totalOccupied,
  totalVacant,
  totalFot,
  totalPositions,
  dark = false,
}: ISummaryBarProps) => {
  const summaryItems = [
    { label: 'Организаций', value: organizations.length, variant: 'default' as const },
    { label: 'Должностей', value: totalPositions, variant: 'indigo' as const },
    { label: 'Всего ставок', value: totalSlots, variant: 'default' as const },
    { label: 'Занято', value: totalOccupied, variant: 'emerald' as const },
    {
      label: 'Вакантно',
      value: totalVacant,
      variant: totalVacant > 0 ? ('amber' as const) : ('default' as const),
    },
  ];

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <If is={totalSlots > 0}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
            dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'
          }`}
        >
          <OccupancyRing slots={totalSlots} occupied={totalOccupied} size={36} dark={dark} />
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Укомплектованность
            </p>
            <p className={`text-xs font-bold tabular-nums ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              {totalOccupied}/{totalSlots} ставок
            </p>
          </div>
        </motion.div>
      </If>

      {summaryItems.map((item, i) => (
        <AnimatedStatChip
          key={item.label}
          label={item.label}
          value={item.value}
          variant={item.variant}
          dark={dark}
          index={i}
        />
      ))}

      <If is={totalFot > 0}>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className={`px-3 py-2 rounded-xl border text-center min-w-[80px] ${
            dark
              ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800/40'
              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-0.5">
            ФОТ (мес)
          </p>
          <p className="text-sm font-bold">₽{(totalFot / 1000).toFixed(0)}K</p>
        </motion.div>
      </If>
    </div>
  );
};
