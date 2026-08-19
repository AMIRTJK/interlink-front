import { memo } from "react";
import { Dayjs } from "dayjs";
import type { ViewMode } from "../model";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Dayjs;
}

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

export const CalendarHeader = memo(({
  viewMode,
  setViewMode,
  currentDate,
}: CalendarHeaderProps) => {
  const formatHeaderTitle = () => {
    if (viewMode === "month") {
      return currentDate.format("dddd, MMMM D");
    }
    if (viewMode === "week") {
      const start = currentDate.startOf("isoWeek");
      const end = start.add(6, "day");
      return `${start.format("MMMM D")} – ${end.format("D, YYYY")}`;
    }
    return currentDate.format("dddd, MMMM D, YYYY");
  };

  const weekNumber = currentDate.isoWeek();

  return (
    <div className="flex! flex-col! items-center! justify-between! gap-2! mb-4! w-full! relative!">
      {/* Center Title Section */}
      <div className="flex! flex-col! items-center! text-center!">
        <h2 className="text-2xl! font-black! text-slate-800! dark:text-slate-100! m-0! tracking-tight!">
          {formatHeaderTitle()}
        </h2>
        {viewMode !== "month" && (
          <span className="text-xs! font-bold! text-slate-400! dark:text-slate-500! mt-0.5!">
            Week {weekNumber} • Summer Schedule
          </span>
        )}
      </div>

      {/* Right Mode Switcher Segmented Control */}
      <div className="absolute! right-0! top-0! bg-slate-100/90! dark:bg-slate-800/90! backdrop-blur-md! p-1! rounded-full! border! border-slate-200/60! dark:border-slate-700/60! flex! items-center! gap-1!">
        {VIEW_MODES.map(({ key, label }) => {
          const isActive = viewMode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={`px-5! py-1.5! rounded-full! text-xs! font-extrabold! transition-all! cursor-pointer! border-0! ${
                isActive
                  ? "bg-white! dark:bg-slate-900! text-slate-800! dark:text-slate-100! shadow-xs!"
                  : "text-slate-500! hover:text-slate-800! dark:text-slate-400! dark:hover:text-slate-200! bg-transparent!"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
