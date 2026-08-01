import type { ReactNode } from "react";
import { CheckCircle, PanelTop, PanelLeft, PanelBottom, PanelRight } from "lucide-react";
import type { LayoutMode } from "../designSettings";

interface IHeaderLayoutPopoverProps {
  layoutMode: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
}

const LAYOUT_MODES: { mode: LayoutMode; icon: ReactNode; title: string }[] = [
  { mode: "top", icon: <PanelTop size={16} />, title: "Верхнее меню" },
  { mode: "left", icon: <PanelLeft size={16} />, title: "Левое меню" },
  { mode: "bottom", icon: <PanelBottom size={16} />, title: "Нижнее меню" },
  { mode: "right", icon: <PanelRight size={16} />, title: "Правое меню" },
];

export const HeaderLayoutPopover = ({
  layoutMode,
  setLayoutMode,
}: IHeaderLayoutPopoverProps) => {
  return (
    <div className="w-[220px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Макет страницы
      </p>
      <div className="space-y-2">
        {LAYOUT_MODES.map((item) => (
          <button
            key={item.mode}
            onClick={() => {
              if (setLayoutMode) {
                setLayoutMode(item.mode);
                localStorage.setItem("layoutMode", item.mode);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer text-sm font-semibold ${
              layoutMode === item.mode
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <span className="text-zinc-600 dark:text-zinc-300 flex-shrink-0">
              {item.icon}
            </span>
            <span className="text-zinc-700 dark:text-zinc-200">
              {item.title}
            </span>
            {layoutMode === item.mode && (
              <CheckCircle size={18} className="ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
