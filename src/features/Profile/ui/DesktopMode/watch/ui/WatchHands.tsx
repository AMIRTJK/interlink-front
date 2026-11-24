import type { CSSProperties, RefObject } from "react";
import { CX, CY, SUBDIAL_OFFSET, SUBDIAL_RADIUS } from "../model";
import type { IWatchSpec, THandShape } from "../specs";

interface IHandRefs {
  hourRef: RefObject<SVGGElement | null>;
  minuteRef: RefObject<SVGGElement | null>;
  secondRef: RefObject<SVGGElement | null>;
  counterRef: RefObject<SVGGElement | null>;
  dayRef: RefObject<SVGGElement | null>;
}

interface IProps {
  spec: IWatchSpec;
  uid: string;
  refs: IHandRefs;
}

const TAIL = 12;
const SECOND_TAIL = 20;

const pivotStyle = (cx: number): CSSProperties => ({
  transformOrigin: `${cx}px ${CY}px`,
  transformBox: "view-box",
});

const CENTER_PIVOT = pivotStyle(CX);
const DAY_PIVOT = pivotStyle(CX - SUBDIAL_OFFSET);
const COUNTER_PIVOT = pivotStyle(CX + SUBDIAL_OFFSET);

const handPath = (shape: THandShape, length: number, width: number) => {
  const tip = CY - length;
  if (shape === "leaf") {
    const belly = CY - length * 0.45;
    return `M${CX} ${CY + TAIL} Q${CX - width} ${belly} ${CX} ${tip} Q${CX + width} ${belly} ${CX} ${CY + TAIL} Z`;
  }
  if (shape === "sword") {
    const shoulder = CY - length * 0.22;
    return `M${CX - 2.5} ${CY + TAIL} L${CX - width} ${shoulder} L${CX} ${tip} L${CX + width} ${shoulder} L${CX + 2.5} ${CY + TAIL} Z`;
  }
  return `M${CX - width / 2} ${CY + TAIL} L${CX - width / 2} ${tip + 1} L${CX} ${tip} L${CX + width / 2} ${tip + 1} L${CX + width / 2} ${CY + TAIL} Z`;
};

const SubHand = ({ cx, color, handRef, style }: { cx: number; color: string; handRef: RefObject<SVGGElement | null>; style: CSSProperties }) => (
  <g>
    <g ref={handRef} style={style}>
      <line x1={cx} y1={CY + 4} x2={cx} y2={CY - SUBDIAL_RADIUS + 3} stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </g>
    <circle cx={cx} cy={CY} r="2" fill={color} />
  </g>
);

export const WatchHands = ({ spec, uid, refs }: IProps) => {
  const { shape, fill, stroke, second } = spec.hands;
  const isSword = shape === "sword";
  const hourWidth = shape === "stick" ? 5 : 8;
  const minuteWidth = shape === "stick" ? 3.6 : 6;
  const secondLength = spec.dialRadius - 6;

  return (
    <g>
      {spec.hasSubdials && (
        <g>
          <SubHand cx={CX - SUBDIAL_OFFSET} color={spec.subdial.ink} handRef={refs.dayRef} style={DAY_PIVOT} />
          <SubHand cx={CX + SUBDIAL_OFFSET} color={spec.subdial.ink} handRef={refs.counterRef} style={COUNTER_PIVOT} />
        </g>
      )}
      <g filter={`url(#${uid}-hand-shadow)`}>
        <g ref={refs.hourRef} style={CENTER_PIVOT}>
          <path d={handPath(shape, spec.dialRadius * 0.55, hourWidth)} fill={fill} stroke={stroke} strokeWidth={isSword ? 1.6 : 0.6} strokeLinejoin="round" />
        </g>
        <g ref={refs.minuteRef} style={CENTER_PIVOT}>
          <path d={handPath(shape, spec.dialRadius * 0.84, minuteWidth)} fill={fill} stroke={stroke} strokeWidth={isSword ? 1.6 : 0.6} strokeLinejoin="round" />
        </g>
        <g ref={refs.secondRef} style={CENTER_PIVOT}>
          <line x1={CX} y1={CY + SECOND_TAIL} x2={CX} y2={CY - secondLength} stroke={second} strokeWidth="1.3" strokeLinecap="round" />
          {isSword ? (
            <circle cx={CX} cy={CY - secondLength * 0.72} r="4.2" fill={spec.lume} stroke={second} strokeWidth="1.4" />
          ) : (
            <circle cx={CX} cy={CY + SECOND_TAIL - 4} r="3.4" fill="none" stroke={second} strokeWidth="1.4" />
          )}
        </g>
        <circle cx={CX} cy={CY} r="5" fill={stroke} />
        <circle cx={CX} cy={CY} r="2" fill={second} />
      </g>
    </g>
  );
};
