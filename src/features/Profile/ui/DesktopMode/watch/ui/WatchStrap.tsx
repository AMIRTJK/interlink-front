import { CX, CY, VIEW_H } from "../model";
import type { IWatchSpec } from "../specs";

interface IProps {
  strap: IWatchSpec["strap"];
  uid: string;
}

const LUG_HALF = 44;
const END_HALF = 38;
const UNDER_CASE = 80;
const LINK_HEIGHT = 20;
const LINK_GAP = 1.6;
const LINK_ROWS = Array.from({ length: Math.ceil(VIEW_H / LINK_HEIGHT) }, (_, i) => i * LINK_HEIGHT);
const BUCKLE_HOLES = [CY + 150, CY + 172, CY + 194];

const topHalf = (inset = 0) =>
  `M${CX - END_HALF + inset} 0 L${CX + END_HALF - inset} 0 L${CX + LUG_HALF - inset} ${CY - UNDER_CASE} L${CX - LUG_HALF + inset} ${CY - UNDER_CASE} Z`;

const bottomHalf = (inset = 0) =>
  `M${CX - LUG_HALF + inset} ${CY + UNDER_CASE} L${CX + LUG_HALF - inset} ${CY + UNDER_CASE} L${CX + END_HALF - inset} ${VIEW_H} L${CX - END_HALF + inset} ${VIEW_H} Z`;

const stitchLine = (side: -1 | 1, isTop: boolean) => {
  const lug = CX + side * (LUG_HALF - 6);
  const end = CX + side * (END_HALF - 6);
  return isTop ? `M${end} 0 L${lug} ${CY - UNDER_CASE}` : `M${lug} ${CY + UNDER_CASE} L${end} ${VIEW_H}`;
};

const Leather = ({ strap, uid }: IProps) => (
  <g>
    <path d={topHalf()} fill={`url(#${uid}-strap)`} />
    <path d={bottomHalf()} fill={`url(#${uid}-strap)`} />
    {([-1, 1] as const).map((side) => (
      <g key={side} stroke={strap.stitch} strokeWidth="1.1" strokeDasharray="4 3" fill="none" opacity="0.8">
        <path d={stitchLine(side, true)} />
        <path d={stitchLine(side, false)} />
      </g>
    ))}
    {BUCKLE_HOLES.map((y) => (
      <ellipse key={y} cx={CX} cy={y} rx="3.2" ry="2.4" fill={strap.shade} stroke={strap.highlight} strokeWidth="0.6" />
    ))}
  </g>
);

const Bracelet = ({ strap, uid }: IProps) => (
  <g>
    {LINK_ROWS.map((y) => (
      <g key={y}>
        <rect x={CX - LUG_HALF} y={y + LINK_GAP / 2} width="26" height={LINK_HEIGHT - LINK_GAP} rx="3" fill={`url(#${uid}-strap)`} />
        <rect x={CX - 16} y={y + LINK_GAP / 2} width="32" height={LINK_HEIGHT - LINK_GAP} rx="4" fill={`url(#${uid}-link)`} />
        <rect x={CX + LUG_HALF - 26} y={y + LINK_GAP / 2} width="26" height={LINK_HEIGHT - LINK_GAP} rx="3" fill={`url(#${uid}-strap)`} />
        <line x1={CX - LUG_HALF + 4} y1={y + LINK_HEIGHT - 2} x2={CX + LUG_HALF - 4} y2={y + LINK_HEIGHT - 2} stroke={strap.stitch} strokeWidth="0.6" opacity="0.6" />
      </g>
    ))}
  </g>
);

const Mesh = ({ uid }: IProps) => (
  <g>
    <path d={topHalf()} fill={`url(#${uid}-strap)`} />
    <path d={bottomHalf()} fill={`url(#${uid}-strap)`} />
    <path d={topHalf()} fill={`url(#${uid}-mesh)`} />
    <path d={bottomHalf()} fill={`url(#${uid}-mesh)`} />
  </g>
);

export const WatchStrap = ({ strap, uid }: IProps) => (
  <g>
    <defs>
      <linearGradient id={`${uid}-strap`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={strap.shade} />
        <stop offset="22%" stopColor={strap.base} />
        <stop offset="50%" stopColor={strap.highlight} />
        <stop offset="78%" stopColor={strap.base} />
        <stop offset="100%" stopColor={strap.shade} />
      </linearGradient>
      <linearGradient id={`${uid}-link`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={strap.highlight} />
        <stop offset="100%" stopColor={strap.base} />
      </linearGradient>
      <pattern id={`${uid}-mesh`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="3" stroke={strap.shade} strokeWidth="0.7" opacity="0.55" />
        <line x1="0" y1="0" x2="3" y2="0" stroke={strap.highlight} strokeWidth="0.5" opacity="0.5" />
      </pattern>
    </defs>
    {strap.kind === "leather" && <Leather strap={strap} uid={uid} />}
    {strap.kind === "bracelet" && <Bracelet strap={strap} uid={uid} />}
    {strap.kind === "mesh" && <Mesh strap={strap} uid={uid} />}
  </g>
);
