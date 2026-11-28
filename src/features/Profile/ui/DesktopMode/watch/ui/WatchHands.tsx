import type { CSSProperties, RefObject } from "react";
import { DIAL_CX, DIAL_CY, DIAL_RADIUS } from "../model";

interface IHandRefs {
  hourRef: RefObject<SVGGElement | null>;
  minuteRef: RefObject<SVGGElement | null>;
  secondRef: RefObject<SVGGElement | null>;
}

interface IProps {
  uid: string;
  refs: IHandRefs;
}

const HOUR_LENGTH = 184;
const HOUR_WIDTH = 17;
const HOUR_TAIL = 38;

const MINUTE_LENGTH = 272;
const MINUTE_WIDTH = 12.5;
const MINUTE_TAIL = 44;

const SECOND_LENGTH = 288;
const SECOND_TAIL = 66;
const SECOND_RING_OFFSET = 50;
const SECOND_RING_RADIUS = 10;

// Фиксированная область фильтра в userSpaceOnUse, чтобы тень не обрезалась у вертикальных и горизонтальных стрелок.
const FILTER_PAD = 80;
const FILTER_BOX = {
  x: DIAL_CX - DIAL_RADIUS - FILTER_PAD,
  y: DIAL_CY - DIAL_RADIUS - FILTER_PAD,
  size: (DIAL_RADIUS + FILTER_PAD) * 2,
} as const;

const CENTER_PIVOT: CSSProperties = {
  transformOrigin: `${DIAL_CX}px ${DIAL_CY}px`,
  transformBox: "view-box",
};

const leafHandPath = (length: number, halfWidth: number, tail: number) => {
  const tip = DIAL_CY - length;
  const belly = DIAL_CY - length * 0.44;
  return `M${DIAL_CX} ${DIAL_CY + tail} Q${DIAL_CX - halfWidth} ${belly} ${DIAL_CX} ${tip} Q${DIAL_CX + halfWidth} ${belly} ${DIAL_CX} ${DIAL_CY + tail} Z`;
};

const secondNeedlePath = () =>
  `M${DIAL_CX - 1.9} ${DIAL_CY + SECOND_TAIL} L${DIAL_CX - 0.8} ${DIAL_CY - SECOND_LENGTH} L${DIAL_CX + 0.8} ${DIAL_CY - SECOND_LENGTH} L${DIAL_CX + 1.9} ${DIAL_CY + SECOND_TAIL} Z`;

export const WatchHands = ({ uid, refs }: IProps) => (
  <g>
    <defs>
      <filter
        id={`${uid}-hand-shadow`}
        filterUnits="userSpaceOnUse"
        x={FILTER_BOX.x}
        y={FILTER_BOX.y}
        width={FILTER_BOX.size}
        height={FILTER_BOX.size}
      >
        <feDropShadow dx="6" dy="10" stdDeviation="6" floodColor="rgba(18, 12, 6, 0.44)" />
      </filter>

      {/* Градиент воронёной стали поперёк пера стрелки: одна грань ловит свет, другая уходит в глубокий синий. */}
      <linearGradient id={`${uid}-blued-steel`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0a1638" />
        <stop offset="34%" stopColor="#2c57c2" />
        <stop offset="56%" stopColor="#16327d" />
        <stop offset="100%" stopColor="#08122e" />
      </linearGradient>

      <radialGradient id={`${uid}-collar`} cx="35%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#3561cf" />
        <stop offset="65%" stopColor="#132a69" />
        <stop offset="100%" stopColor="#08112b" />
      </radialGradient>

      <radialGradient id={`${uid}-pinion-gold`} cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff3c9" />
        <stop offset="55%" stopColor="#d9ac4e" />
        <stop offset="100%" stopColor="#7a5618" />
      </radialGradient>

      <linearGradient id={`${uid}-crystal-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="48%" stopColor="#ffffff" stopOpacity="0.02" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>

    <g filter={`url(#${uid}-hand-shadow)`}>
      <g ref={refs.hourRef} style={CENTER_PIVOT}>
        <path
          d={leafHandPath(HOUR_LENGTH, HOUR_WIDTH, HOUR_TAIL)}
          fill={`url(#${uid}-blued-steel)`}
          stroke="#08122e"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line
          x1={DIAL_CX}
          y1={DIAL_CY + HOUR_TAIL - 8}
          x2={DIAL_CX}
          y2={DIAL_CY - HOUR_LENGTH + 14}
          stroke="rgba(165, 204, 255, 0.34)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>

      <g ref={refs.minuteRef} style={CENTER_PIVOT}>
        <path
          d={leafHandPath(MINUTE_LENGTH, MINUTE_WIDTH, MINUTE_TAIL)}
          fill={`url(#${uid}-blued-steel)`}
          stroke="#08122e"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line
          x1={DIAL_CX}
          y1={DIAL_CY + MINUTE_TAIL - 8}
          x2={DIAL_CX}
          y2={DIAL_CY - MINUTE_LENGTH + 16}
          stroke="rgba(165, 204, 255, 0.32)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      <g ref={refs.secondRef} style={CENTER_PIVOT}>
        <path d={secondNeedlePath()} fill="#1b3e96" stroke="#0c1d4d" strokeWidth="0.6" />
        <circle
          cx={DIAL_CX}
          cy={DIAL_CY + SECOND_RING_OFFSET}
          r={SECOND_RING_RADIUS}
          fill="none"
          stroke="#1b3e96"
          strokeWidth="3.2"
        />
      </g>

      <circle cx={DIAL_CX} cy={DIAL_CY} r="15.5" fill={`url(#${uid}-collar)`} stroke="#08112b" strokeWidth="1.2" />
      <circle cx={DIAL_CX} cy={DIAL_CY} r="8.5" fill={`url(#${uid}-pinion-gold)`} stroke="#694812" strokeWidth="0.8" />
    </g>

    {/* Лёгкий блик сапфирового стекла поверх стрелок, чтобы они читались под стеклом, а не наклеены сверху. */}
    <path
      d={`M${DIAL_CX - DIAL_RADIUS} ${DIAL_CY} A${DIAL_RADIUS} ${DIAL_RADIUS} 0 0 1 ${DIAL_CX + DIAL_RADIUS * 0.7} ${DIAL_CY - DIAL_RADIUS * 0.71} Q${DIAL_CX} ${DIAL_CY - DIAL_RADIUS * 0.24} ${DIAL_CX - DIAL_RADIUS} ${DIAL_CY} Z`}
      fill={`url(#${uid}-crystal-sheen)`}
      pointerEvents="none"
    />
  </g>
);
