import React from 'react';
import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../../lib';

export interface IAnimatedStatChipProps {
  label: string;
  value: number;
  suffix?: string;
  variant?: 'default' | 'emerald' | 'amber' | 'indigo' | 'rose';
  dark?: boolean;
  index?: number;
}

export const AnimatedStatChip = ({
  label,
  value,
  suffix = '',
  variant = 'default',
  dark = false,
  index = 0,
}: IAnimatedStatChipProps) => {
  const count = useAnimatedCounter(value, 900, 100 + index * 80);

  const lightStyles: Record<string, string> = {
    default: 'bg-gray-50 text-gray-700 border-gray-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const darkStyles: Record<string, string> = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    emerald: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
    amber: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
    indigo: 'bg-indigo-900/30 text-indigo-400 border-indigo-800/40',
    rose: 'bg-rose-900/30 text-rose-400 border-rose-800/40',
  };

  const style = dark ? darkStyles[variant] : lightStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`px-3 py-2 rounded-xl border text-center min-w-[72px] ${style}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold tabular-nums">
        {count}
        {suffix}
      </p>
    </motion.div>
  );
};
