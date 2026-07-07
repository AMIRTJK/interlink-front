import React from 'react';
import { motion } from 'framer-motion';
import { getOccupancyColor } from '../../lib';

export interface IProgressBarProps {
  slots: number;
  occupied: number;
  height?: string;
  dark?: boolean;
}

export const ProgressBar = ({
  slots,
  occupied,
  height = 'h-1.5',
  dark = false,
}: IProgressBarProps) => {
  const pct = slots > 0 ? Math.min(occupied / slots, 1) : 0;
  const colors = getOccupancyColor(pct * 100);

  return (
    <div
      className={`w-full ${height} rounded-full overflow-hidden`}
      style={{ backgroundColor: dark ? '#374151' : '#f3f4f6' }}
    >
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct * 100}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
};
