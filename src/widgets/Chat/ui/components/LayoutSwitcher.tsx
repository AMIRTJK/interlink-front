import React from "react";
import { PanelLeft, PanelRight, PanelTop, PanelBottom } from "lucide-react";
import { LayoutPosition } from "../../model";

const LAYOUT_BUTTONS: {
  pos: LayoutPosition;
  Icon: React.ElementType;
  label: string;
}[] = [
  {
    pos: "left",
    Icon: PanelLeft,
    label: "Chat list left",
  },
  {
    pos: "right",
    Icon: PanelRight,
    label: "Chat list right",
  },
  {
    pos: "top",
    Icon: PanelTop,
    label: "Chat list top",
  },
  {
    pos: "bottom",
    Icon: PanelBottom,
    label: "Chat list bottom",
  },
];

interface LayoutSwitcherProps {
  layout: LayoutPosition;
  onChange: (pos: LayoutPosition) => void;
  isDark: boolean;
}

export const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({
  layout,
  onChange,
}) => (
  <div
    className="flex items-center gap-0.5 rounded-xl p-1"
    style={{
      background: "rgb(var(--th-on-accent-rgb) / 0.08)",
      border: "1px solid rgb(var(--th-on-accent-rgb) / 0.15)",
    }}
  >
    {LAYOUT_BUTTONS.map(({ pos, Icon, label }) => (
      <button
        key={pos}
        onClick={() => onChange(pos)}
        aria-label={label}
        title={label}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
        style={
          layout === pos
            ? {
                background:
                  "linear-gradient(135deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-3-rgb)))",
                color: "var(--th-on-accent)",
                boxShadow: "0 0 10px rgb(var(--th-on-accent-rgb) / 0.25)",
              }
            : {
                background: "transparent",
                color: "var(--th-on-accent-faint)",
              }
        }
      >
        <Icon className="w-4.5 h-4.5" />
      </button>
    ))}
  </div>
);
