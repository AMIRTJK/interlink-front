import { useMemo, memo, type CSSProperties } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { getEventStyle, MONTH_GRID_BOTTOM_RESERVE_PX, WeatherType } from "../model";
import { WeatherIcon } from "./WeatherIcon";
import { useWeather } from "../lib/useWeather";
import { useViewportFillOffset } from "../lib/useViewportFillOffset";

interface IMonthViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const WEEKDAYS = [
  { label: "ПН", isWeekend: false },
  { label: "ВТ", isWeekend: false },
  { label: "СР", isWeekend: false },
  { label: "ЧТ", isWeekend: false },
  { label: "ПТ", isWeekend: false },
  { label: "СБ", isWeekend: true },
  { label: "ВС", isWeekend: true },
];

const BASE_CARD = "bg-gradient-to-b from-white to-[#F8FAFC] dark:from-slate-800/70 dark:to-slate-900/70 text-[#1e293b] dark:text-slate-200";

// Тёмные варианты держим в тех же классах: инлайновый градиент перекрывал бы dark:.
const WEATHER_CARD: Record<WeatherType, string> = {
  sun: "bg-gradient-to-b from-[#FFF7ED] to-[#FFEDD5] dark:from-orange-950/50 dark:to-amber-950/30 text-[#1e293b] dark:text-slate-200",
  "sun-cloud": "bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF] dark:from-purple-950/50 dark:to-violet-950/30 text-[#1e293b] dark:text-slate-200",
  rain: "bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] dark:from-sky-950/50 dark:to-blue-950/30 text-[#1e293b] dark:text-slate-200",
  snow: "bg-gradient-to-b from-[#FAF5FF] to-[#EEF2FF] dark:from-indigo-950/50 dark:to-violet-950/30 text-[#1e293b] dark:text-slate-200",
  cloud: "bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] dark:from-slate-800/70 dark:to-slate-700/40 text-[#1e293b] dark:text-slate-200",
};

const OTHER_MONTH_CARD = "bg-gradient-to-b from-white to-[#F8FAFC] dark:from-slate-900/60 dark:to-slate-900/30 opacity-40";

const PAST_CARD = "bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] dark:from-sky-950/30 dark:to-slate-900/50 text-[#1e293b] dark:text-slate-200";

const getMonthCardClassName = (
  weather: WeatherType | null,
  isPreviousOrNextMonth: boolean,
  isPast: boolean = false,
) => {
  if (isPreviousOrNextMonth) return OTHER_MONTH_CARD;
  if (isPast) return PAST_CARD;
  if (!weather) return BASE_CARD;
  return WEATHER_CARD[weather] ?? WEATHER_CARD.cloud;
};

export const MonthView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onEventClick,
}: IMonthViewProps) => {
  const { getWeatherForDate } = useWeather();
  const { ref: gridRef, offset: gridOffset } = useViewportFillOffset<HTMLDivElement>(
    MONTH_GRID_BOTTOM_RESERVE_PX,
  );

  const gridStyle = useMemo(
    () =>
      gridOffset === null
        ? undefined
        : ({ "--month-grid-offset": `${gridOffset}px` } as CSSProperties),
    [gridOffset],
  );

  const tasksMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  return (
    <div className="w-full! flex! flex-col! gap-3!">
      {/* Header Weekdays in Russian */}
      <div className="grid! grid-cols-7! gap-3! text-center! mb-1!">
        {WEEKDAYS.map((day) => (
          <div
            key={day.label}
            className={`py-2! text-xs! font-semibold! tracking-wider! transition-all! flex! items-center! justify-center! rounded-[1.25rem]! border! border-zinc-200! dark:border-slate-700/50! ${
              day.isWeekend
                ? "bg-[#fff7ed]! dark:bg-amber-950/40! text-[#ea580c]! dark:text-amber-400!"
                : "text-slate-400! dark:text-slate-500!"
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div
        ref={gridRef}
        style={gridStyle}
        className="grid! grid-cols-7! gap-3.5! auto-rows-[108px] lg:grid-rows-6 lg:h-[calc(100dvh-var(--month-grid-offset,0px))] lg:min-h-[480px]"
      >
        {daysToShow.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const dayTasks = tasksMap[dateStr] || [];
          const inMonth = day.month() === currentDate.month();
          const isToday = day.isSame(dayjs(), "day");
          const isPast = day.isBefore(dayjs(), "day");
          const dayWeather = getWeatherForDate(day);
          const cardClassName = getMonthCardClassName(
            dayWeather?.weatherType ?? null,
            !inMonth,
            isPast && inMonth,
          );

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={`flex! flex-col! p-2.5! rounded-[1.6rem]! border! border-zinc-200! dark:border-slate-700/50! cursor-pointer! transition-all! duration-200! overflow-hidden! ${cardClassName}`}
            >
              {/* Cell Header: Date on left & White circular weather badge on right (if real weather exists) */}
              <div className="flex! items-center! justify-between! mb-1.5!">
                {isToday ? (
                  <div className="w-6! h-6! flex! items-center! justify-center! text-sm! font-semibold! rounded-full! bg-[#00897b]! text-white!">
                    {day.date()}
                  </div>
                ) : (
                  <span className="text-sm! font-semibold! text-slate-800! dark:text-slate-200! pl-1!">
                    {day.date()}
                  </span>
                )}

                {/* Render weather badge only if real weather data exists */}
                {dayWeather ? (
                  <div className="w-6! h-6! rounded-full! bg-white! dark:bg-slate-800! border! border-zinc-200! dark:border-slate-700/50! flex! items-center! justify-center!">
                    <WeatherIcon type={dayWeather.weatherType} size={13} />
                  </div>
                ) : (
                  <div className="w-6! h-6!" />
                )}
              </div>

              {/* Cell Events List */}
              <div className="flex-1! flex! flex-col! gap-1.5! overflow-y-auto! no-scrollbar!">
                {dayTasks.map((task) => {
                  const style = getEventStyle(task.color);
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(task);
                      }}
                      title={`${task.time ? task.time + " " : ""}${task.title}`}
                      className="w-full! py-1! px-2! rounded-full! bg-white/90! dark:bg-slate-800/90! border! border-zinc-200! dark:border-slate-700/50! text-xs! font-semibold! leading-tight! flex! items-center! gap-1.5! truncate! transition-all!"
                    >
                      <span className={`w-1.5! h-1.5! rounded-full! ${style.dot} flex-shrink-0!`} />
                      <span className={`${style.text} truncate!`}>
                        {task.time ? `${task.time} ` : ""}
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
