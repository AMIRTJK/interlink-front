import { CX, CY, polar } from "../model";
import type { IWatchSpec } from "../specs";

interface IProps {
  spec: IWatchSpec;
  uid: string;
}

const LUG_INNER = 44;
const LUG_WIDTH = 15;
const MINUTE_TICKS = Array.from({ length: 60 }, (_, i) => i);
const DIVER_NUMBERS = [10, 20, 30, 40, 50];
const TACHY_VALUES = [400, 300, 200, 150, 120, 100, 90, 80, 70];
const PUSHER_ANGLES = [60, 120];

const tachyAngle = (value: number) => (3600 / value) * 6;

const Lugs = ({ spec, uid }: IProps) => {
  const top = CY - spec.caseRadius - 26;
  const height = spec.caseRadius - 30;
  return (
    <g fill={`url(#${uid}-metal)`}>
      {[-1, 1].map((side) => {
        const x = side < 0 ? CX - LUG_INNER - LUG_WIDTH : CX + LUG_INNER;
        return (
          <g key={side}>
            <rect x={x} y={top} width={LUG_WIDTH} height={height} rx="6" />
            <rect x={x} y={2 * CY - top - height} width={LUG_WIDTH} height={height} rx="6" />
          </g>
        );
      })}
    </g>
  );
};

const Crown = ({ spec, uid }: IProps) => {
  const y = CY - spec.caseRadius - 13;
  return (
    <g>
      {spec.hasPushers &&
        PUSHER_ANGLES.map((angle) => (
          <rect key={angle} x={CX - 6} y={CY - spec.caseRadius - 11} width="12" height="14" rx="2.5" fill={`url(#${uid}-metal)`} transform={`rotate(${angle} ${CX} ${CY})`} />
        ))}
      <g transform={`rotate(90 ${CX} ${CY})`}>
        <rect x={CX - 12} y={y} width="24" height="17" rx="3" fill={`url(#${uid}-metal)`} />
        {[-8, -4, 0, 4, 8].map((dx) => (
          <line key={dx} x1={CX + dx} y1={y + 2} x2={CX + dx} y2={y + 9} stroke={spec.metal.dark} strokeWidth="0.9" opacity="0.7" />
        ))}
      </g>
    </g>
  );
};

const DiverBezel = ({ spec }: IProps) => {
  const outer = spec.caseRadius - 4;
  const inner = spec.dialRadius + 4;
  const numberRadius = (outer + inner) / 2;
  return (
    <g>
      <circle cx={CX} cy={CY} r={outer} fill={spec.bezelColor} />
      {MINUTE_TICKS.filter((i) => i < 15 || i % 5 === 0).map((i) => {
        const from = polar(outer - (i % 5 === 0 ? 6 : 4), i * 6);
        const to = polar(outer - 1.5, i * 6);
        return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={spec.bezelInk} strokeWidth={i % 5 === 0 ? 1.6 : 0.9} />;
      })}
      {DIVER_NUMBERS.map((n) => {
        const pos = polar(numberRadius - 2, n * 6);
        return (
          <text key={n} x={pos.x} y={pos.y} fill={spec.bezelInk} fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" textAnchor="middle" dominantBaseline="central" transform={`rotate(${n * 6} ${pos.x} ${pos.y})`}>
            {n}
          </text>
        );
      })}
      <path d={`M${CX} ${CY - inner - 2} L${CX - 8} ${CY - outer + 3} L${CX + 8} ${CY - outer + 3} Z`} fill={spec.bezelInk} />
      <circle cx={CX} cy={CY - outer + 9} r="2.6" fill={spec.lume} />
    </g>
  );
};

const TachyBezel = ({ spec }: IProps) => {
  const outer = spec.caseRadius - 5;
  return (
    <g>
      <circle cx={CX} cy={CY} r={outer} fill={spec.bezelColor} />
      {TACHY_VALUES.map((value) => {
        const angle = tachyAngle(value);
        const pos = polar(outer - 10, angle);
        const tickFrom = polar(outer - 3, angle);
        const tickTo = polar(outer - 0.5, angle);
        return (
          <g key={value}>
            <line x1={tickFrom.x} y1={tickFrom.y} x2={tickTo.x} y2={tickTo.y} stroke={spec.bezelInk} strokeWidth="1" />
            <text x={pos.x} y={pos.y} fill={spec.bezelInk} fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif" textAnchor="middle" dominantBaseline="central" transform={`rotate(${angle} ${pos.x} ${pos.y})`}>
              {value}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const WatchCase = ({ spec, uid }: IProps) => (
  <g>
    <defs>
      <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={spec.metal.light} />
        <stop offset="35%" stopColor={spec.metal.mid} />
        <stop offset="60%" stopColor={spec.metal.dark} />
        <stop offset="85%" stopColor={spec.metal.mid} />
        <stop offset="100%" stopColor={spec.metal.light} />
      </linearGradient>
    </defs>
    <Lugs spec={spec} uid={uid} />
    <Crown spec={spec} uid={uid} />
    <circle cx={CX} cy={CY} r={spec.caseRadius} fill={`url(#${uid}-metal)`} />
    <circle cx={CX} cy={CY} r={spec.caseRadius - 1} fill="none" stroke={spec.metal.light} strokeWidth="1" opacity="0.6" />
    {spec.bezel === "diver" && <DiverBezel spec={spec} uid={uid} />}
    {spec.bezel === "tachymeter" && <TachyBezel spec={spec} uid={uid} />}
    {spec.bezel === "polished" && (
      <circle cx={CX} cy={CY} r={spec.dialRadius + 3} fill="none" stroke={spec.bezelInk} strokeWidth="1.2" opacity="0.35" />
    )}
  </g>
);
