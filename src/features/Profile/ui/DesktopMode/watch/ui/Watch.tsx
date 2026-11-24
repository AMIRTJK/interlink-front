import { memo, useId } from "react";
import { CX, CY, VIEW_H, VIEW_W, type TWatchVariant } from "../model";
import { WATCH_SPECS } from "../specs";
import { useClockHands } from "../lib/useClockHands";
import { WatchStrap } from "./WatchStrap";
import { WatchCase } from "./WatchCase";
import { WatchDial } from "./WatchDial";
import { WatchHands } from "./WatchHands";

interface IProps {
  variant: TWatchVariant;
  isDark: boolean;
  className?: string;
}

const SHADOW = {
  dark: { body: "rgba(0, 0, 0, 0.65)", hand: "rgba(0, 0, 0, 0.55)" },
  light: { body: "rgba(60, 45, 20, 0.28)", hand: "rgba(0, 0, 0, 0.3)" },
} as const;

const WatchComponent = ({ variant, isDark, className }: IProps) => {
  const spec = WATCH_SPECS[variant];
  const shadow = isDark ? SHADOW.dark : SHADOW.light;
  const uid = `watch-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const refs = useClockHands();

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" className={className}>
      <defs>
        {/* Ремешок растворяется к краям, а не обрывается: часы читаются как предмет, а не как вырезка. */}
        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="16%" stopColor="#fff" stopOpacity="1" />
          <stop offset="84%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${uid}-strap-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={VIEW_H}>
          <rect width={VIEW_W} height={VIEW_H} fill={`url(#${uid}-fade)`} />
        </mask>
        <filter id={`${uid}-body-shadow`} x="-30%" y="-20%" width="160%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor={shadow.body} />
        </filter>
        <filter id={`${uid}-hand-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1.5" dy="3" stdDeviation="1.6" floodColor={shadow.hand} />
        </filter>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g mask={`url(#${uid}-strap-mask)`}>
        <WatchStrap strap={spec.strap} uid={uid} />
      </g>
      <g filter={`url(#${uid}-body-shadow)`}>
        <WatchCase spec={spec} uid={uid} />
      </g>
      <WatchDial spec={spec} uid={uid} isDark={isDark} />
      <WatchHands spec={spec} uid={uid} refs={refs} />
      <path
        d={`M${CX - spec.dialRadius} ${CY} A${spec.dialRadius} ${spec.dialRadius} 0 0 1 ${CX + spec.dialRadius * 0.7} ${CY - spec.dialRadius * 0.71} Q${CX} ${CY - spec.dialRadius * 0.25} ${CX - spec.dialRadius} ${CY} Z`}
        fill={`url(#${uid}-glass)`}
        pointerEvents="none"
      />
    </svg>
  );
};

// Экран ререндерится каждую секунду ради цифрового времени — часы при этом не трогаем.
export const Watch = memo(WatchComponent);
