import { useMemo } from "react";
import { PX_PER_CM } from "./docLayout";

// Сетка как в Word («Вид → Сетка»): непечатаемые направляющие поверх листа, но
// ПОД текстом. Значения — дефолты из вордовского диалога «Сетка и направляющие»:
// шаг сетки 0,32 см, на экране показывается каждая 2-я вертикальная и каждая
// 3-я горизонтальная линия, отсчёт идёт от полей страницы («привязать к полям»).
// Поэтому видимая ячейка — 0,64 × 0,96 см, а начало координат совпадает с левым
// верхним углом колонки набора и едет вместе с маркерами линейки.
const GRID_STEP_CM = 0.32;
const GRID_VERTICAL_EVERY = 2;
const GRID_HORIZONTAL_EVERY = 3;
const GRID_COL_STEP = GRID_STEP_CM * GRID_VERTICAL_EVERY * PX_PER_CM;
const GRID_ROW_STEP = GRID_STEP_CM * GRID_HORIZONTAL_EVERY * PX_PER_CM;
const GRID_COLOR = "rgba(148,163,184,0.5)";
// Привязка объектов идёт к БАЗОВОМУ шагу сетки (0,32 см), а не к видимым линиям:
// Word рисует на экране каждую 2-ю/3-ю линию, но «магнитит» по полному шагу,
// поэтому объект может встать и между линиями. Alt при перетаскивании временно
// отключает привязку — тоже как в Word.
export const GRID_SNAP_STEP = GRID_STEP_CM * PX_PER_CM;

export const snapToGrid = (value: number, step: number): number =>
  Math.round(value / step) * step;

// Линии рисуем явными <line>, а не паттерном/градиентом: шаг дробный (≈24,19 и
// ≈36,28 px), и при заливке браузер размывает каждую вторую линию. Округление
// позиции к целому + 0.5 даёт чёткий хайрлайн, а сама позиция считается от
// i * step, поэтому накопленного дрейфа относительно линейки нет.
const gridLinePositions = (extent: number, step: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i * step <= extent; i++) {
    const pos = Math.round(i * step) + 0.5;
    if (pos <= extent) out.push(pos);
  }
  return out;
};

export const PageGrid = ({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}) => {
  const cols = useMemo(() => gridLinePositions(width, GRID_COL_STEP), [width]);
  const rows = useMemo(() => gridLinePositions(height, GRID_ROW_STEP), [height]);

  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      style={{
        position: "absolute",
        left,
        top,
        display: "block",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {cols.map((x) => (
        <line key={`c${x}`} x1={x} y1={0} x2={x} y2={height} stroke={GRID_COLOR} />
      ))}
      {rows.map((y) => (
        <line key={`r${y}`} x1={0} y1={y} x2={width} y2={y} stroke={GRID_COLOR} />
      ))}
    </svg>
  );
};
