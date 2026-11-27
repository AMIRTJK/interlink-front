import React, { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import type { Task } from "@features/tasks";
import { Tooltip } from "@shared/ui";
import { getEventStyle } from "../model";
import { WeatherIcon } from "./WeatherIcon";
import { useWeather } from "../lib/useWeather";
import { useCalendarWeather } from "../lib/useCalendarWeather";
import { WeekColumnDesign, getWeekColumnDesignClass } from "./capsule-designs/WeekColumnDesign";

interface IWeekViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs, selectedHour?: number) => void;
  onHeaderClick?: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const HOUR_HEIGHT = 50;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

const timeToMinutes = (time?: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const getEventPosition = (task: Task) => {
  const startMin = timeToMinutes(task.time);
  const endMin = task.endTime ? timeToMinutes(task.endTime) : startMin + 60;
  const top = (startMin / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.7);
  return { top, height };
};

const formatHourLabel = (h: number) => {
  return `${String(h).padStart(2, "0")}:00`;
};

export const WeekView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onHeaderClick,
  onEventClick,
}: IWeekViewProps) => {
  const { getWeatherForDate } = useWeather();
  const getDayWeather = useCalendarWeather(daysToShow);

  const tasksMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  const now = dayjs();
  const currentMinutes = useMemo(() => {
    const n = dayjs();
    return n.hour() * 60 + n.minute();
  }, []);

  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;
  const currentTimeLabel = now.format("HH:mm");
  const hasTodayInView = useMemo(
    () => daysToShow.some((d) => d.isSame(dayjs(), "day")),
    [daysToShow],
  );

  return (
    <div className="w-full! flex! flex-col! gap-3!">
      {/* Header Day Columns in Russian */}
      <div className="flex! items-center! gap-3! pl-14! mb-1!">
        {daysToShow.map((day) => {
          const isToday = day.isSame(dayjs(), "day");
          const dayWeather = getWeatherForDate(day);

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              onClick={() => (onHeaderClick ? onHeaderClick(day) : onDayClick(day))}
              className={`flex-1! py-2! px-2! rounded-[1.25rem]! flex! items-center! justify-center! gap-1.5! cursor-pointer! transition-all! ${
                isToday
                  ? "bg-[#fff7ed]! dark:bg-amber-950/40! border! border-zinc-200! dark:border-slate-700/50! text-[#c2410c]! dark:text-amber-400!"
                  : "bg-white/80! dark:bg-slate-800/80! border! border-zinc-200! dark:border-slate-700/50! text-slate-700! dark:text-slate-200!"
              }`}
            >
              <span className="text-xs! font-semibold! tracking-wider! uppercase!">
                {day.locale("ru").format("ddd").toUpperCase()} {day.date()}
              </span>
              {dayWeather && <WeatherIcon type={dayWeather.weatherType} size={13} />}
            </div>
          );
        })}
      </div>

      {/* Main Grid Area */}
      <div className="flex! relative! w-full!">
        {/* Time Axis */}
        <div className="w-14! flex-shrink-0! relative!">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex! items-start! justify-end! pr-2.5! text-xs! font-medium! tabular-nums! text-slate-400! dark:text-slate-500!"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="-translate-y-2!">{formatHourLabel(h)}</span>
            </div>
          ))}
        </div>

        {/* 7 Vertical Columns Grid */}
        <div className="flex-1! grid! grid-cols-7! gap-3! relative!">
          {/* Horizontal Grid lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute! left-0! right-0! border-b! border-slate-200/30! dark:border-slate-700/20! pointer-events-none!"
              style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Individual Column Capsules */}
          {daysToShow.map((day, colIdx) => {
            const isToday = day.isSame(dayjs(), "day");
            const dateStr = day.format("YYYY-MM-DD");
            const dayTasks = tasksMap[dateStr] || [];
            const columnWeather = getDayWeather(day);
            const colClassName = getWeekColumnDesignClass(columnWeather);

            return (
              <div
                key={dateStr}
                className={`relative! rounded-[1.8rem]! backdrop-blur-md! cursor-pointer! transition-colors! ${colClassName}`}
                style={{ height: HOUR_HEIGHT * HOURS.length, gridColumn: colIdx + 1 }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const clickedHour = Math.floor(y / HOUR_HEIGHT);
                  onDayClick(day, clickedHour);
                }}
              >
                <WeekColumnDesign weather={columnWeather} />
                {/* Modern Current Time Indicator with Tooltip on hover */}
                {isToday && (
                  <Tooltip title={`Текущее время: ${currentTimeLabel}`} placement="top">
                    <div
                      className="group/timeline absolute! left-0! right-0! z-30! flex! items-center! cursor-pointer! py-1! -my-1!"
                      style={{ top: currentTimeTop }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="w-2.5! h-2.5! rounded-full! bg-teal-500! -ml-1! ring-4! ring-teal-500/25! group-hover/timeline:scale-125! transition-transform!" />
                      <div className="flex-1! h-[2px]! bg-gradient-to-r! from-teal-500! via-teal-500/80! to-teal-500/20! rounded-full! group-hover/timeline:h-[3px]! transition-all!" />
                    </div>
                  </Tooltip>
                )}
                {dayTasks.map((task) => {
                  const { top, height } = getEventPosition(task);
                  const style = getEventStyle(task.color);

                  return (
                    <div
                      key={task.id}
                      className="absolute! left-1.5! right-1.5! z-20!"
                      style={{ top, height }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(task);
                      }}
                    >
                      <div
                        className={`h-full! w-full! rounded-xl! p-2.5! ${style.bg} ${style.border} overflow-hidden! transition-all! cursor-pointer! flex! flex-col! justify-center!`}
                      >
                        <div className={`font-semibold! text-xs! leading-tight! ${style.text} truncate!`}>
                          {task.title}
                        </div>
                        <div className="text-xs! font-medium! leading-tight! opacity-80! truncate!">
                          {task.time} {task.endTime ? `- ${task.endTime}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
