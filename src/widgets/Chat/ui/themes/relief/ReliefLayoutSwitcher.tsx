import type { CSSProperties } from "react";
import type { LayoutPosition } from "../../../model";

// Переключатель края, к которому прижата панель бесед. В макете это не иконки,
// а схема окна: рамка экрана и полоска на той стороне, куда встанет панель.
// Полоска — ячейка сетки 3×3 внутри рамки, поэтому все четыре положения
// строятся одной разметкой.

interface ILayoutButton {
  pos: LayoutPosition;
  label: string;
  /** Место полоски в сетке рамки. Считается один раз — не в теле компонента. */
  bar: CSSProperties;
}

const LAYOUT_BUTTONS: readonly ILayoutButton[] = [
  {
    pos: "top",
    label: "Панель бесед сверху",
    bar: { gridColumn: "1 / 4", gridRow: "1 / 2" },
  },
  {
    pos: "bottom",
    label: "Панель бесед снизу",
    bar: { gridColumn: "1 / 4", gridRow: "3 / 4" },
  },
  {
    pos: "left",
    label: "Панель бесед слева",
    bar: { gridColumn: "1 / 2", gridRow: "1 / 4" },
  },
  {
    pos: "right",
    label: "Панель бесед справа",
    bar: { gridColumn: "3 / 4", gridRow: "1 / 4" },
  },
] as const;

interface IProps {
  layout: LayoutPosition;
  onChange: (pos: LayoutPosition) => void;
}

export const ReliefLayoutSwitcher = ({ layout, onChange }: IProps) => (
  <div
    className="flex items-center gap-[5px] rounded-xl p-[5px] flex-shrink-0"
    style={{
      background: "var(--chat-relief-switch-bg)",
      boxShadow: "var(--chat-relief-switch-shadow)",
    }}
    role="group"
    aria-label="Расположение панели бесед"
  >
    {LAYOUT_BUTTONS.map(({ pos, label, bar }) => {
      const isActive = layout === pos;
      return (
        <button
          key={pos}
          type="button"
          onClick={() => onChange(pos)}
          aria-label={label}
          aria-pressed={isActive}
          title={label}
          // Переход только по transform: заливка и рамка приходят из токенов
          // темы, и их анимация оставила бы кнопку в цвете прежней темы.
          className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--chat-relief-indigo))]"
          style={
            isActive
              ? {
                  background: "var(--chat-relief-switch-thumb)",
                  boxShadow: "var(--chat-relief-switch-thumb-shadow)",
                }
              : undefined
          }
        >
          <span
            aria-hidden="true"
            className="grid w-[18px] h-[18px] grid-cols-3 grid-rows-3 rounded-[3px] p-px"
            style={{
              border: `1.4px solid ${
                isActive
                  ? "var(--chat-relief-switch-frame-active)"
                  : "var(--chat-relief-switch-frame)"
              }`,
            }}
          >
            <span
              className="rounded-[1.5px]"
              style={{ ...bar, background: "var(--chat-relief-switch-bar)" }}
            />
          </span>
        </button>
      );
    })}
  </div>
);
