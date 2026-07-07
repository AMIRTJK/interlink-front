import React from 'react';
import { motion } from 'framer-motion';
import { getOccupancyColor } from '../../lib';

export interface IOccupancyRingProps {
  slots: number;
  occupied: number;
  size?: number;
  dark?: boolean;
}

export const OccupancyRing = ({
  slots,
  occupied,
  size = 40,
  dark = false,
}: IOccupancyRingProps) => {
  const pct = slots > 0 ? Math.min(occupied / slots, 1) : 0;
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const colors = getOccupancyColor(pct * 100);
  const gradId = `grad-${size}-${Math.round(pct * 100)}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              stopColor={
                pct >= 1
                  ? '#10b981'
                  : pct >= 0.6
                  ? '#6366f1'
                  : pct >= 0.3
                  ? '#f59e0b'
                  : '#f43f5e'
              }
            />
            <stop
              offset="100%"
              stopColor={
                pct >= 1
                  ? '#059669'
                  : pct >= 0.6
                  ? '#4f46e5'
                  : pct >= 0.3
                  ? '#d97706'
                  : '#e11d48'
              }
            />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={dark ? '#374151' : '#e5e7eb'}
          strokeWidth={4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
          dark ? colors.darkText : colors.text
        }`}
      >
        {Math.round(pct * 100)}%
      </div>
    </div>
  );
};
