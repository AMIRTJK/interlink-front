import { CX, CY, SUBDIAL_OFFSET, SUBDIAL_RADIUS, polar } from "../model";
import type { IWatchSpec } from "../specs";

interface IProps {
  spec: IWatchSpec;
  uid: string;
  isDark: boolean;
}

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const HOURS = Array.from({ length: 12 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const GUILLOCHE = Array.from({ length: 11 }, (_, i) => 12 + i * 4);
const SUBDIAL_TICKS = { day: 24, counter: 30 } as const;

const Tick = ({ r1, r2, deg, stroke, width }: { r1: number; r2: number; deg: number; stroke: string; width: number }) => {
  const a = polar(r1, deg);
  const b = polar(r2, deg);
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={width} strokeLinecap="round" />;
};

const MinuteTrack = ({ spec }: { spec: IWatchSpec }) => (
  <g>
    {MINUTES.filter((i) => i % 5 !== 0).map((i) => (
      <Tick key={i} r1={spec.dialRadius - 8} r2={spec.dialRadius - 3} deg={i * 6} stroke={spec.dial.inkMuted} width={0.8} />
    ))}
  </g>
);

const RomanMarkers = ({ spec }: { spec: IWatchSpec }) => (
  <g>
    <circle cx={CX} cy={CY} r={spec.dialRadius - 3} fill="none" stroke={spec.dial.inkMuted} strokeWidth="0.6" />
    <circle cx={CX} cy={CY} r={spec.dialRadius - 8} fill="none" stroke={spec.dial.inkMuted} strokeWidth="0.6" />
    {GUILLOCHE.map((r) => (
      <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={spec.dial.inkMuted} strokeWidth="0.4" opacity="0.35" />
    ))}
    {HOURS.map((i) => (
      <Tick key={i} r1={spec.dialRadius - 9} r2={spec.dialRadius - 2} deg={i * 30} stroke={spec.dial.ink} width={1.6} />
    ))}
    {ROMAN.map((numeral, i) => {
      const pos = polar(spec.dialRadius - 23, i * 30);
      return (
        <text key={numeral} x={pos.x} y={pos.y} fill={spec.dial.ink} fontSize="15" fontFamily="Georgia, 'Times New Roman', serif" textAnchor="middle" dominantBaseline="central">
          {numeral}
        </text>
      );
    })}
  </g>
);

const LumeMarkers = ({ spec, uid, isDark }: IProps) => {
  const r = spec.dialRadius - 15;
  return (
    <g filter={isDark ? `url(#${uid}-glow)` : undefined} fill={spec.lume} stroke={spec.dial.ink} strokeWidth="0.8">
      {HOURS.map((i) => {
        const pos = polar(r, i * 30);
        if (i === 0) {
          return <path key={i} d={`M${CX} ${CY - r + 9} L${CX - 8} ${CY - r - 7} L${CX + 8} ${CY - r - 7} Z`} />;
        }
        if (i % 3 === 0) {
          return <rect key={i} x={pos.x - 4} y={pos.y - 10} width="8" height="20" rx="1.5" transform={`rotate(${i * 30} ${pos.x} ${pos.y})`} />;
        }
        return <circle key={i} cx={pos.x} cy={pos.y} r="5.5" />;
      })}
    </g>
  );
};

const IndexMarkers = ({ spec }: { spec: IWatchSpec }) => (
  <g>
    {HOURS.map((i) => (
      <Tick key={i} r1={spec.dialRadius - 22} r2={spec.dialRadius - 7} deg={i * 30} stroke={spec.dial.ink} width={i === 0 ? 2.6 : 1.5} />
    ))}
  </g>
);

const BatonMarkers = ({ spec }: { spec: IWatchSpec }) => (
  <g>
    {HOURS.map((i) => (
      <Tick key={i} r1={spec.dialRadius - 20} r2={spec.dialRadius - 9} deg={i * 30} stroke={spec.dial.ink} width={3.4} />
    ))}
  </g>
);

const Subdial = ({ spec, cx, ticks }: { spec: IWatchSpec; cx: number; ticks: number }) => (
  <g>
    <circle cx={cx} cy={CY} r={SUBDIAL_RADIUS} fill={spec.subdial.face} />
    <circle cx={cx} cy={CY} r={SUBDIAL_RADIUS - 1} fill="none" stroke={spec.subdial.ink} strokeWidth="0.4" opacity="0.5" />
    {Array.from({ length: ticks }, (_, i) => {
      const isMajor = i % (ticks / 6) === 0;
      const deg = (360 / ticks) * i;
      const a = polar(SUBDIAL_RADIUS - (isMajor ? 6 : 3.5), deg, cx);
      const b = polar(SUBDIAL_RADIUS - 1.5, deg, cx);
      return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={spec.subdial.ink} strokeWidth={isMajor ? 1.1 : 0.6} />;
    })}
  </g>
);

export const WatchDial = ({ spec, uid, isDark }: IProps) => (
  <g>
    <defs>
      <radialGradient id={`${uid}-dial`} cx="50%" cy="42%" r="62%">
        <stop offset="0%" stopColor={spec.dial.center} />
        <stop offset="100%" stopColor={spec.dial.edge} />
      </radialGradient>
      <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx={CX} cy={CY} r={spec.dialRadius} fill={`url(#${uid}-dial)`} />
    {spec.markers !== "index" && spec.markers !== "roman" && <MinuteTrack spec={spec} />}
    {spec.markers === "roman" && <RomanMarkers spec={spec} />}
    {spec.markers === "lume" && <LumeMarkers spec={spec} uid={uid} isDark={isDark} />}
    {spec.markers === "index" && <IndexMarkers spec={spec} />}
    {spec.markers === "baton" && <BatonMarkers spec={spec} />}
    {spec.hasSubdials && (
      <g>
        <Subdial spec={spec} cx={CX - SUBDIAL_OFFSET} ticks={SUBDIAL_TICKS.day} />
        <Subdial spec={spec} cx={CX + SUBDIAL_OFFSET} ticks={SUBDIAL_TICKS.counter} />
      </g>
    )}
  </g>
);
