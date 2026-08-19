import { memo } from "react";
import { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import type { ViewMode } from "../model";
import { useWeather } from "../lib/useWeather";
import { WeatherIcon } from "./WeatherIcon";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Dayjs;
}

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: "day", label: "День" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
];

export const CalendarHeader = memo(({
  viewMode,
  setViewMode,
  currentDate,
}: CalendarHeaderProps) => {
  const { getWeatherForDate } = useWeather();
  const dayWeather = getWeatherForDate(currentDate);

  const formatHeaderTitle = () => {
    if (viewMode === "month") {
      const monthName = currentDate.locale("ru").format("MMMM");
      const year = currentDate.format("YYYY");
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    }
    if (viewMode === "week") {
      const start = currentDate.startOf("isoWeek");
      const end = start.add(6, "day");
      return `${start.locale("ru").format("D MMMM")} – ${end.locale("ru").format("D MMMM YYYY")}`;
    }
    return currentDate.locale("ru").format("dddd, D MMMM YYYY");
  };

  const weekNumber = currentDate.isoWeek();

  return (
    <div className="flex! items-center! justify-between! mb-4! w-full! gap-4! flex-wrap!">
      {/* Left Section: Title and Weather (Weather badge shown only for single Day view) */}
      <div className="flex! items-center! gap-3! flex-wrap!">
        <div className="flex! flex-col!">
          <h2 className="text-2xl! font-black! text-slate-800! dark:text-slate-100! m-0! tracking-tight! capitalize!">
            {formatHeaderTitle()}
          </h2>
          {viewMode === "week" && (
            <span className="text-xs! font-bold! text-slate-400! dark:text-slate-500! mt-0.5!">
              Неделя {weekNumber}
            </span>
          )}
        </div>

        {/* Show weather badge in header only in Day mode where it represents a specific single day */}
        {viewMode === "day" && (
          <div className="flex! items-center! gap-2! py-1.5! px-3.5! rounded-full! bg-white/90! dark:bg-slate-800/90! border! border-slate-200/60! dark:border-slate-700/60! shadow-xs! backdrop-blur-md!">
            <WeatherIcon type={dayWeather.weatherType} size={15} />
            <span className="text-xs! font-extrabold! text-slate-800! dark:text-slate-100!">
              {dayWeather.temp}
            </span>
            <span className="text-xs! font-semibold! text-slate-400! dark:text-slate-400!">
              • {dayWeather.description}
            </span>
          </div>
        )}
      </div>

      {/* Right Mode Switcher Segmented Control */}
      <div className="bg-slate-100/90! dark:bg-slate-800/90! backdrop-blur-md! p-1! rounded-full! border! border-slate-200/60! dark:border-slate-700/60! flex! items-center! gap-1!">
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
