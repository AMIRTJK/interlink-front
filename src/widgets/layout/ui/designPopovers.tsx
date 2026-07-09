import React from "react";
import { CheckCircle } from "lucide-react";
import { If } from "@shared/ui";
import { THEMES, BACKGROUNDS, LayoutMode } from "./designSettings";

interface ThemeContentProps {
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
}

export const ThemeContent = ({ currentTheme, setCurrentTheme }: ThemeContentProps) => (
  <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
    <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
      Выберите тему
    </p>
    <div className="space-y-2">
      {Object.entries(THEMES).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => {
            if (setCurrentTheme) {
              setCurrentTheme(key);
              localStorage.setItem("currentTheme", key);
              window.dispatchEvent(new StorageEvent("storage", { key: "currentTheme", newValue: key }));
            }
          }}
          className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
            currentTheme === key ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400" : ""
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${
              theme.swatch || theme.gradient
            } shadow-lg flex-shrink-0`}
          />
          <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
            {key}
          </span>
          <If is={currentTheme === key}>
            <CheckCircle size={18} className="ml-auto text-emerald-600" />
          </If>
        </button>
      ))}
    </div>
  </div>
);

interface BgContentProps {
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  isDarkMode: boolean;
}

export const BgContent = ({ currentBg, setCurrentBg, isDarkMode }: BgContentProps) => (
  <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
    <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
      Фон страницы
    </p>
    <div className="space-y-2">
      {Object.entries(BACKGROUNDS).map(([key, bg]) => (
        <button
          key={key}
          onClick={() => {
            if (setCurrentBg) {
              setCurrentBg(key);
              localStorage.setItem("currentBg", key);
            }
          }}
          className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
            currentBg === key ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400" : ""
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${
              isDarkMode ? bg.dark : bg.light
            } border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm`}
          />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {bg.name}
          </span>
          <If is={currentBg === key}>
            <CheckCircle size={18} className="ml-auto text-emerald-500" />
          </If>
        </button>
      ))}
    </div>
  </div>
);

interface LayoutContentProps {
  layoutMode?: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
  moveHeader: boolean;
  setMoveHeader: (val: boolean) => void;
  layoutModes: { mode: LayoutMode; icon: React.ReactNode; title: string }[];
}

export const LayoutContent = ({
  layoutMode,
  setLayoutMode,
  moveHeader,
  setMoveHeader,
  layoutModes,
}: LayoutContentProps) => (
  <div className="w-[220px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
    <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
      Макет страницы
    </p>
    <div className="space-y-2">
      {layoutModes.map((item) => (
        <button
          key={item.mode}
          onClick={() => {
            if (setLayoutMode) {
              setLayoutMode(item.mode);
              localStorage.setItem("layoutMode", item.mode);
            }
          }}
          className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer text-sm font-semibold ${
            layoutMode === item.mode ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400" : ""
          }`}
        >
          <span className="text-zinc-600 dark:text-zinc-300 flex-shrink-0">
            {item.icon}
          </span>
          <span className="text-zinc-700 dark:text-zinc-200">
            {item.title}
          </span>
          <If is={layoutMode === item.mode}>
            <CheckCircle size={18} className="ml-auto text-emerald-500" />
          </If>
        </button>
      ))}
    </div>
    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/60 px-1">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 select-none">
          Переносить элементы Header
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={moveHeader}
            onChange={(e) => setMoveHeader(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
        </div>
      </label>
    </div>
  </div>
);
