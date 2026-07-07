import React from "react";
import { PlusOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { ViewMode } from "../model";
import { useCalendarTheme } from "../lib/useCalendarTheme";

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
  const { theme } = useCalendarTheme();

  const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: "day", label: "День" },
    { key: "week", label: "Неделя" },
    { key: "month", label: "Месяц" },
  ];

  return (
    <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4! mb-6! w-full!">
      <div className="bg-white/50! dark:bg-slate-800/50! p-1.5! rounded-[1.5rem]! border! border-white/20! dark:border-slate-700/50! shadow-sm! flex! items-center! gap-1! self-start!">
        {VIEW_MODES.map(({ key, label }) => {
          const isActive = viewMode === key;
          return (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-6! py-2! rounded-[1.25rem]! text-xs! font-bold! transition-all! cursor-pointer! border-0! ${
                isActive
                  ? `bg-gradient-to-r! ${theme.gradient} text-white! shadow-md!`
                  : "text-zinc-500! hover:text-zinc-800! dark:text-zinc-400! dark:hover:text-zinc-200! bg-transparent!"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

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

      <button
        onClick={onCreateEvent}
        className={`flex! items-center! gap-2! text-white! font-bold! text-xs! px-5! py-3! rounded-2xl! cursor-pointer! transition-all! shadow-md! self-end! sm:self-center! border-0! bg-gradient-to-r! ${theme.gradient} hover:opacity-90!`}
      >
        <PlusOutlined className="text-xs!" />
        <span>Создать событие</span>
      </button>
    </div>
  );
};
