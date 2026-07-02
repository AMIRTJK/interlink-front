import React, { useMemo } from "react";
import { PlusOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { ViewMode } from "../model";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  dateRange: string;
  onToday: () => void;
  onCreateEvent: () => void;
}

export const CalendarHeader = ({
  viewMode,
  setViewMode,
  onPrev,
  onNext,
  dateRange,
  onToday,
  onCreateEvent,
}: CalendarHeaderProps) => {
  const themeKey = useMemo(() => localStorage.getItem("currentTheme") || "emerald", []);

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "blue":
        return {
          bg: "bg-blue-600!",
          hoverBg: "hover:bg-blue-700!",
          text: "text-blue-600!",
          shadow: "shadow-blue-500/20!",
        };
      case "sunset":
        return {
          bg: "bg-orange-500!",
          hoverBg: "hover:bg-orange-600!",
          text: "text-orange-600!",
          shadow: "shadow-orange-500/20!",
        };
      case "ocean":
        return {
          bg: "bg-cyan-500!",
          hoverBg: "hover:bg-cyan-600!",
          text: "text-cyan-600!",
          shadow: "shadow-cyan-500/20!",
        };
      case "purple":
        return {
          bg: "bg-purple-600!",
          hoverBg: "hover:bg-purple-700!",
          text: "text-purple-600!",
          shadow: "shadow-purple-500/20!",
        };
      case "Aurora":
        return {
          bg: "bg-emerald-500!",
          hoverBg: "hover:bg-emerald-600!",
          text: "text-emerald-600!",
          shadow: "shadow-emerald-500/20!",
        };
      case "fury":
        return {
          bg: "bg-rose-500!",
          hoverBg: "hover:bg-rose-600!",
          text: "text-rose-600!",
          shadow: "shadow-rose-500/20!",
        };
      case "Lavender":
        return {
          bg: "bg-violet-500!",
          hoverBg: "hover:bg-violet-600!",
          text: "text-violet-600!",
          shadow: "shadow-violet-500/20!",
        };
      case "coral":
        return {
          bg: "bg-blue-500!",
          hoverBg: "hover:bg-blue-600!",
          text: "text-blue-600!",
          shadow: "shadow-blue-500/20!",
        };
      case "Peach":
        return {
          bg: "bg-pink-400!",
          hoverBg: "hover:bg-pink-500!",
          text: "text-pink-400!",
          shadow: "shadow-pink-400/20!",
        };
      case "galaxy":
        return {
          bg: "bg-indigo-700!",
          hoverBg: "hover:bg-indigo-800!",
          text: "text-indigo-700!",
          shadow: "shadow-indigo-700/20!",
        };
      case "emerald":
      default:
        return {
          bg: "bg-emerald-700!",
          hoverBg: "hover:bg-emerald-800!",
          text: "text-emerald-700!",
          shadow: "shadow-emerald-700/20!",
        };
    }
  };

  const themeColors = getThemeColors(themeKey);

  const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: "day", label: "День" },
    { key: "week", label: "Неделя" },
    { key: "month", label: "Месяц" },
  ];

  return (
    <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4! mb-6! w-full!">
      {/* Левая часть: Переключатель режимов */}
      <div className="bg-white/50! dark:bg-slate-800/50! p-1.5! rounded-[1.5rem]! border! border-white/20! dark:border-slate-700/50! shadow-sm! flex! items-center! gap-1! self-start!">
        {VIEW_MODES.map(({ key, label }) => {
          const isActive = viewMode === key;
          return (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-6! py-2! rounded-[1.25rem]! text-xs! font-bold! transition-all! cursor-pointer! ${
                isActive
                  ? `${themeColors.bg} text-white! shadow-md! ${themeColors.shadow}`
                  : "text-zinc-500! hover:text-zinc-800! dark:text-zinc-400! dark:hover:text-zinc-200!"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Центр: Навигация */}
      <div className="flex! items-center! justify-center! gap-4! self-center!">
        <button
          onClick={onPrev}
          className="w-9! h-9! flex! items-center! justify-center! bg-white/70! hover:bg-white! dark:bg-slate-800/70! dark:hover:bg-slate-800! border! border-zinc-100! dark:border-slate-700! rounded-full! transition-colors! cursor-pointer!"
        >
          <LeftOutlined className="text-xs! text-zinc-500! dark:text-zinc-300!" />
        </button>

        <h3 className="text-base! font-bold! text-zinc-800! dark:text-zinc-100! m-0! min-w-[140px]! text-center!">
          {dateRange}
        </h3>

        <button
          onClick={onNext}
          className="w-9! h-9! flex! items-center! justify-center! bg-white/70! hover:bg-white! dark:bg-slate-800/70! dark:hover:bg-slate-800! border! border-zinc-100! dark:border-slate-700! rounded-full! transition-colors! cursor-pointer!"
        >
          <RightOutlined className="text-xs! text-zinc-500! dark:text-zinc-300!" />
        </button>

        <button
          onClick={onToday}
          className="px-4! py-2! bg-white/70! hover:bg-white! dark:bg-slate-800/70! dark:hover:bg-slate-800! border! border-zinc-100! dark:border-slate-700! text-xs! font-bold! text-zinc-600! dark:text-zinc-300! rounded-full! transition-colors! cursor-pointer!"
        >
          Сегодня
        </button>
      </div>

      {/* Правая часть: Создать событие */}
      <button
        onClick={onCreateEvent}
        className={`flex! items-center! gap-2! text-white! font-bold! text-xs! px-5! py-3! rounded-2xl! cursor-pointer! transition-all! shadow-md! self-end! sm:self-center! ${themeColors.bg} ${themeColors.hoverBg} ${themeColors.shadow}`}
      >
        <PlusOutlined className="text-xs!" />
        <span>Создать событие</span>
      </button>
    </div>
  );
};
