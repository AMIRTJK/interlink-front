import type { ElementType } from "react";
import { PanelBottom, PanelLeft, PanelRight, PanelTop } from "lucide-react";
import type { LayoutPosition } from "../../../model";

// Переключатель края, к которому прижата панель бесед. Порядок кнопок повторяет
// макет: сначала горизонтальные края, затем вертикальные.

const LAYOUT_BUTTONS: {
  pos: LayoutPosition;
  Icon: ElementType;
  label: string;
}[] = [
  { pos: "top", Icon: PanelTop, label: "Панель бесед сверху" },
  { pos: "bottom", Icon: PanelBottom, label: "Панель бесед снизу" },
  { pos: "left", Icon: PanelLeft, label: "Панель бесед слева" },
  { pos: "right", Icon: PanelRight, label: "Панель бесед справа" },
];

interface IProps {
  layout: LayoutPosition;
  onChange: (pos: LayoutPosition) => void;
}

export const ModernLayoutSwitcher = ({ layout, onChange }: IProps) => (
  <div
    className="flex items-center gap-1 rounded-2xl p-1"
    style={{ background: "var(--chat-modern-soft)" }}
  >
    {LAYOUT_BUTTONS.map(({ pos, Icon, label }) => {
      const isActive = layout === pos;
      return (
        <button
          key={pos}
          type="button"
          onClick={() => onChange(pos)}
          aria-label={label}
          aria-pressed={isActive}
          title={label}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
          style={
            isActive
              ? {
                  background: "var(--chat-modern-indigo)",
                  color: "var(--chat-modern-on-color)",
                }
              : { color: "var(--th-text-faint)" }
          }
        >
          <Icon className="w-4 h-4" />
        </button>
      );
    })}
  </div>
);
